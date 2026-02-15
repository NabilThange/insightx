# Complete Bytez Implementation Guide for InsightX

## Overview

InsightX is a **multi-agent analytics platform** that uses the Bytez API gateway to route requests to Claude 3.5 Sonnet. The entire system is built in Next.js with a unified streaming pipeline from frontend → multi-agent orchestrator → Bytez API → Claude models.

---

## 1. Architecture Diagram

```
┌─────────────────┐
│  Frontend UI    │
│  (React/Next)   │
└────────┬────────┘
         │ POST /api/chat/stream
         │ {session_id, chat_id, message, history}
         ↓
┌─────────────────────────────────────────┐
│   /api/chat/stream (Next.js Route)      │
│   ├─ Creates SSE stream                  │
│   ├─ Calls AssemblyLineOrchestrator     │
│   └─ Forwards SSE events to frontend    │
└────────┬────────────────────────────────┘
         │ orchestrateStream() 
         ↓
┌─────────────────────────────────────────┐
│  AssemblyLineOrchestrator               │
│  ├─ Step 1: Orchestrator Agent (classify) │
│  │         (Claude 3.5 Sonnet)          │
│  ├─ Step 2: SQL Agent (execute SQL)    │
│  │         (Claude 3.5 Sonnet)          │
│  ├─ Step 3: Python Agent (analyze)      │
│  │         (Claude 3.5 Sonnet)          │
│  └─ Step 4: Composer Agent (synthesize) │
│           (Claude 3.5 Sonnet)           │
└────────┬────────────────────────────────┘
         │ getBytezClient().createChatCompletion()
         ↓
┌─────────────────────────────────────────┐
│   BytezClient (OpenAI SDK)              │
│   ├─ baseURL: bytez.com/models/v2/...  │
│   ├─ apiKey: Bytez API Key             │
│   ├─ Auto key rotation on 429/401      │
│   └─ Handles retry logic                │
└────────┬────────────────────────────────┘
         │ fetch(bytez.com/models/v2/openai/v1/chat/completions)
         ↓
┌──────────────────────────────────┐
│    Bytez API Gateway             │
│ (https://api.bytez.com)          │
│ ├─ Routes model name             │
│ ├─ Translates to Anthropic API  │
│ └─ Returns OpenAI-formatted JSON │
└────────┬──────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│  Anthropic Claude 3.5 Sonnet    │
│  (Production Model)              │
└──────────────────────────────────┘
```

---

## 2. Key Components

### 2.1 BytezClient (`lib/agents/bytez-client.ts`)

The unified API client that uses OpenAI SDK but points to Bytez:

```typescript
// Key Properties:
- apiKey: Bytez API Key (NOT Anthropic key)
- baseURL: https://api.bytez.com/models/v2/openai/v1
- dangerouslyAllowBrowser: true (for browser environments)
- Auto-retries on 429/401/503
- Key rotation on quota errors
```

**Why This Approach:**
- Single SDK for any model (Claude, GPT, Gemini)
- OpenAI-compatible message format
- Bytez handles provider translation internally
- No need for separate Anthropic credentials

### 2.2 KeyManager (`lib/agents/key-manager.ts`)

Manages multiple Bytez API keys with health tracking:

```typescript
// Loads from environment:
BYTEZ_API_KEY_1=...
BYTEZ_API_KEY_2=...
... (up to BYTEZ_API_KEY_20)

// On 429/401/quota error:
1. Mark current key as failed
2. Rotate to next healthy key
3. Force recreate OpenAI client
4. Retry request
```

### 2.3 AgentRunner (`lib/agents/agent-runner.ts`)

Executes individual agents with tool support:

```typescript
// Flow:
1. Get agent config (model, system prompt, tools)
2. Call BytezClient.createChatCompletion()
3. If tool_calls in response:
   a. Execute tools via ToolExecutor
   b. Call model again with tool results
4. Return final content + tool results
```

### 2.4 AssemblyLineOrchestrator (`lib/agents/orchestrator.ts`)

Coordinates multi-agent workflow:

