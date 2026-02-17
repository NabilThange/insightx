# Reference Project Analysis - Key Patterns to Adopt

## Overview

The reference project (hardware/IoT platform) has a **mature, production-ready orchestration system** that we can adapt for InsightX. This document extracts the key patterns and explains how to apply them to our analytics use case.

## 1. Multi-Agent Orchestration Pattern

### Reference Implementation
```typescript
// Step 1: Orchestrator classifies intent
const intentResult = await runner.runAgent('orchestrator', messages);
const intent = intentResult.response.trim().toUpperCase(); // "BOM", "CODE", "WIRING", etc.

// Step 2: Route to specialist agent
const agentMap = {
  'BOM': 'bomGenerator',
  'CODE': 'codeGenerator',
  'WIRING': 'wiringDiagram',
  'CHAT': 'conversational'
};
const finalAgent = agentMap[intent] || 'conversational';

// Step 3: Execute specialist agent
const result = await runner.runAgent(finalAgent, history, { onToolCall });
```

### Our Adaptation for InsightX
```typescript
// Step 1: Orchestrator classifies query type
const classification = await runner.runAgent('orchestrator', messages);
const parsed = JSON.parse(classification.response);
// { classification: "SQL_ONLY", reasoning: "...", columns_needed: [...] }

// Step 2: Route to specialist agent(s)
if (parsed.classification === 'SQL_ONLY') {
  const sqlResult = await runner.runAgent('sql_agent', messages, { onToolCall });
  // Compose final response
  const final = await runner.runAgent('composer', [sqlResult], { onToolCall });
}
else if (parsed.classification === 'SQL_THEN_PY') {
  // Hybrid: SQL first, then Python
  const sqlResult = await runner.runAgent('sql_agent', messages, { onToolCall });
  const pythonResult = await runner.runAgent('python_agent', [sqlResult], { onToolCall });
  const final = await runner.runAgent('composer', [sqlResult, pythonResult], { onToolCall });
}
```

**Key Insight**: Orchestrator returns structured JSON with classification + reasoning, not just a string.

---

## 2. Tool Execution Pattern

### Reference Implementation
```typescript
// Tool definition
export const UPDATE_BOM_TOOL = {
  type: 'function',
  function: {
    name: 'update_bom',
    description: 'Update the Bill of Materials with components',
    parameters: {
      type: 'object',
      properties: {
        components: { type: 'array', items: { type: 'object' } },
        totalCost: { type: 'number' }
      },
      required: ['components']
    }
  }
};

// Tool executor
async executeToolCall(toolCall: ToolCall) {
  switch (toolCall.name) {
    case 'update_bom':
      return await this.updateBOM(toolCall.arguments);
    case 'add_code_file':
      return await this.addCodeFile(toolCall.arguments);
    // ...
  }
}

// Persistence
private async updateBOM(bomData: any) {
  const { id, currentVersion } = await this.getOrCreateArtifact('bom', 'Bill of Materials');
  const version = await ArtifactService.createVersion({
    artifact_id: id,
    version_number: currentVersion + 1,
    content_json: bomData,
    change_summary: "Updated via tool call"
  });
  return { success: true, artifact_id: id, version: version.version_number };
}
```

### Our Adaptation for InsightX
```typescript
// Tool definitions
export const READ_DATA_DNA_TOOL = {
  type: 'function',
  function: {
    name: 'read_data_dna',
    description: 'Read dataset metadata including columns, baselines, patterns',
    parameters: {
      type: 'object',
      properties: {
        sections: { type: 'array', items: { type: 'string' } }
      },
      required: []
    }
  }
};

export const RUN_SQL_TOOL = {
  type: 'function',
  function: {
    name: 'run_sql',
    description: 'Execute DuckDB SQL query against Parquet dataset',
    parameters: {
      type: 'object',
      properties: {
        sql: { type: 'string' },
        limit: { type: 'number' }
      },
      required: ['sql']
    }
  }
};

// Tool executor
async executeToolCall(toolCall: ToolCall) {
  switch (toolCall.name) {
    case 'read_data_dna':
      return await this.readDataDNA(toolCall.arguments);
    case 'run_sql':
      return await this.runSQL(toolCall.arguments);
    case 'run_python':
      return await this.runPython(toolCall.arguments);
    // ...
  }
}

// Persistence
private async runSQL(args: { sql: string; limit?: number }) {
  // Execute SQL via DuckDB
  const results = await duckdb.query(args.sql, { limit: args.limit || 500 });
  
  // Store in artifacts
  const { id } = await this.getOrCreateArtifact('sql_result', 'SQL Query Result');
  await ArtifactService.createVersion({
    artifact_id: id,
    version_number: currentVersion + 1,
    content: args.sql,
    content_json: { query: args.sql, results },
    change_summary: "SQL query executed"
  });
  
  return { success: true, rows: results.length, data: results };
}
```

