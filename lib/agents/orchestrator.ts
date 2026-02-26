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
      const MAX_CYCLES = 8;

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

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🚀 [ORCHESTRATOR] STARTING NEW ORCHESTRATION');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📝 User Message: "${userMessage}"`);
    console.log(`🔑 Session ID: ${sessionId}`);
    console.log(`💬 Chat ID: ${this.chatId}`);

    // Create tool executor with code write callback and tool call callback
    const toolExecutor = new ToolExecutor(
      sessionId, 
      (code: string, language: string, description?: string) => {
        // Code write callback - writeCode() already saves to DB
        // This callback is just for logging/debugging
        console.log(`📝 [Code Written] ${language.toUpperCase()} code saved to workspace_sidebar`);
        console.log(`📝 [Code Preview] ${code.substring(0, 100)}...`);
      },
      (toolName: string, status: 'start' | 'success' | 'error', data?: any) => {
        // Emit tool call events
        if (status === 'start') {
          console.log(`🔧 [Tool Call] Starting: ${toolName}`);
        } else if (status === 'success') {
          console.log(`✅ [Tool Call] Success: ${toolName} (${data?.executionTime}ms)`);
        } else if (status === 'error') {
          console.log(`❌ [Tool Call] Error: ${toolName} - ${data?.error}`);
        }
      }
    );
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

    // Load conversation history BEFORE using it
    const history = await this.getHistory();

    try {
      console.log('\n📍 STAGE 0: DATA DNA AGENT (Quick Lookup)');
      console.log('─────────────────────────────────────────────────────────────');
      console.log('🧬 [Data DNA Agent] Checking if question can be answered from metadata...');
      
      yield { type: 'toast', message: '🧬 Checking Data DNA...', data: { agent: 'DATA_DNA', status: 'checking' } };
      
      const dataDnaResult = await this.agentRunner.runAgent({
        agentId: 'data_dna_agent',
        userMessage,
        conversationHistory: history,
        toolExecutor
      });

      // Log raw response for debugging
      console.log('🧬 [Data DNA Agent] Raw response:', dataDnaResult.content);

      let dataDnaResponse;
      try {
        // Try to clean markdown code blocks if present
        let cleanedContent = dataDnaResult.content.trim();
        const jsonMatch = cleanedContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          cleanedContent = jsonMatch[1];
          console.log('🧹 [Data DNA Agent] Stripped markdown wrapper');
        }
        
        dataDnaResponse = JSON.parse(cleanedContent);
        console.log('✅ [Data DNA Agent] Response:', dataDnaResponse.can_answer ? 'CAN ANSWER' : 'NEEDS ORCHESTRATION');
      } catch (e) {
        console.error('❌ [Data DNA Agent] Failed to parse response as JSON');
        console.error('   Raw content:', dataDnaResult.content);
        console.error('   Parse error:', e);
        console.warn('⚠️ [Data DNA Agent] Falling back to Orchestrator due to parse failure');
        dataDnaResponse = { can_answer: false, needs_orchestration: true };
      }

      // If Data DNA Agent can answer, return early
      // Check both 'answer' and 'text' fields since response format may vary
      const answer = dataDnaResponse.answer ?? dataDnaResponse.text;
      if (dataDnaResponse.can_answer && answer) {
        console.log('✨ [Data DNA Agent] Question answered from metadata - short-circuiting pipeline');
        
        yield { 
          type: 'toast', 
          message: '✨ Found answer in Data DNA!',
          data: { 
            agent: 'DATA_DNA', 
            reasoning: 'Question answered directly from dataset metadata',
            status: 'success'
          } 
        };

        // Build the full response object with all fields from Data DNA Agent
        const fullResponse = {
          text: answer,
          chart_spec: dataDnaResponse.chart_spec,
          metrics: dataDnaResponse.metrics,
          confidence: dataDnaResponse.confidence,
          follow_ups: dataDnaResponse.follow_ups,
          reasoning: dataDnaResponse.reasoning,
          data_sources: dataDnaResponse.data_sources
        };

        // Save the full response to DB (as JSON string to preserve structure)
        if (this.chatId) {
          try {
            await ChatService.addMessage({
              chat_id: this.chatId,
              role: 'assistant',
              content: JSON.stringify(fullResponse)
            });
            console.log('✅ [Data DNA Agent] Full response persisted to DB');
            if (dataDnaResponse.chart_spec) {
              console.log('📊 [Data DNA Agent] Chart spec included in response');
            }
          } catch (dbError) {
            console.warn('⚠️ [Data DNA Agent] Could not persist answer:', dbError);
          }
        }

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('✅ ORCHESTRATION COMPLETE (Data DNA Short-Circuit)');
        console.log('═══════════════════════════════════════════════════════════════\n');

        yield {
          type: 'final_response',
          data: {
            text: answer,
            chart_spec: dataDnaResponse.chart_spec,
            metrics: dataDnaResponse.metrics,
            confidence: dataDnaResponse.confidence,
            follow_ups: dataDnaResponse.follow_ups,
            reasoning: dataDnaResponse.reasoning,
            data_sources: dataDnaResponse.data_sources,
            classification: 'DATA_DNA_ONLY'
          }
        };
        return;
      }

      // Check if Data DNA Agent explicitly needs orchestration
      if (dataDnaResponse.needs_orchestration) {
        console.log('🔄 [Data DNA Agent] Needs orchestration - automatically calling Orchestrator...');
        yield { 
          type: 'toast', 
          message: '🔄 Routing to Orchestrator for execution...',
          data: { 
            agent: 'DATA_DNA', 
            status: 'routing',
            reasoning: dataDnaResponse.reasoning 
          } 
        };
      } else {
        console.log('→ [Data DNA Agent] Cannot answer from metadata, proceeding to Orchestrator...');
        yield { type: 'toast', message: '→ Proceeding to Orchestrator...', data: { agent: 'DATA_DNA', status: 'proceeding' } };
      }

      console.log('\n📍 STAGE 1: ORCHESTRATOR AGENT');
      console.log('─────────────────────────────────────────────────────────────');
      console.log('🤖 [Orchestrator] Running orchestrator agent...');
      
      yield { type: 'toast', message: '🤖 Analyzing query intent...', data: { agent: 'ORCHESTRATOR', status: 'analyzing' } };

      const orchestratorResult = await this.agentRunner.runAgent({
        agentId: 'orchestrator',
        userMessage,
        conversationHistory: history,
        toolExecutor
      });

      const content = orchestratorResult.content;
      console.log('📄 [Orchestrator] Raw response:', content);

      let classification;
      try {
        classification = JSON.parse(content);
        console.log('✅ [Orchestrator] Successfully parsed JSON:', classification.classification);
      } catch (e) {
        console.warn('⚠️ [Orchestrator] Failed to parse JSON, attempting extraction...');
        
        // Strategy 1: Try to extract JSON from markdown code blocks
        let jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          try {
            classification = JSON.parse(jsonMatch[1]);
            console.log('✅ [Orchestrator] Extracted JSON from markdown code block:', classification.classification);
          } catch (e2) {
            console.warn('⚠️ [Orchestrator] Failed to parse markdown JSON, trying next strategy...');
          }
        }
        
        // Strategy 2: Try to find any JSON object in the response
        if (!classification) {
          jsonMatch = content.match(/\{[\s\S]*?"classification"[\s\S]*?\}/);
          if (jsonMatch) {
            try {
              classification = JSON.parse(jsonMatch[0]);
              console.log('✅ [Orchestrator] Extracted JSON via regex:', classification.classification);
            } catch (e2) {
              console.warn('⚠️ [Orchestrator] Failed to parse extracted JSON, trying next strategy...');
            }
          }
        }
        
        // Strategy 3: Intelligent fallback based on content analysis
        if (!classification) {
          console.error('❌ [Orchestrator] No valid JSON found. Analyzing content for classification...');
          
          // Check if the response contains code examples (indicates EXPLAIN_ONLY was wrongly chosen)
          const hasCodeBlocks = content.includes('```python') || content.includes('```sql');
          const userQuery = userMessage.toLowerCase();
          
          // Detect execution intent from user message
          const executionKeywords = ['write', 'run', 'execute', 'generate', 'create'];
          const hasExecutionIntent = executionKeywords.some(kw => userQuery.includes(kw));
          
          if (hasExecutionIntent && hasCodeBlocks) {
            // User wanted execution but got explanation - fix the classification
            if (content.includes('```python') || userQuery.includes('python')) {
              console.log('🔧 [Orchestrator] Auto-correcting to PY_ONLY based on content analysis');
              classification = { 
                classification: 'PY_ONLY', 
                reasoning: 'User requested Python code execution (auto-corrected from malformed response)',
                columns_needed: [],
                metrics_needed: [],
                next_agents: ['python_agent']
              };
            } else if (content.includes('```sql') || userQuery.includes('sql')) {
              console.log('🔧 [Orchestrator] Auto-correcting to SQL_ONLY based on content analysis');
              classification = { 
                classification: 'SQL_ONLY', 
                reasoning: 'User requested SQL code execution (auto-corrected from malformed response)',
                columns_needed: [],
                metrics_needed: [],
                next_agents: ['sql_agent']
              };
            } else {
              classification = { classification: 'EXPLAIN_ONLY', reasoning: content };
            }
          } else {
            classification = { classification: 'EXPLAIN_ONLY', reasoning: content };
          }
        }
      }

      console.log('\n🎯 CLASSIFICATION RESULT:');
      console.log(`   Type: ${classification.classification}`);
      console.log(`   Reasoning: ${classification.reasoning}`);

      // Emit toast for agent selection
      const agentNames: Record<string, string> = {
        'SQL_ONLY': 'SQL Agent',
        'PY_ONLY': 'Python Analyst',
        'SQL_THEN_PY': 'SQL + Python Analysis',
        'EXPLAIN_ONLY': 'Explainer Agent'
      };
      
      const selectedAgent = agentNames[classification.classification] || 'Explainer Agent';
      console.log(`\n✨ TOAST: Using ${selectedAgent}`);
      
      yield { 
        type: 'toast', 
        message: `Using ${selectedAgent}`,
        data: { 
          agent: classification.classification, 
          reasoning: classification.reasoning 
        } 
      };

      yield { type: 'orchestrator_result', data: classification };

      let contextData: any = { classification };
      let lastAgentOutput = content;

      // STAGE 2: Specialist Agents (SQL / Python)
      if (classification.classification === 'SQL_ONLY' || classification.classification === 'SQL_THEN_PY') {
        console.log('\n📍 STAGE 2A: SQL AGENT');
        console.log('─────────────────────────────────────────────────────────────');
        console.log('🔍 [SQL Agent] Generating and executing SQL query...');
        
        yield { type: 'toast', message: '🔍 SQL Agent: Generating query...', data: { agent: 'SQL_AGENT', status: 'generating' } };
        
        yield { type: 'status', message: 'Generating and executing SQL query...' };
        const sqlResult = await this.agentRunner.runAgent({
          agentId: 'sql_agent',
          userMessage: `User Query: ${userMessage}\n\nReasoning: ${classification.reasoning}`,
          conversationHistory: history,
          toolExecutor
        });

        console.log('📄 [SQL Agent] Raw response:', sqlResult.content);
        console.log('✅ [SQL Agent] Query generated and executed');
        console.log(`   Tool Results: ${JSON.stringify(sqlResult.toolResults).substring(0, 100)}...`);

        yield { type: 'toast', message: '✅ SQL Query executed successfully', data: { agent: 'SQL_AGENT', status: 'success', rows: sqlResult.toolResults.run_sql?.rows?.length || 0 } };

        contextData.sql_result = sqlResult.content;
        contextData.sql_tool_results = sqlResult.toolResults.run_sql;
        lastAgentOutput = sqlResult.content;
        
        yield { type: 'sql_result', data: { query: sqlResult.content, results: sqlResult.toolResults.run_sql } };

        // DO NOT save intermediate SQL results to DB - only final Composer response should be saved
      }

      if (classification.classification === 'PY_ONLY' || classification.classification === 'SQL_THEN_PY') {
        console.log('\n📍 STAGE 2B: PYTHON AGENT');
        console.log('─────────────────────────────────────────────────────────────');
        console.log('📊 [Python Agent] Performing statistical analysis...');
        
        yield { type: 'toast', message: '📊 Python Agent: Running analysis...', data: { agent: 'PYTHON_AGENT', status: 'analyzing' } };
        
        yield { type: 'status', message: 'Performing statistical analysis with Python...' };
        const pythonResult = await this.agentRunner.runAgent({
          agentId: 'python_agent',
          userMessage: `User Query: ${userMessage}\n\nContext: ${lastAgentOutput}`,
          conversationHistory: history,
          toolExecutor
        });

        console.log('📄 [Python Agent] Raw response:', pythonResult.content);
        console.log('✅ [Python Agent] Analysis completed');
        console.log(`   Results: ${JSON.stringify(pythonResult.toolResults).substring(0, 100)}...`);

        yield { type: 'toast', message: '✅ Python analysis completed', data: { agent: 'PYTHON_AGENT', status: 'success' } };

        contextData.python_result = pythonResult.content;
        contextData.python_tool_results = pythonResult.toolResults.run_python;
        lastAgentOutput = pythonResult.content;
        
        yield { type: 'python_result', data: { code: pythonResult.content, results: pythonResult.toolResults.run_python } };

        // DO NOT save intermediate Python results to DB - only final Composer response should be saved
      }

      // STAGE 3: Final Response (Composer / Explainer)
      console.log('\n📍 STAGE 3: FINAL RESPONSE AGENT');
      console.log('─────────────────────────────────────────────────────────────');
      
      let finalResponse;
      if (classification.classification === 'EXPLAIN_ONLY') {
        console.log('💡 [Explainer Agent] Drafting explanation...');
        yield { type: 'toast', message: '💡 Explainer: Drafting explanation...', data: { agent: 'EXPLAINER', status: 'drafting' } };
        yield { type: 'status', message: 'Drafting explanation...' };
        finalResponse = await this.agentRunner.runAgent({
          agentId: 'explainer',
          userMessage: `Explain this to the user: ${classification.reasoning}`,
          conversationHistory: history,
          toolExecutor
        });
        console.log('📄 [Explainer Agent] Raw response:', finalResponse.content);
        console.log('✅ [Explainer Agent] Explanation generated');
        yield { type: 'toast', message: '✅ Explanation ready', data: { agent: 'EXPLAINER', status: 'success' } };
      } else {
        console.log('🎨 [Composer Agent] Synthesizing final answer...');
        yield { type: 'toast', message: '🎨 Composer: Synthesizing response...', data: { agent: 'COMPOSER', status: 'synthesizing' } };
        yield { type: 'status', message: 'Synthesizing final answer...' };
        
        // Build a clear, structured context for the Composer
        let composerContext = `User Query: "${userMessage}"\n\n`;
        composerContext += `Classification: ${classification.classification}\n`;
        composerContext += `Reasoning: ${classification.reasoning}\n\n`;
        
        if (contextData.sql_result) {
          composerContext += `=== SQL ANALYSIS ===\n`;
          composerContext += `SQL Query Executed:\n${contextData.sql_result}\n\n`;
          if (contextData.sql_tool_results) {
            composerContext += `SQL Results:\n${JSON.stringify(contextData.sql_tool_results, null, 2)}\n\n`;
          }
        }
        
        if (contextData.python_result) {
          composerContext += `=== PYTHON ANALYSIS ===\n`;
          composerContext += `Python Code Executed:\n${contextData.python_result}\n\n`;
          if (contextData.python_tool_results) {
            composerContext += `Python Results:\n${JSON.stringify(contextData.python_tool_results, null, 2)}\n\n`;
          }
        }
        
        composerContext += `\nYour task: Synthesize the above analysis into a user-friendly response following the JSON format specified in your system prompt.`;
        
        finalResponse = await this.agentRunner.runAgent({
          agentId: 'composer',
          userMessage: composerContext,
          conversationHistory: history,
          toolExecutor
        });
        console.log('📄 [Composer Agent] Raw response:', finalResponse.content);
        console.log('✅ [Composer Agent] Final response synthesized');
        yield { type: 'toast', message: '✅ Response synthesized', data: { agent: 'COMPOSER', status: 'success' } };
      }

      // Save Assistant Message
      if (this.chatId) {
        try {
          await ChatService.addMessage({
            chat_id: this.chatId,
            role: 'assistant',
            content: finalResponse.content
          });
          console.log('✅ [Orchestrator] Assistant response persisted to DB');
        } catch (dbError) {
          console.warn('⚠️ [Orchestrator] Could not persist assistant response:', dbError);
        }
      }

      console.log('\n═══════════════════════════════════════════════════════════════');
      console.log('✅ ORCHESTRATION COMPLETE');
      console.log('═══════════════════════════════════════════════════════════════\n');

      yield {
        type: 'final_response',
        data: {
          text: finalResponse.content,
          classification: classification.classification
        }
      };

    } catch (error: any) {
      console.error('\n═══════════════════════════════════════════════════════════════');
      console.error("❌ [ORCHESTRATOR] ORCHESTRATION FAILED");
      console.error('═══════════════════════════════════════════════════════════════');
      console.error("Error:", error.message);
      console.error("📋 Stack:", error.stack);
      console.error('═══════════════════════════════════════════════════════════════\n');
      throw error; // Re-throw to be caught by API route
    }
  }
}
