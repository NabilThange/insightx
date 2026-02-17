# 🏗️ Complete Architecture Diagram

## Your Setup (Simplified)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    YOUR MACHINE (Local)                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  Frontend: insightx-app (localhost:3000)                  │ │
│  │  ✅ Agents (Orchestrator, SQL, Python, Composer, Explainer)
│  │  ✅ Tool Executor                                         │ │
│  │  ✅ Toast Notifications                                  │ │
│  │  ✅ SSE Streaming                                        │ │
│  │                                                            │ │
│  │  .env.local:                                              │ │
│  │  NEXT_PUBLIC_BACKEND_URL=                                 │ │
│  │    https://insightx-bkend.onrender.com                    │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           │ HTTPS                                │
│                           │                                      │
│  ┌────────────────────────▼────────────────────────────────────┐ │
│  │                                                            │ │
│  │  Backend Copy (insightx-app/backend)                      │ │
│  │  ✅ For reference only                                    │ │
│  │  ✅ No changes needed                                     │ │
│  │  ✅ Everything is correct                                │ │
│  │                                                            │ │
│  │  routes/                                                  │ │
│  │  ├── sql_execute.py ✅                                    │ │
│  │  ├── python_execute.py ✅                                 │ │
│  │  └── ...                                                  │ │
│  │                                                            │ │
│  │  services/                                                │ │
│  │  ├── sql_executor.py ✅                                   │ │
│  │  ├── python_executor.py ✅                                │ │
│  │  └── ...                                                  │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    RENDER (Cloud)                                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  Real Backend: https://insightx-bkend.onrender.com        │ │
│  │  ✅ SQL execution endpoint                                │ │
│  │  ✅ Python execution endpoint                             │ │
│  │  ✅ DuckDB integration                                    │ │
│  │  ✅ Python sandbox                                        │ │
│  │  ✅ CORS enabled                                          │ │
│  │                                                            │ │
│  │  POST /api/sql/execute                                    │ │
│  │  POST /api/python/execute                                 │ │
│  │  GET /api/session/{id}                                    │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                              │
└─────────────────────────────────────────────────────────────────┘

1. User opens: http://localhost:3000/test-orchestration
   ↓
2. User asks: "What's the average transaction amount?"
   ↓
3. Frontend receives query
   ├─ Orchestrator Agent classifies: SQL_ONLY
   ├─ Toast: "Using SQL Agent"
   ├─ SQL Agent generates: SELECT AVG(amount) FROM transactions
   ├─ Toast: "Agent called read_data_dna"
   ├─ Toast: "Agent called run_sql"
   ├─ Tool Executor prepares request
   │
   └─ POST https://insightx-bkend.onrender.com/api/sql/execute
      {
        "session_id": "uuid",
        "sql": "SELECT AVG(amount) FROM transactions",
        "limit": 500
      }
      ↓
4. Backend (on Render) receives request
   ├─ Validates SQL (only SELECT allowed)
   ├─ Downloads Parquet file from Supabase
   ├─ Executes with DuckDB
   ├─ Returns results
   │
   └─ Response:
      {
        "success": true,
        "data": {
          "rows": 1,
          "columns": ["avg"],
          "records": [{ "avg": 125.50 }]
        }
      }
      ↓
5. Frontend receives results
   ├─ Composer Agent synthesizes
   ├─ "The average transaction amount is $125.50"
   ├─ Explainer Agent explains
   ├─ Toast: "Response ready"
   │
   └─ User sees: "The average transaction amount is $125.50"
```

## File Structure

```
C:\Users\thang\Downloads\IIT-B-HACKATHON\

├── insightx-app\ (FRONTEND)
│   ├── lib/agents/
│   │   ├── orchestrator.ts ✅ (main orchestration)
│   │   ├── tool-executor.ts ✅ (calls backend)
│   │   ├── config.ts ✅ (agent definitions)
│   │   ├── agent-identities.ts ✅ (visual identity)
│   │   ├── key-manager.ts ✅ (API key rotation)
│   │   ├── tools.ts ✅ (tool definitions)
│   │   └── toast-notifications.ts ✅ (notifications)
│   │
│   ├── components/ui/
│   │   └── toast-provider.tsx ✅ (toast UI)
│   │
│   ├── app/
│   │   ├── api/chat/stream/route.ts ✅ (SSE endpoint)
│   │   ├── test-orchestration/page.tsx ✅ (test page)
│   │   └── layout.tsx ✅ (with ToastProvider)
│   │
│   ├── .env.local ✅ (UPDATED)
│   │   NEXT_PUBLIC_BACKEND_URL=https://insightx-bkend.onrender.com
│   │
│   └── backend\ (COPY - for reference)
│       ├── routes/
│       │   ├── sql_execute.py ✅ (correct)
│       │   ├── python_execute.py ✅ (correct)
│       │   └── ...
│       ├── services/
│       │   ├── sql_executor.py ✅ (correct)
│       │   ├── python_executor.py ✅ (correct)
│       │   └── ...
│       └── main.py ✅ (correct)
│
└── backend\ (REAL BACKEND - on Render)
    ├── routes/
    │   ├── sql_execute.py ✅ (deployed)
    │   ├── python_execute.py ✅ (deployed)
    │   └── ...
    ├── services/
    │   ├── sql_executor.py ✅ (deployed)
    │   ├── python_executor.py ✅ (deployed)
    │   └── ...
    └── main.py ✅ (deployed)
```

## API Endpoints

```
Frontend calls these endpoints on Render:

1. SQL Execution
   POST https://insightx-bkend.onrender.com/api/sql/execute
   Request: { session_id, sql, limit }
   Response: { success, data: { rows, columns, records }, summary }

2. Python Execution
   POST https://insightx-bkend.onrender.com/api/python/execute
   Request: { session_id, code, timeout }
   Response: { success, data: {...}, summary }

3. Get Session Data
   GET https://insightx-bkend.onrender.com/api/session/{session_id}
   Response: { id, data_dna: {...} }
```

## Configuration

```
Frontend (.env.local):
├── NEXT_PUBLIC_SUPABASE_URL=https://xvtqbvavwbowyyoevolo.supabase.co
├── NEXT_PUBLIC_SUPABASE_ANON_KEY=...
├── NEXT_PUBLIC_BACKEND_URL=https://insightx-bkend.onrender.com ✅
└── BYTEZ_API_KEY_1..12=... (for agent LLM calls)

Backend Copy (backend/.env):
├── SUPABASE_URL=https://xvtqbvavwbowyyoevolo.supabase.co
├── SUPABASE_SERVICE_KEY=...
├── NEXT_PUBLIC_API_URL=https://insightx-bkend.onrender.com
└── BYTEZ_API_KEY_1..12=... (for agent LLM calls)

Real Backend (on Render):
├── Same as backend copy
└── Already deployed and running
```

## Status Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENT STATUS                          │
├─────────────────────────────────────────────────────────────┤
│ Frontend Agents                    ✅ WORKING               │
│ Tool Executor                      ✅ WORKING               │
│ Toast Notifications                ✅ WORKING               │
│ SSE Streaming                      ✅ WORKING               │
│ API Key Rotation                   ✅ WORKING               │
│ Backend Copy (reference)           ✅ CORRECT               │
│ Real Backend (on Render)           ✅ DEPLOYED              │
│ SQL Execution                      ✅ WORKING               │
│ Python Execution                   ✅ WORKING               │
│ Frontend .env Configuration        ✅ UPDATED               │
│ Full Agent Pipeline                ✅ WORKING               │
└─────────────────────────────────────────────────────────────┘
```

---

**Everything is set up correctly and ready to use!**