**Key Insight**: Every tool call is persisted to the artifacts table for audit trail and context.

---

## 3. Toast Notification Pattern

### Reference Implementation
```typescript
// toast-notifications.ts
import { createToaster } from '@ark-ui/react/toast';

let apiToaster: CreateToasterReturn | null = null;

function getToaster(): CreateToasterReturn {
  if (!apiToaster) {
    apiToaster = createToaster({
      placement: 'top-end',
      overlap: true,
      gap: 16,
      max: 5,
      duration: 5000,
    });
  }
  return apiToaster;
}

export function showAgentChangeToast(agentId: string) {
  if (typeof window === 'undefined') return; // Server-side guard
  
  const agentIdentity = getAgentIdentity(agentId);
  getToaster().success({
    title: 'Agent Active',
    description: `${agentIdentity.icon} ${agentIdentity.name} is now handling your request.`,
    duration: 5000,
  });
}

export function showToolCallToast(toolName: string) {
  if (typeof window === 'undefined') return;
  
  const display = TOOL_DISPLAY_NAMES[toolName] || { name: toolName, icon: '⚙️' };
  getToaster().success({
    title: `Agent called ${toolName}`,
    description: `${display.icon} ${display.name}`,
    duration: 4000,
  });
}

export function showKeyRotationSuccessToast(newKeyIndex: number) {
  if (typeof window === 'undefined') return;
  
  getToaster().success({
    title: '✅ API Key Rotated Successfully',
    description: `Now using backup key #${newKeyIndex + 1}. Continuing your request...`,
    duration: 5000,
  });
}
```

### Our Adaptation for InsightX
```typescript
// Same pattern, different agent names
const AGENT_IDENTITIES = {
  'orchestrator': { name: 'Query Analyzer', icon: '🎯' },
  'sql_agent': { name: 'SQL Agent', icon: '🔍' },
  'python_agent': { name: 'Python Analyst', icon: '📊' },
  'composer': { name: 'Response Composer', icon: '🎨' },
  'explainer': { name: 'Explainer', icon: '💡' }
};

const TOOL_DISPLAY_NAMES = {
  'read_data_dna': { name: 'Data DNA Read', icon: '📖' },
  'run_sql': { name: 'SQL Query Executed', icon: '🔍' },
  'run_python': { name: 'Python Analysis', icon: '📊' },
  'read_context': { name: 'Context Retrieved', icon: '🧠' },
  'write_context': { name: 'Insight Saved', icon: '💾' }
};

// Usage in orchestrator
async chat(userMessage: string, onStream?: (chunk: string) => void) {
  // 1. Classify
  const classification = await this.runner.runAgent('orchestrator', messages);
  
  // 2. Show agent toast IMMEDIATELY
  showAgentChangeToast(classification.agentType);
  
  // 3. Execute with tool callbacks
  const result = await this.runner.runAgent(
    classification.agentType,
    messages,
    {
      onToolCall: (toolCall) => {
        showToolCallToast(toolCall.name); // Toast on every tool call
      }
    }
  );
}
```

**Key Insight**: Toast notifications are **non-blocking** and **immediate** - they fire as soon as the event happens, not after completion.

---

## 4. API Key Management Pattern

### Reference Implementation
```typescript
// key-manager.ts
export class KeyManager {
  private static instance: KeyManager | null = null;
  private keys: string[] = [];
  private currentIndex: number = 0;
  private failedKeys: Set<number> = new Set();
  private lastEvent: KeyRotationEvent | null = null;

  static getInstance(): KeyManager {
    if (!this.instance) {
      this.instance = new KeyManager();
    }
    return this.instance;
  }

  private constructor() {
    // Load keys from environment
    for (let i = 1; i <= 12; i++) {
      const key = process.env[`BYTEZ_API_KEY_${i}`] || 
                  process.env[`NEXT_PUBLIC_BYTEZ_API_KEY_${i}`];
      if (key) this.keys.push(key);
    }
  }

  getCurrentKey(): string {
    return this.keys[this.currentIndex];
  }

  rotateKey(): boolean {
    const totalKeys = this.keys.length;
    for (let i = 0; i < totalKeys; i++) {
      const nextIndex = (this.currentIndex + 1) % totalKeys;
      if (!this.failedKeys.has(nextIndex)) {
        this.currentIndex = nextIndex;
        this.lastEvent = {
          type: 'rotation',
          oldKeyIndex: this.currentIndex - 1,
          newKeyIndex: nextIndex,
          reason: 'quota_exhausted'
        };
        return true;
      }
    }
    return false; // All keys failed
  }