```typescript
// 4-Step Pipeline:
1. ORCHESTRATOR AGENT: Classify query type
   → SQL_ONLY | PY_ONLY | SQL_THEN_PY | EXPLAIN_ONLY

2. SQL AGENT (if needed): Execute SQL queries
   → Returns: rows, metadata

3. PYTHON AGENT (if needed): Statistical analysis
   → Returns: metrics, outliers, insights

4. COMPOSER AGENT: Synthesize results
   → Returns: final_response text + insights
```

**Streaming Method (`orchestrateStream`):**
```typescript
async *orchestrateStream(options): AsyncGenerator<Event>

// Yields events:
{ type: 'status', message: '...' }
{ type: 'orchestrator_result', data: {...} }
{ type: 'sql_result', data: {...} }
{ type: 'python_result', data: {...} }
{ type: 'final_response', data: {...} }
{ type: 'error', message: '...' }
```

### 2.5 API Endpoint (`app/api/chat/stream/route.ts`)

Server-Sent Events endpoint that the frontend calls:

```typescript
POST /api/chat/stream
{
  session_id: string,
  chat_id: string,
  message: string,
  history: [{role, content}, ...]
}

Response: text/event-stream
data: {"type": "status", "message": "..."}
data: {"type": "final_response", "data": {...}}
```

---

## 3. Configuration

### 3.1 Environment Variables (`.env.local`)

```bash
# Bytez API Keys (required, at least 1)
BYTEZ_API_KEY_1=sk-bytez-preview-...
BYTEZ_API_KEY_2=sk-bytez-preview-...
# ... up to BYTEZ_API_KEY_20

# Frontend API URL (points to Next.js, not Python backend)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3.2 Agent Models (`lib/agents/config.ts`)

```typescript
model: 'claude-3-5-sonnet-20241022'

// Bytez Routes:
// claude-3-5-sonnet-20241022
//   ├─ Recognized by Bytez
//   ├─ Forwarded to Anthropic
//   └─ Returns OpenAI-formatted JSON
```

---

## 4. Request Flow (Step-by-Step)

### User Sends Message

```
Frontend: POST /api/chat/stream
├─ session_id: "sess_xyz"
├─ chat_id: "chat_123"
├─ message: "What's the average transaction amount?"
└─ history: []
```

### API Route Creates SSE Stream

```typescript
const orchestrator = new AssemblyLineOrchestrator();

for await (const event of orchestrator.orchestrateStream({...})) {
  controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
}
```

### Orchestrator Classifies Query

```
Orchestrator Agent (Claude 3.5 Sonnet)
  ├─ Reads: "What's the average transaction amount?"
  ├─ Classifies: SQL_ONLY
  └─ Yields: { type: 'orchestrator_result', data: {classification: 'SQL_ONLY'} }
```

### SQL Agent Executes Query

```
SQL Agent (Claude 3.5 Sonnet)
  ├─ Generates: SELECT AVG(amount) FROM transactions
  ├─ Calls: run_sql tool
  ├─ ToolExecutor runs query on DuckDB
  └─ Yields: { type: 'sql_result', data: {rows: [{avg: 1234.56}]} }
```

### Composer Synthesizes Response

```
Composer Agent (Claude 3.5 Sonnet)
  ├─ Receives: SQL results
  ├─ Generates: "The average transaction amount is $1,234.56"
  └─ Yields: { type: 'final_response', data: {text: "...", classification: 'SQL_ONLY'} }
```

### Frontend Receives & Displays

```javascript
for await (const event of chatStream(...)) {
  if (event.type === 'final_response') {
    displayMessage(event.data.text);
  }
}
```

---

## 5. Key Management & Failover

### Scenario: First Key Hits Quota

```
Request #1: BytezClient with BYTEZ_API_KEY_1
  ├─ Error: 429 (rate limited)
  ├─ KeyManager.markCurrentKeyAsFailed()
  ├─ KeyManager.rotateKey() → currentIndex = 1
  └─ Force new client: new OpenAI(apiKey: BYTEZ_API_KEY_2)

Request #2: BytezClient with BYTEZ_API_KEY_2
  ├─ Success ✓
  └─ Continue...
