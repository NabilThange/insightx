import OpenAI from "openai";
import { AGENTS, getAgentConfig } from './config';
import { getKeyManager } from './key-manager';
import { getToolsForAgent } from './tools';
import { ChatService } from "@/lib/db/chat";
import { ArtifactService } from "@/lib/db/artifacts";
import { ToolExecutor } from './tool-executor';

/**
 * BYTEZ Client Singleton with Automatic Failover
 * Consolidated from redundant bytez-client.ts
 */
class BytezClient {
  private static instance: OpenAI | null = null;
  private static currentKey: string | null = null;
  private static isRefreshing: boolean = false;

  static async getInstance(forceRefresh: boolean = false): Promise<OpenAI> {
    const keyManager = getKeyManager();
    const activeKey = keyManager.getCurrentKey();

    if (!this.instance || this.currentKey !== activeKey || forceRefresh) {
      this.currentKey = activeKey;
      this.instance = new OpenAI({
        apiKey: activeKey,
        baseURL: "https://api.bytez.com/models/v2/openai/v1",
        dangerouslyAllowBrowser: true
      });
      console.log(`🔌 BytezClient connected with key: ...${activeKey.slice(-4)}`);
    }

    return this.instance;
  }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

export interface OrchestrationOptions {
  sessionId: string;
  chatId: string;
  userMessage: string;
  conversationHistory?: ChatMessage[];
  onStatus?: (status: string, data?: any) => void;
  onToken?: (agentId: string, token: string) => void;
  onToolCall?: (agentId: string, toolName: string, args: any) => void;
  stream?: boolean;
}

/**
 * Agent Runner - Executes a single agent with tool support and retries
 * Consolidated from redundant agent-runner.ts
 */
export class AgentRunner {
  private async executeWithRetry<T>(operation: (client: OpenAI) => Promise<T>, agentName: string) {
    const keyManager = getKeyManager();
    const totalKeys = keyManager.getKeyCount();

    for (let attempt = 0; attempt < totalKeys; attempt++) {
      try {
        const client = await BytezClient.getInstance();
        return await operation(client);
      } catch (error: any) {
        console.error(`❌ [AgentRunner] Error in ${agentName} (Attempt ${attempt + 1}/${totalKeys}):`, error.message);

        // Special logging for 404 as requested
        if (error.status === 404) {
          console.error(`🚨 [Bytez 404] Model ID may be incorrect or missing in Bytez catalog.`);
        }

        if (error.status === 429 || error.status === 402 || error.status === 401) {
          keyManager.markCurrentKeyAsFailed(error.message);
          keyManager.rotateKey();
          await BytezClient.getInstance(true);
          continue;
        }
        throw error;
      }
    }
    throw new Error("All API keys exhausted or non-retriable error occurred.");
  }

  async runAgent(options: {
    agentId: string;
    userMessage: string;
    conversationHistory?: ChatMessage[];
    toolExecutor?: ToolExecutor;
    onToken?: (token: string) => void;
    onToolCall?: (toolName: string, args: any) => void;
    stream?: boolean;
  }): Promise<{ content: string; toolResults: Record<string, any> }> {
    const config = getAgentConfig(options.agentId);
    const tools = getToolsForAgent(config.tools);
    const toolExecutor = options.toolExecutor;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: config.systemPrompt },
      ...(options.conversationHistory || []) as any,
      { role: 'user', content: options.userMessage }
    ];

    const toolResults: Record<string, any> = {};