  markCurrentKeyAsFailed(): void {
    this.failedKeys.add(this.currentIndex);
  }

  getAndClearLastEvent(): KeyRotationEvent | null {
    const event = this.lastEvent;
    this.lastEvent = null;
    return event;
  }
}

// Usage in AgentRunner
private async executeWithRetry<T>(operation: (client: OpenAI) => Promise<T>) {
  const keyManager = KeyManager.getInstance();
  const totalKeys = keyManager.getTotalKeys();

  for (let attempt = 0; attempt < totalKeys; attempt++) {
    try {
      const client = await BytezClient.getInstance();
      return await operation(client);
    } catch (error: any) {
      if (error.status === 429 || error.status === 402) {
        keyManager.markCurrentKeyAsFailed();
        const rotated = keyManager.rotateKey();
        if (!rotated) {
          throw new Error("All API keys exhausted");
        }
        await BytezClient.getInstance(true); // Force refresh
        continue; // Retry with new key
      }
      throw error; // Non-quota error
    }
  }
}

// In orchestrator, after agent completes
const keyRotationEvent = KeyManager.getInstance().getAndClearLastEvent();
if (keyRotationEvent && onKeyRotation) {
  onKeyRotation(keyRotationEvent); // Trigger toast
}
```

### Our Adaptation for InsightX
**Exact same pattern** - no changes needed! Just ensure:
1. 12 keys in .env.local (BYTEZ_API_KEY_1 through BYTEZ_API_KEY_12)
2. KeyManager singleton initialized on first use
3. Toast callback wired up in orchestrator

**Key Insight**: Key rotation is **transparent** to the user - they only see a toast notification, the request continues seamlessly.

---

## 5. Context Injection Pattern

### Reference Implementation
```typescript
// context-builder.ts
export class AgentContextBuilder {
  constructor(private chatId: string) {}

  async buildDynamicContext(): Promise<string | null> {
    const parts: string[] = [];

    // 1. Get conversation summary
    const summarizer = new ConversationSummarizer(this.chatId);
    const summary = await summarizer.getSummaryForContext();
    if (summary) {
      parts.push('📝 CONVERSATION SUMMARY');
      parts.push(summary);
    }

    // 2. Get latest artifacts
    const bom = await ArtifactService.getLatestArtifact(this.chatId, 'bom');
    if (bom?.version) {
      parts.push('🔧 CURRENT BOM');
      parts.push(JSON.stringify(bom.version.content_json, null, 2));
    }

    // 3. Get code files
    const code = await ArtifactService.getLatestArtifact(this.chatId, 'code');
    if (code?.version) {
      const files = code.version.content_json?.files || [];
      parts.push(`💻 CODE FILES (${files.length})`);
      files.forEach(f => parts.push(`- ${f.path}`));
    }

    return parts.length > 0 ? parts.join('\n\n') : null;
  }
}

// Usage in orchestrator
async runAgent(agentType: AgentType, messages: any[], options?: { chatId?: string }) {
  let systemPrompt = agent.systemPrompt;

  if (options?.chatId) {
    const contextBuilder = new AgentContextBuilder(options.chatId);
    const dynamicContext = await contextBuilder.buildDynamicContext();
    if (dynamicContext) {
      systemPrompt = `${agent.systemPrompt}\n\n${dynamicContext}`;
    }
  }

  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  return await this.executeWithRetry(async (client) => {
    return await client.chat.completions.create({ model, messages: fullMessages });
  });
}
```

### Our Adaptation for InsightX
```typescript
// context-builder.ts
export class AgentContextBuilder {
  constructor(private sessionId: string) {}

  async buildDynamicContext(): Promise<string | null> {
    const parts: string[] = [];

    // 1. Get Data DNA
    const session = await getSession(this.sessionId);
    if (session.data_dna) {
      parts.push('📊 DATASET CONTEXT');
      parts.push(`Dataset: ${session.data_dna.filename}`);
      parts.push(`Rows: ${session.data_dna.rowCount}`);
      parts.push(`Columns: ${session.data_dna.columns.map(c => c.name).join(', ')}`);
      parts.push(`Baselines: ${JSON.stringify(session.data_dna.baselines)}`);
    }

    // 2. Get accumulated insights
    const insights = await ArtifactService.getLatestArtifact(this.sessionId, 'insights');
    if (insights?.version) {
      parts.push('🧠 ACCUMULATED INSIGHTS');
      parts.push(insights.version.content);
    }

    // 3. Get recent SQL queries
    const sqlHistory = await ArtifactService.getLatestArtifacts(this.sessionId, 'sql_result', 5);
    if (sqlHistory.length > 0) {
      parts.push('🔍 RECENT QUERIES');
      sqlHistory.forEach(h => parts.push(`- ${h.version.content}`));
    }

    return parts.length > 0 ? parts.join('\n\n') : null;
  }
}
```

**Key Insight**: Context is **dynamically built** for each agent call, not stored in messages array. This keeps token usage low.

---

## 6. Streaming Response Pattern

### Reference Implementation
```typescript
// orchestrator.ts
async chat(userMessage: string, onStream?: (chunk: string) => void) {
  // ... classification ...

  const result = await this.runner.runAgent(
    finalAgentType,
    history,
    {
      stream: true,
      onStream: (chunk) => {
        onStream?.(chunk); // Forward to client
      },
      onToolCall: async (toolCall) => {
        showToolCallToast(toolCall.name);
        if (toolExecutor) {
          await toolExecutor.executeToolCall(toolCall);
        }
      }
    }
  );
}

