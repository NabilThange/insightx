# InsightX Orchestration - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Chat UI      │  │ Toast        │  │ Workspace    │          │
│  │ Component    │  │ Notifications│  │ Sidebar      │          │
│  └──────┬───────┘  └──────▲───────┘  └──────────────┘          │
│         │                  │                                     │
│         │ POST             │ SSE Events                          │
│         ▼                  │                                     │
└─────────┼──────────────────┼─────────────────────────────────────┘
          │                  │
          │                  │
┌─────────┼──────────────────┼─────────────────────────────────────┐
│         │    NEXT.JS API ROUTES (Server)    │                    │
├─────────┼──────────────────┼─────────────────────────────────────┤
│         ▼                  │                                     │
│  ┌──────────────────────────────────────┐                       │
│  │  /api/chat/stream                    │                       │
│  │  - Receives user query               │                       │
│  │  - Creates SSE stream                │                       │
│  │  - Calls orchestrator                │                       │
│  └──────────────┬───────────────────────┘                       │
│                 │                                                │
│                 ▼                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         ORCHESTRATION LAYER                              │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  AssemblyLineOrchestrator                          │  │  │
│  │  │  - Manages multi-agent workflow                    │  │  │
│  │  │  - Streams events to client                        │  │  │
│  │  │  - Persists messages to DB                         │  │  │
│  │  └────────────────┬───────────────────────────────────┘  │  │
│  │                   │                                       │  │
│  │                   ▼                                       │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  AgentRunner                                       │  │  │
│  │  │  - Executes individual agents                      │  │  │
│  │  │  - Handles tool calls                              │  │  │
│  │  │  - Manages retries with key rotation               │  │  │
│  │  └────────────────┬───────────────────────────────────┘  │  │
│  │                   │                                       │  │
│  └───────────────────┼───────────────────────────────────────┘  │
│                      │                                          │
│         ┌────────────┼────────────┐                            │
│         │            │            │                            │
│         ▼            ▼            ▼                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│  │ Bytez    │ │ Tool     │ │ Key      │                       │
│  │ Client   │ │ Executor │ │ Manager  │                       │
│  └──────────┘ └────┬─────┘ └──────────┘                       │
│                     │                                          │
│                     ▼                                          │
│         ┌───────────┴───────────┐                             │
│         │                       │                             │
│         ▼                       ▼                             │
│  ┌──────────────┐      ┌──────────────┐                      │
│  │ /api/tools/  │      │ /api/tools/  │                      │
│  │ sql          │      │ python       │                      │
│  └──────────────┘      └──────────────┘                      │
│                                                               │
└───────────────────────────────────────────────────────────────┘
          │                       │
          ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Bytez API    │  │ Supabase     │  │ DuckDB       │      │
│  │ (LLM)        │  │ (Database)   │  │ (SQL Engine) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Agent Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENT WORKFLOW                            │
└─────────────────────────────────────────────────────────────┘

1. ORCHESTRATOR AGENT (🎯)
   ├─ Input: User query + conversation history
   ├─ Tools: read_data_dna, read_context
   ├─ Output: Classification JSON
   │   {
   │     "classification": "SQL_ONLY" | "PY_ONLY" | "SQL_THEN_PY" | "EXPLAIN_ONLY",
   │     "reasoning": "...",
   │     "columns_needed": [...],
   │     "next_agents": [...]
   │   }
   └─ Toast: "Using [Agent Name]"

2A. SQL AGENT (🔍) - If SQL_ONLY or SQL_THEN_PY
    ├─ Input: User query + orchestrator reasoning
    ├─ Tools: read_data_dna, run_sql
    ├─ Process:
    │   1. Call read_data_dna → Get schema
    │   2. Generate SQL query
    │   3. Call run_sql → Execute query
    │   4. Return results
    └─ Output: SQL query + results

2B. PYTHON AGENT (📊) - If PY_ONLY or SQL_THEN_PY
    ├─ Input: User query + SQL results (if hybrid)
    ├─ Tools: read_data_dna, read_context, run_python
    ├─ Process:
    │   1. Call read_data_dna → Get baselines
    │   2. Generate Python code
    │   3. Call run_python → Execute code
    │   4. Return analysis
    └─ Output: Python code + results

