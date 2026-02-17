# SQL & Python Execution Integration Plan

## 🎯 Objective
Connect the frontend agent system to the real backend for SQL and Python execution, replacing mock data with actual execution results.

## 📂 Project Structure

```
ROOT: C:\Users\thang\Downloads\IIT-B-HACKATHON\

├── insightx-app\ (FRONTEND - Current Working Directory)
│   ├── lib/agents/tool-executor.ts ⚠️ UPDATE
│   ├── app/api/tools/ ❌ DELETE (mock routes)
│   └── .env.local ⚠️ UPDATE (add backend URL)
│
└── backend\ (REAL BACKEND - You will paste changes)
    ├── main.py ✅ ALREADY HAS ROUTES
    ├── routes/
    │   ├── sql_execute.py ✅ ALREADY EXISTS
    │   └── python_execute.py ✅ ALREADY EXISTS
    └── services/
        ├── sql_executor.py ✅ ALREADY EXISTS
        └── python_executor.py ✅ ALREADY EXISTS
```

## 🔍 Current Backend API (Already Exists!)

### SQL Execution Endpoint
```
POST http://localhost:8000/api/sql/execute

Request:
{
  "session_id": "uuid",
  "sql": "SELECT * FROM transactions LIMIT 10",
  "limit": 500
}

Response:
{
  "success": true,
  "data": {
    "rows": 10,
    "columns": ["id", "amount", "category"],
    "records": [...]
  },
  "summary": "Query returned 10 rows, 3 columns"
}
```

### Python Execution Endpoint
```
POST http://localhost:8000/api/python/execute

Request:
{
  "session_id": "uuid",
  "code": "import pandas as pd\nresults = {'mean': 125.5}\nprint(json.dumps(results))",
  "timeout": 10
}

Response:
{
  "success": true,
  "data": {
    "mean": 125.5
  },
  "summary": "Python execution completed successfully"
}
```

## 🔄 Current vs Target Flow

### Current Flow (Mock Data)
```
SQL Agent → tool-executor.ts → /api/tools/sql (Next.js mock route)
                                     ↓
                              Returns fake data
```

### Target Flow (Real Execution)
```
SQL Agent → tool-executor.ts → POST http://localhost:8000/api/sql/execute
                                     ↓
                              Real Backend (DuckDB)
                                     ↓
                              Returns actual results
                                     ↓
Composer Agent → Synthesizes response
                                     ↓
Explainer Agent → Explains to user
```

## 📝 Implementation Steps

### STEP 1: Update Frontend Environment Variables
**File**: `insightx-app/.env.local`

**Action**: Add backend URL

```bash
# Add this line
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### STEP 2: Update Tool Executor (Frontend)
**File**: `insightx-app/lib/agents/tool-executor.ts`

**Changes**:
1. Remove mock Data DNA fallback
2. Update `runSQL()` to call real backend
3. Update `runPython()` to call real backend
4. Update `loadDataDNA()` to call real backend

**Key Changes**:
- Change API endpoint from `/api/tools/sql` → `${BACKEND_URL}/api/sql/execute`
- Change API endpoint from `/api/tools/python` → `${BACKEND_URL}/api/python/execute`
- Handle real response format from backend
- Add proper error handling

### STEP 3: Delete Mock API Routes (Frontend)
**Files to Delete**:
- `insightx-app/app/api/tools/sql/route.ts`
- `insightx-app/app/api/tools/python/route.ts`

**Reason**: These were temporary mock routes. Real execution happens in backend.

### STEP 4: Verify Backend is Running
**No code changes needed** - backend already has everything!

**Verification**:
```bash
cd C:\Users\thang\Downloads\IIT-B-HACKATHON\backend
python -m uvicorn main:app --reload --port 8000
```

**Test endpoints**:
- http://localhost:8000/ (health check)
- http://localhost:8000/docs (Swagger UI)

### STEP 5: Test End-to-End Flow

**Test Query**: "What's the average transaction amount?"

**Expected Flow**:
1. User asks question in `/test-orchestration`
2. Orchestrator classifies as SQL_ONLY
3. SQL Agent generates query: `SELECT AVG(amount) FROM transactions`
4. Tool executor calls: `POST http://localhost:8000/api/sql/execute`
5. Backend executes query with DuckDB
6. Returns real results
7. Composer synthesizes response
8. User sees: "The average transaction amount is $X.XX"

## 🔧 Detailed Code Changes

### Change 1: Update .env.local (Frontend)

**File**: `insightx-app/.env.local`

**Add**:
```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Change 2: Update tool-executor.ts (Frontend)

**File**: `insightx-app/lib/agents/tool-executor.ts`

**Current Code**:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
```

