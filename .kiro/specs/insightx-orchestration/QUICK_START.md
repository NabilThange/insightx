# InsightX Orchestration - Quick Start Guide

## 🚀 What Was Built

A complete multi-agent orchestration system that:
- Routes queries to SQL/Python/Hybrid agents automatically
- Executes tools (read_data_dna, run_sql, run_python)
- Shows real-time toast notifications
- Handles API key rotation automatically
- Streams responses via Server-Sent Events

## ✅ What's Working Now

1. **Multi-Agent Classification** - Orchestrator correctly routes queries
2. **Toast Notifications** - Real-time UI feedback for all events
3. **API Key Rotation** - Automatic failover between 12 keys
4. **SSE Streaming** - Real-time event delivery to client
5. **Test Page** - `/test-orchestration` for testing the system

## 🧪 How to Test

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Open the Test Page

Navigate to: `http://localhost:3000/test-orchestration`

### 3. Try These Queries

Click any of the test queries or enter your own:

- "What's the average transaction amount?" → SQL_ONLY
- "Write a Python code to find the highest selling category" → PY_ONLY
- "Which states are statistical outliers for failure rate?" → SQL_THEN_PY
- "Show me transactions over $1000" → SQL_ONLY

### 4. Watch the Magic Happen

You'll see:
- ✅ Toast notification: "Using SQL Agent" (or Python Analyst)
- ✅ Toast notification: "Agent called read_data_dna"
- ✅ Toast notification: "Agent called run_sql" (or run_python)
- ✅ Event stream showing all orchestration steps
- ✅ Final response with classification

## 📊 What You'll See

### Toast Notifications (Top Right)

```
✅ Using SQL Agent
   SQL Agent is now handling your request.

ℹ️ Tool: read_data_dna
   📖 Data DNA Read

ℹ️ Tool: run_sql
   🔍 SQL Query Executed
```

### Event Stream (Test Page)

```json
{
  "type": "toast",
  "message": "Using SQL Agent",
  "data": {
    "agent": "SQL_ONLY",
    "reasoning": "Simple aggregation query"
  }
}

{
  "type": "orchestrator_result",
  "data": {
    "classification": "SQL_ONLY",
    "reasoning": "User wants to calculate average",
    "next_agents": ["sql_agent"]
  }
}

{
  "type": "sql_result",
  "data": {
    "query": "SELECT AVG(amount) FROM transactions",
    "results": { "avg_amount": 125.50 }
  }
}

{
  "type": "final_response",
  "data": {
    "text": "The average transaction amount is $125.50",
    "classification": "SQL_ONLY"
  }
}
```

## 🔧 Configuration

### Environment Variables

Make sure these are set in `.env.local`:

```bash
# Supabase (for future Data DNA loading)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Bytez API Keys (12 keys for rotation)
BYTEZ_API_KEY_1=key1
BYTEZ_API_KEY_2=key2
# ... up to BYTEZ_API_KEY_12

# Client-side keys
NEXT_PUBLIC_BYTEZ_API_KEY_1=key1
NEXT_PUBLIC_BYTEZ_API_KEY_2=key2
# ... up to NEXT_PUBLIC_BYTEZ_API_KEY_12
```

## 📁 Key Files

### Agent System
- `lib/agents/orchestrator.ts` - Main orchestration logic
- `lib/agents/config.ts` - Agent definitions and prompts
- `lib/agents/agent-identities.ts` - Agent visual identity
- `lib/agents/key-manager.ts` - API key rotation
- `lib/agents/tools.ts` - Tool definitions
- `lib/agents/tool-executor.ts` - Tool execution
- `lib/agents/toast-notifications.ts` - Toast functions

### API Routes
- `app/api/chat/stream/route.ts` - SSE streaming endpoint
- `app/api/tools/sql/route.ts` - SQL execution (mock data)
- `app/api/tools/python/route.ts` - Python execution (mock data)

### UI Components
- `components/ui/toast-provider.tsx` - Toast UI component
- `app/test-orchestration/page.tsx` - Test page

## 🎯 Agent Flow

```
1. User Query
   ↓
2. Orchestrator Agent
   - Classifies: SQL_ONLY | PY_ONLY | SQL_THEN_PY | EXPLAIN_ONLY
   - Shows toast: "Using [Agent Name]"
   ↓
3. Specialist Agent (SQL or Python)
   - Calls read_data_dna tool → Toast notification
   - Calls run_sql or run_python tool → Toast notification
   - Returns results
   ↓
4. Composer Agent
   - Synthesizes final response
   - Returns user-friendly answer
   ↓
5. Client Receives
   - Final response text
   - Classification type
   - All intermediate results
```