// In API route
export async function POST(request: NextRequest) {
  const { message, chatId } = await request.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const orchestrator = new AssemblyLineOrchestrator(chatId);

      await orchestrator.chat(
        message,
        (chunk) => {
          // Stream text chunks
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', data: chunk })}\n\n`));
        },
        undefined, // forceAgent
        (agent) => {
          // Stream agent selection
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'agent', data: agent })}\n\n`));
        },
        (toolCall) => {
          // Stream tool calls
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'tool', data: toolCall })}\n\n`));
        }
      );

      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}
```

### Our Adaptation for InsightX
**Exact same pattern** - already partially implemented in your `app/api/chat/stream/route.ts`!

Just need to add:
1. Agent selection callback
2. Tool call callback
3. Key rotation callback

**Key Insight**: SSE streaming allows **real-time updates** without WebSockets. Client receives events as they happen.

---

## 7. Database Schema Pattern

### Reference Schema (Hardware Project)
```sql
-- Artifacts table (stores all generated content)
CREATE TABLE artifacts (
  id UUID PRIMARY KEY,
  chat_id UUID REFERENCES chats(id),
  type TEXT, -- 'bom', 'code', 'wiring', 'budget'
  title TEXT,
  current_version INTEGER,
  created_at TIMESTAMP
);

-- Artifact versions (version control)
CREATE TABLE artifact_versions (
  id UUID PRIMARY KEY,
  artifact_id UUID REFERENCES artifacts(id),
  version_number INTEGER,
  content TEXT, -- Markdown/text content
  content_json JSONB, -- Structured data
  diagram_svg TEXT, -- Optional diagram
  change_summary TEXT,
  created_at TIMESTAMP
);
```

### Our Schema for InsightX
```sql
-- Artifacts table (stores Data DNA, SQL results, Python outputs)
CREATE TABLE artifacts (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id), -- Changed from chat_id
  type TEXT, -- 'data_dna', 'sql_result', 'python_result', 'insights'
  title TEXT,
  current_version INTEGER,
  created_at TIMESTAMP
);

-- Artifact versions (version control for results)
CREATE TABLE artifact_versions (
  id UUID PRIMARY KEY,
  artifact_id UUID REFERENCES artifacts(id),
  version_number INTEGER,
  content TEXT, -- SQL query or Python code
  content_json JSONB, -- Query results or analysis output
  change_summary TEXT,
  created_at TIMESTAMP
);
```

**Key Insight**: Artifacts table is **generic** - it stores any type of generated content with version control.

---

## Summary: What to Copy Exactly

### ✅ Copy These Files Directly (Minimal Changes)
1. `lib/agents/key-manager.ts` - API key rotation logic
2. `lib/agents/toast-notifications.ts` - Toast notification functions
3. `lib/agents/context-builder.ts` - Dynamic context injection
4. `lib/db/artifacts.ts` - Artifact persistence logic

### 🔄 Adapt These Files (Change Domain Logic)
1. `lib/agents/config.ts` - Change agent names/prompts (hardware → analytics)
2. `lib/agents/tools.ts` - Change tool definitions (BOM → Data DNA)
3. `lib/agents/tool-executor.ts` - Change tool implementations (circuits → SQL/Python)
4. `lib/agents/orchestrator.ts` - Change routing logic (BOM/CODE → SQL/PYTHON)

### 🆕 Create These Files (New for InsightX)
1. `lib/agents/sql-executor.ts` - DuckDB integration
2. `lib/agents/python-executor.ts` - Python sandbox
3. `components/workspace/DataDNAPanel.tsx` - Display Data DNA
4. `components/workspace/CodeExecutionPanel.tsx` - Display SQL/Python results

---

## Next Steps

1. ✅ Requirements document created
2. ✅ Implementation plan created
3. ✅ Reference analysis complete
4. ⏭️ **Next**: Create detailed design document with agent prompts
5. ⏭️ **Then**: Start Phase 1 implementation (core orchestration)

**Ready to proceed with the design document?**