**New Code**:
```typescript
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
```

**Update runSQL()**:
```typescript
// OLD
const response = await fetch('/api/tools/sql', { ... });

// NEW
const response = await fetch(`${BACKEND_URL}/api/sql/execute`, { ... });
```

**Update runPython()**:
```typescript
// OLD
const response = await fetch('/api/tools/python', { ... });

// NEW
const response = await fetch(`${BACKEND_URL}/api/python/execute`, { ... });
```

**Update loadDataDNA()**:
```typescript
// OLD
const response = await fetch(`${API_BASE_URL}/session/${this.sessionId}`);

// NEW
const response = await fetch(`${BACKEND_URL}/api/session/${this.sessionId}`);
```

### Change 3: Delete Mock Routes (Frontend)

**Delete these files**:
- `insightx-app/app/api/tools/sql/route.ts`
- `insightx-app/app/api/tools/python/route.ts`

**Reason**: No longer needed - using real backend

## 🚀 Backend Changes (Already Complete!)

**Good news**: The backend already has everything we need!

### Existing Routes (No Changes Needed)
- ✅ `POST /api/sql/execute` - SQL execution with DuckDB
- ✅ `POST /api/python/execute` - Python execution with sandbox
- ✅ `GET /api/session/{session_id}` - Get session data

### Existing Services (No Changes Needed)
- ✅ `services/sql_executor.py` - DuckDB query execution
- ✅ `services/python_executor.py` - Safe Python execution
- ✅ `services/storage.py` - Supabase storage integration

## 🧪 Testing Plan

### Test 1: SQL Execution
**Query**: "What's the average transaction amount?"

**Expected**:
1. Orchestrator → SQL_ONLY
2. SQL Agent → Generates: `SELECT AVG(amount) FROM transactions`
3. Backend → Executes with DuckDB
4. Returns: `{ "data": { "records": [{ "avg": 125.50 }] } }`
5. Composer → "The average transaction amount is $125.50"

### Test 2: Python Execution
**Query**: "Write Python code to find outliers"

**Expected**:
1. Orchestrator → PY_ONLY
2. Python Agent → Generates Python code
3. Backend → Executes in sandbox
4. Returns: `{ "data": { "outliers": [...] } }`
5. Composer → "Found 3 outliers: ..."

### Test 3: Hybrid Execution
**Query**: "Which states are statistical outliers?"

**Expected**:
1. Orchestrator → SQL_THEN_PY
2. SQL Agent → Aggregates by state
3. Python Agent → Calculates z-scores
4. Backend → Executes both
5. Composer → "California and Texas are outliers..."

## ⚠️ Important Notes

### CORS Configuration
The backend already has CORS enabled for all origins:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows frontend to call backend
    ...
)
```

### Session ID Requirement
Both SQL and Python execution require a valid `session_id`:
- Session must exist in Supabase
- Session must have uploaded Parquet file
- For testing, use an existing session ID or create one via upload

### Error Handling
Backend returns proper error responses:
```json
{
  "detail": "SQL execution failed: Invalid query"
}
```

Frontend should handle these gracefully and show user-friendly messages.

## 📊 Success Criteria

### Phase 1: Basic Execution ✅
- [ ] Frontend calls real backend API
- [ ] SQL queries execute with DuckDB
- [ ] Python code executes in sandbox
- [ ] Results return to frontend
- [ ] No mock data used

### Phase 2: Agent Pipeline ✅
- [ ] Orchestrator classifies correctly
- [ ] SQL Agent generates valid queries
- [ ] Python Agent generates valid code
- [ ] Composer synthesizes results
- [ ] Explainer explains to user

### Phase 3: Error Handling ✅
- [ ] Invalid SQL shows error message
- [ ] Python timeout handled gracefully
- [ ] Missing session shows helpful error
- [ ] Network errors handled properly

## 🎯 Summary

### What Needs to Change (Frontend Only)

1. **Update .env.local** - Add `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000`
2. **Update tool-executor.ts** - Change API endpoints to backend URLs
3. **Delete mock routes** - Remove `/api/tools/sql` and `/api/tools/python`

### What Doesn't Need to Change (Backend)

**Nothing!** The backend already has:
- ✅ SQL execution endpoint
- ✅ Python execution endpoint
- ✅ DuckDB integration
- ✅ Python sandbox
- ✅ CORS configuration
- ✅ Error handling

### Next Steps

1. I'll update the frontend code
2. You verify backend is running
3. We test end-to-end flow
4. Celebrate! 🎉

---

**Ready to implement?** Let me know and I'll make the frontend changes!