3. COMPOSER AGENT (🎨) - If SQL or Python executed
   ├─ Input: User query + SQL/Python results
   ├─ Tools: read_data_dna, read_context, write_context
   ├─ Process:
   │   1. Synthesize results into clear answer
   │   2. Compare to baselines
   │   3. Generate follow-up suggestions
   │   4. Save insights to context
   └─ Output: User-friendly response

4. EXPLAINER AGENT (💡) - If EXPLAIN_ONLY
   ├─ Input: User query
   ├─ Tools: read_data_dna
   ├─ Process:
   │   1. Read Data DNA
   │   2. Extract relevant information
   │   3. Format explanation
   └─ Output: Explanation text
```

## 🛠️ Tool Execution Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    TOOL EXECUTION                            │
└─────────────────────────────────────────────────────────────┘

Agent calls tool → ToolExecutor.executeToolCall()
                    │
                    ├─ read_data_dna
                    │   └─ Returns: Dataset schema, baselines, patterns
                    │
                    ├─ run_sql
                    │   ├─ POST /api/tools/sql
                    │   ├─ Validate SQL (SELECT only)
                    │   ├─ Execute via DuckDB
                    │   └─ Returns: Query results
                    │
                    ├─ run_python
                    │   ├─ POST /api/tools/python
                    │   ├─ Execute in sandbox
                    │   └─ Returns: Analysis results
                    │
                    ├─ read_context
                    │   └─ Returns: Accumulated insights
                    │
                    └─ write_context
                        └─ Saves: New insight to context

Each tool call triggers:
  1. Toast notification
  2. Result persistence
  3. Event stream to client
```

## 🔑 API Key Management

```
┌─────────────────────────────────────────────────────────────┐
│                  KEY ROTATION FLOW                           │
└─────────────────────────────────────────────────────────────┘

KeyManager (Singleton)
  ├─ keys: [key1, key2, ..., key12]
  ├─ currentIndex: 0
  ├─ metrics: Map<key, KeyMetrics>
  └─ failedKeys: Set<number>

Request Flow:
  1. Get current key → key1
  2. Make API call
  3. If 429/402/401 error:
     ├─ Mark key1 as failed
     ├─ Rotate to key2
     ├─ Show toast notification
     ├─ Retry request
     └─ Continue processing
  4. If success:
     └─ Record usage metrics

Metrics Tracked:
  - usageCount: Number of successful calls
  - errorCount: Number of failed calls
  - lastUsed: Timestamp of last use
  - lastError: Timestamp of last error
  - status: 'healthy' | 'failed'
  - failureReason: Error message
```

## 📡 SSE Streaming Protocol

```
┌─────────────────────────────────────────────────────────────┐
│                    SSE EVENT TYPES                           │
└─────────────────────────────────────────────────────────────┘

Client connects to /api/chat/stream
  ↓
Server sends events:

1. status
   data: {"type":"status","message":"Analyzing query type..."}

2. toast
   data: {"type":"toast","message":"Using SQL Agent","data":{...}}

3. orchestrator_result
   data: {"type":"orchestrator_result","data":{"classification":"SQL_ONLY",...}}

4. sql_result
   data: {"type":"sql_result","data":{"query":"SELECT ...","results":{...}}}

5. python_result
   data: {"type":"python_result","data":{"code":"import ...","results":{...}}}

6. final_response
   data: {"type":"final_response","data":{"text":"...","classification":"..."}}

7. error
   data: {"type":"error","message":"...","details":"..."}

8. [DONE]
   data: [DONE]
   ↓
Connection closes
```

## 🗄️ Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA PERSISTENCE                          │
└─────────────────────────────────────────────────────────────┘

User Query
  ↓
Save to messages table
  {
    chat_id: "...",
    role: "user",
    content: "What's the average amount?"
  }
  ↓
Orchestration happens
  ↓
Save agent outputs to messages table
  {
    chat_id: "...",
    role: "assistant",
    content: "SQL Query: SELECT AVG(amount)..."
  }
  ↓