    return this.executeWithRetry(async (client) => {
      let runCycle = 0;
      const MAX_CYCLES = 5;

      while (runCycle < MAX_CYCLES) {
        runCycle++;
        console.log(`🚀 [AgentRunner] Run cycle ${runCycle} for ${config.name}`);
        // Log the message content selectively to avoid bloat but keep context
        console.log(`📝 [Request] Last message: "${(messages[messages.length - 1] as ChatMessage).content?.substring(0, 100)}..."`);


        // If streaming is requested for the final response, handle it here
        if (options.stream && runCycle === 1) { // Only stream the initial response, not tool cycles
          const stream = await client.chat.completions.create({
            model: config.model,
            messages: messages,
            temperature: config.temperature,
            stream: true,
            tools: tools.length > 0 ? tools : undefined
          });

          let fullContent = '';
          for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content || '';
            fullContent += token;
            options.onToken?.(token);
          }
          // For streaming, we assume no tool calls on the first pass if we're streaming content
          // If tool calls are expected, the orchestrator should handle the streaming part
          // and call runAgent with stream: false for internal tool cycles.
          // This implementation assumes `stream: true` means a final content response.
          return { content: fullContent, toolResults };
        }


        const response = await client.chat.completions.create({
          model: config.model,
          messages: messages,
          temperature: config.temperature,
          tools: tools.length > 0 ? tools : undefined,
          stream: false // Internal tool cycles are non-streaming for simplicity
        });

        const message = response.choices[0].message;
        messages.push(message);

        if (message.tool_calls && message.tool_calls.length > 0) {
          if (!toolExecutor) {
            throw new Error(`Agent ${config.name} attempted tool call but no ToolExecutor provided`);
          }

          for (const toolCall of message.tool_calls as any[]) {
            const toolName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);

            console.log(`🔧 [AgentRunner] Executing tool: ${toolName}`);
            options.onToolCall?.(toolName, args);

            const result = await toolExecutor.executeToolCall(toolName, args);
            toolResults[toolName] = result.data || result.error;

            messages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify(result.data || result.error)
            } as any);
          }
          // Continue loop to let agent process tool results
          continue;
        }

        // No tool calls, we have the final answer
        console.log(`✅ [AgentRunner] Final response received for ${config.name}`);
        return {
          content: message.content || "",
          toolResults
        };
      }

      throw new Error(`Agent ${config.name} exceeded max tool cycles (${MAX_CYCLES})`);
    }, config.name);
  }
}

/**
 * Assembly Line Orchestrator - Multi-agent workflow coordinator
 */
export class AssemblyLineOrchestrator {
  private agentRunner = new AgentRunner();
  private chatId: string | null = null;

  constructor(chatId?: string) {
    this.chatId = chatId || null;
  }

  private async getHistory(): Promise<ChatMessage[]> {
    if (this.chatId) {
      try {
        const dbMessages = await ChatService.getMessages(this.chatId);
        return dbMessages.map((m: any) => ({
          role: m.role as any,
          content: m.content || ""
        }));
      } catch (dbError) {
        console.warn('⚠️ [Orchestrator] Could not load history (DB may not be ready):', dbError);
        return []; // Return empty history if DB not ready
      }
    }
    return [];
  }

  async orchestrate(options: any): Promise<any> {
    const { sessionId, userMessage, onStatus } = options;
    const toolExecutor = new ToolExecutor(sessionId);
    await toolExecutor.loadDataDNA();

    onStatus?.('Analyzing query type...');
    const result = await this.agentRunner.runAgent({
      agentId: 'orchestrator',
      userMessage,
      conversationHistory: await this.getHistory(),
      toolExecutor
    });

    return { finalResponse: result.content };
  }