```

### Supported Error Types

| Error | Action |
|-------|--------|
| 401/403 | Mark failed, rotate |
| 429 | Mark failed, rotate |
| 402 (quota) | Mark failed, rotate |
| 5xx | Mark failed, rotate |
| 4xx (other) | No retry, throw |

---

## 6. Testing the System

### 1. Verify Bytez Keys

```bash
# Check .env.local has keys
grep BYTEZ_API_KEY .env.local | head -3
# Should output: BYTEZ_API_KEY_1=...
```

### 2. Start Dev Server

```bash
npm run dev
# Should start on http://localhost:3000
```

### 3. Send Test Query

```bash
curl http://localhost:3000/api/chat/stream \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-session",
    "chat_id": "test-chat",
    "message": "Hello, what can you tell me about my data?",
    "history": []
  }'

# Should stream:
# data: {"type":"status","message":"Loading Data DNA..."}
# data: {"type":"orchestrator_result",...}
# data: {"type":"final_response",...}
```

### 4. Monitor Logs

```bash
# In browser console or server logs:
[BytezClient] connected with key: ...5678
[/api/chat/stream] Orchestrator streaming...
[Agent Router] Running agent: orchestrator
```

---

## 7. Troubleshooting

### Issue: "Model does not exist or has yet to be added to the Bytez catalog"

**Problem:** Model name is not recognized by Bytez.

**Solution:**
- Verify model is `claude-3-5-sonnet-20241022` (NOT `anthropic/claude-sonnet-4-5`)
- Check that BytezClient baseURL is `https://api.bytez.com/models/v2/openai/v1`
- Confirm Bytez API key is valid

### Issue: "All API keys exhausted after retries"

**Problem:** All Bytez keys are hitting quota/failing.

**Solution:**
- Check `.env.local` has at least 2-3 valid keys
- Verify keys at https://bytez.com dashboard
- Ensure keys have quota remaining
- Add more keys and restart dev server

### Issue: Frontend not receiving SSE events

**Problem:** Stream is closing prematurely or no events.

**Solution:**
- Check browser Network tab for `/api/chat/stream`
- Verify response header: `Content-Type: text/event-stream`
- Check server logs for orchestrator errors
- Ensure DataDNA is loading correctly (check `loadDataDNA()`)

### Issue: Agents not generating responses

**Problem:** Agent returns empty or error content.

**Solution:**
- Check BytezClient error handling (429, 401, etc.)
- Verify model in config.ts is correct
- Ensure system prompts in config.ts are not malformed
- Check tool executor (might be blocking on SQL/Python execution)

---

## 8. Architecture: Why This Works

### Single Unified Gateway (Bytez)

❌ **Old Approach (Separate SDKs):**
```typescript
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Two SDKs, two API keys, two different message formats
const openai = new OpenAI({apiKey: process.env.OPENAI_KEY});
const claude = new Anthropic({apiKey: process.env.ANTHROPIC_KEY});
```

✅ **New Approach (Bytez Gateway):**
```typescript
import OpenAI from 'openai';

// ONE SDK, ONE key, supports ANY model
const client = new OpenAI({
  apiKey: process.env.BYTEZ_API_KEY,
  baseURL: 'https://api.bytez.com/models/v2/openai/v1'
});

// Bytez routes: claude-3-5-sonnet-20241022 → Anthropic
// Bytez routes: gpt-4o → OpenAI
// Bytez routes: gemini-pro → Google
```

### Why It's Powerful

1. **Zero Vendor Lock-in**: Switch models with 1-line config change
2. **Cost Optimization**: Use cheaper models for routing, expensive for reasoning
3. **Automatic Failover**: Built-in key rotation prevents downtime
4. **Production-Ready**: Handles rate limits, quotas, temporary server errors

---

## 9. Next Steps

### For Development
1. ✅ Bytez + Claude integrated
2. ✅ Multi-agent orchestration working
3. ✅ SSE streaming to frontend
4. ⏳ Add more specialized agents (e.g., SecurityAuditor)
5. ⏳ Implement persistent memory (long-term context)
6. ⏳ Add feedback loop (user ratings → model improvement)

### For Production
1. Deploy to Vercel (Next.js hosting)
2. Setup monitoring for Bytez API usage
3. Configure auto-scaling for key rotation
4. Implement caching layer for common queries
5. Add analytics for agent performance

---

## 10. References

- **Bytez Documentation**: https://bytez.com/docs
- **OpenAI SDK (v6+)**: https://github.com/openai/node-sdk
- **Claude Documentation**: https://docs.anthropic.com
- **Next.js Streaming**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