Save final response to messages table
  {
    chat_id: "...",
    role: "assistant",
    content: "The average transaction amount is $125.50"
  }
  ↓
(Optional) Save artifacts
  - SQL queries
  - Python code
  - Analysis results
  - Accumulated insights
```

## 🎨 Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  COMPONENT HIERARCHY                         │
└─────────────────────────────────────────────────────────────┘

RootLayout
  └─ ToastProvider (Global)
      ├─ GlobalHeader
      ├─ Page Content
      │   ├─ WorkspaceLayout
      │   │   ├─ WorkspaceSidebar
      │   │   ├─ ChatPanel
      │   │   │   ├─ ChatTimeline
      │   │   │   │   ├─ UserMessage
      │   │   │   │   └─ AgentMessage
      │   │   │   │       ├─ AgentBadge
      │   │   │   │       ├─ ThinkingProcess
      │   │   │   │       └─ CodeBlock
      │   │   │   └─ ChatInput
      │   │   └─ WorkspaceRightSidebar
      │   │       ├─ DataDNAPanel (TODO)
      │   │       ├─ CodeExecutionPanel (TODO)
      │   │       └─ ResultsPanel (TODO)
      │   │
      │   └─ TestOrchestrationPage
      │       ├─ Test Query Buttons
      │       ├─ Custom Query Input
      │       ├─ Event Stream Display
      │       └─ Final Response Display
      │
      └─ Toast Container (Fixed position)
          └─ ToastItem (Multiple)
              ├─ Icon
              ├─ Title
              ├─ Description
              └─ Close Button
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
└─────────────────────────────────────────────────────────────┘

1. API Key Protection
   ├─ Server-side only (BYTEZ_API_KEY_*)
   ├─ Never exposed to client
   └─ Rotation on compromise

2. SQL Injection Prevention
   ├─ Only SELECT statements allowed
   ├─ Parameterized queries
   └─ Query validation

3. Python Sandbox
   ├─ Isolated execution environment
   ├─ Resource limits (CPU, memory, time)
   ├─ No file system access
   └─ No network access

4. User Data Isolation
   ├─ Session-based data access
   ├─ Row-level security in Supabase
   └─ No cross-session data leakage

5. Rate Limiting
   ├─ Per-user request limits
   ├─ Per-key usage tracking
   └─ Automatic throttling
```

## 📊 Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────┐
│                    LOGGING STRATEGY                          │
└─────────────────────────────────────────────────────────────┘

Console Logs:
  ├─ [ORCHESTRATOR] - Orchestration flow
  ├─ [AgentRunner] - Agent execution
  ├─ [ToolExecutor] - Tool calls
  ├─ [KeyManager] - Key rotation
  └─ [Toast] - User notifications

Metrics Tracked:
  ├─ Agent execution time
  ├─ Tool execution time
  ├─ API key usage
  ├─ Error rates
  └─ User query patterns

Events Streamed:
  ├─ Agent selection
  ├─ Tool execution
  ├─ Key rotation
  ├─ Errors
  └─ Final responses
```

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  DEPLOYMENT TOPOLOGY                         │
└─────────────────────────────────────────────────────────────┘

Vercel (Next.js App)
  ├─ Edge Functions (API Routes)
  │   ├─ /api/chat/stream
  │   ├─ /api/tools/sql
  │   └─ /api/tools/python
  ├─ Static Assets
  └─ Server-Side Rendering

External Services:
  ├─ Bytez API (LLM)
  ├─ Supabase (Database)
  └─ DuckDB (SQL Engine)

Environment Variables:
  ├─ BYTEZ_API_KEY_1..12
  ├─ NEXT_PUBLIC_BYTEZ_API_KEY_1..12
  ├─ NEXT_PUBLIC_SUPABASE_URL
  └─ NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 📚 Related Documentation

- **IMPLEMENTATION_PLAN.md** - Complete implementation plan
- **IMPLEMENTATION_STATUS.md** - Current status and next steps
- **QUICK_START.md** - How to test the system
- **BUILD_SUMMARY.md** - What was built
- **requirements.md** - User stories and acceptance criteria

---

**Last Updated**: February 17, 2026