  async *orchestrateStream(options: any): AsyncGenerator<any, void, unknown> {
    const { sessionId, userMessage } = options;
    this.chatId = options.chatId || null;

    const toolExecutor = new ToolExecutor(sessionId);
    await toolExecutor.loadDataDNA();

    yield { type: 'status', message: 'Analyzing query type...' };

    // Save User Message (optional - gracefully handle if DB not ready)
    if (this.chatId) {
      try {
        await ChatService.addMessage({
          chat_id: this.chatId,
          role: 'user',
          content: userMessage,
        });
        console.log('✅ [Orchestrator] User message persisted to DB');
      } catch (dbError) {
        console.warn('⚠️ [Orchestrator] Could not persist user message (DB may not be ready):', dbError);
        // Continue execution - persistence is optional
      }
    }

    try {
      console.log('🤖 [Orchestrator] Running orchestrator agent...');
      const history = await this.getHistory();

      const orchestratorResult = await this.agentRunner.runAgent({
        agentId: 'orchestrator',
        userMessage,
        conversationHistory: history,
        toolExecutor
      });

      const content = orchestratorResult.content;
      console.log('📝 [Orchestrator] Response content:', content.substring(0, 200));

      let classification;
      try {
        classification = JSON.parse(content);
      } catch (e) {
        classification = { classification: 'EXPLAIN_ONLY', reasoning: content };
      }

      yield { type: 'orchestrator_result', data: classification };

      let contextData: any = { classification };
      let lastAgentOutput = content;

      // STAGE 2: Specialist Agents (SQL / Python)
      if (classification.classification === 'SQL_ONLY' || classification.classification === 'SQL_THEN_PY') {
        yield { type: 'status', message: 'Generating and executing SQL query...' };
        const sqlResult = await this.agentRunner.runAgent({
          agentId: 'sql_agent',
          userMessage: `User Query: ${userMessage}\n\nReasoning: ${classification.reasoning}`,
          conversationHistory: history,
          toolExecutor
        });

        contextData.sql_result = sqlResult.content;
        lastAgentOutput = sqlResult.content;
        yield { type: 'sql_result', data: { query: sqlResult.content, results: sqlResult.toolResults.run_sql } };

        if (this.chatId) {
          try {
            await ChatService.addMessage({
              chat_id: this.chatId,
              role: 'assistant',
              content: `SQL Query: ${sqlResult.content}\nResults: ${JSON.stringify(sqlResult.toolResults.run_sql)}`,
              metadata: { agent: 'sql_agent', classification: classification.classification }
            });
            console.log('✅ [Orchestrator] SQL agent output persisted to DB');
          } catch (dbError) {
            console.warn('⚠️ [Orchestrator] Could not persist SQL agent output:', dbError);
          }
        }
      }

      if (classification.classification === 'PY_ONLY' || classification.classification === 'SQL_THEN_PY') {
        yield { type: 'status', message: 'Performing statistical analysis with Python...' };
        const pythonResult = await this.agentRunner.runAgent({
          agentId: 'python_agent',
          userMessage: `User Query: ${userMessage}\n\nContext: ${lastAgentOutput}`,
          conversationHistory: history,
          toolExecutor
        });

        contextData.python_result = pythonResult.content;
        lastAgentOutput = pythonResult.content;
        yield { type: 'python_result', data: { code: pythonResult.content, results: pythonResult.toolResults.run_python } };

        if (this.chatId) {
          try {
            await ChatService.addMessage({
              chat_id: this.chatId,
              role: 'assistant',
              content: `Python Code: ${pythonResult.content}\nResults: ${JSON.stringify(pythonResult.toolResults.run_python)}`,
              metadata: { agent: 'python_agent', classification: classification.classification }
            });
            console.log('✅ [Orchestrator] Python agent output persisted to DB');
          } catch (dbError) {
            console.warn('⚠️ [Orchestrator] Could not persist Python agent output:', dbError);
          }
        }
      }

      // STAGE 3: Final Response (Composer / Explainer)
      let finalResponse;
      if (classification.classification === 'EXPLAIN_ONLY') {
        yield { type: 'status', message: 'Drafting explanation...' };
        finalResponse = await this.agentRunner.runAgent({
          agentId: 'explainer',
          userMessage: `Explain this to the user: ${classification.reasoning}`,
          conversationHistory: history,
          toolExecutor
        });
      } else {
        yield { type: 'status', message: 'Synthesizing final answer...' };
        finalResponse = await this.agentRunner.runAgent({
          agentId: 'composer',
          userMessage: `Synthesize a final response for the user.\n\nUser Query: ${userMessage}\n\nAnalysis Results: ${JSON.stringify(contextData)}`,
          conversationHistory: history,
          toolExecutor
        });
      }

      const finalContent = finalResponse.content;

      // Save Assistant Message
      if (this.chatId) {
        try {
          await ChatService.addMessage({
            chat_id: this.chatId,
            role: 'assistant',
            content: finalContent
          });
          console.log('✅ [Orchestrator] Assistant response persisted to DB');
        } catch (dbError) {
          console.warn('⚠️ [Orchestrator] Could not persist assistant response:', dbError);
        }
      }

      yield {
        type: 'final_response',
        data: {
          text: finalContent,
          classification: classification.classification
        }
      };

    } catch (error: any) {
      console.error("❌ [Orchestrator] Failed:", error);
      console.error("📋 [Orchestrator] Error stack:", error.stack);
      throw error; // Re-throw to be caught by API route
    }
  }
}