## 🔍 Debugging

### Check Console Logs

The orchestrator logs everything:

```
🚀 [ORCHESTRATOR] STARTING NEW ORCHESTRATION
📝 User Message: "What's the average transaction amount?"
🔑 Session ID: test-session-123
💬 Chat ID: test-chat-456

📍 STAGE 1: ORCHESTRATOR AGENT
🤖 [Orchestrator] Running orchestrator agent...
✅ [Orchestrator] Successfully parsed JSON: SQL_ONLY

🎯 CLASSIFICATION RESULT:
   Type: SQL_ONLY
   Reasoning: Simple aggregation query

✨ TOAST: Using SQL Agent

📍 STAGE 2A: SQL AGENT
🔍 [SQL Agent] Generating and executing SQL query...
✅ [SQL Agent] Query generated and executed

📍 STAGE 3: FINAL RESPONSE AGENT
🎨 [Composer Agent] Synthesizing final answer...
✅ [Composer Agent] Final response synthesized

✅ ORCHESTRATION COMPLETE
```

### Check Toast Notifications

Open browser DevTools → Console:

```
✅ [Toast] Using SQL Agent: SQL Agent is now handling your request.
ℹ️ [Toast] Agent called read_data_dna: 📖 Data DNA Read
ℹ️ [Toast] Agent called run_sql: 🔍 SQL Query Executed
```

### Check Network Tab

Look for:
- POST `/api/chat/stream` - Should return 200 with SSE stream
- POST `/api/tools/sql` - Should return 200 with mock data
- POST `/api/tools/python` - Should return 200 with mock data

## ⚠️ Known Limitations

### 1. Mock Data
- SQL and Python tools return mock data
- Real execution engines not implemented yet
- Data DNA is mocked if backend unavailable

### 2. No Workspace Integration
- Results not displayed in workspace sidebar yet
- Need to build DataDNAPanel, CodeExecutionPanel, etc.

### 3. No Real Data DNA
- Tool executor uses mock Data DNA
- Need to connect to Supabase sessions table

## 🚀 Next Steps

### To Make It Production-Ready

1. **Implement Real SQL Execution**
   ```bash
   npm install duckdb-async
   ```
   Update `app/api/tools/sql/route.ts` with DuckDB integration

2. **Implement Real Python Execution**
   Set up Docker container or serverless function
   Update `app/api/tools/python/route.ts` with real execution

3. **Connect to Real Data DNA**
   Update `lib/agents/tool-executor.ts` to load from Supabase

4. **Build Workspace UI**
   Create DataDNAPanel, CodeExecutionPanel, ResultsPanel

5. **Add Syntax Highlighting**
   ```bash
   npm install react-syntax-highlighter @types/react-syntax-highlighter
   ```

## 💡 Tips

### Testing Different Query Types

- **SQL_ONLY**: "What's the average amount?"
- **PY_ONLY**: "Write Python code to find outliers"
- **SQL_THEN_PY**: "Which states are statistical outliers?"
- **EXPLAIN_ONLY**: "What columns are in this dataset?"

### Triggering API Key Rotation

The system automatically rotates keys on:
- 429 (Rate Limit)
- 402 (Payment Required)
- 401 (Unauthorized)

You'll see a toast notification when this happens.

### Customizing Agent Prompts

Edit `lib/agents/config.ts` to change:
- System prompts for each agent
- Temperature settings
- Max tokens
- Tool assignments

### Customizing Toast Notifications

Edit `lib/agents/toast-notifications.ts` to change:
- Toast duration
- Toast messages
- Toast icons
- Toast colors

## 📚 Documentation

- `IMPLEMENTATION_PLAN.md` - Complete implementation plan
- `IMPLEMENTATION_STATUS.md` - Current status and next steps
- `REFERENCE_PROJECT_ANALYSIS.md` - Patterns from reference project
- `requirements.md` - User stories and acceptance criteria

## 🎉 Success!

You now have a working multi-agent orchestration system! The core infrastructure is complete and ready for real SQL/Python execution.

---

**Questions?** Check the implementation status document or review the code comments.
