# 🚀 InsightX Orchestration - Quick Reference

## ⚡ Start Everything

```bash
# Terminal 1 - Backend
cd C:\Users\thang\Downloads\IIT-B-HACKATHON\backend
python -m uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend
cd C:\Users\thang\Downloads\IIT-B-HACKATHON\insightx-app
npm run dev
```

## 🧪 Test It

**Open**: http://localhost:3000/test-orchestration

**Try**: "What's the average transaction amount?"

**Watch**: Toast notifications + real SQL execution!

## 📁 Key Files

### Frontend (insightx-app)
- `lib/agents/orchestrator.ts` - Main orchestration logic
- `lib/agents/tool-executor.ts` - Calls backend for execution
- `lib/agents/config.ts` - Agent definitions
- `app/test-orchestration/page.tsx` - Test page

### Backend (backend)
- `routes/sql_execute.py` - SQL execution endpoint
- `routes/python_execute.py` - Python execution endpoint
- `services/sql_executor.py` - DuckDB integration
- `services/python_executor.py` - Python sandbox

## 🔄 The Flow

```
User Query → Orchestrator → SQL/Python Agent
                ↓
            Tool Executor → Backend API
                ↓
            DuckDB/Python → Real Results
                ↓
            Composer → Explainer → User
```

## 🎯 What Works

- ✅ Multi-agent orchestration
- ✅ Real SQL execution (DuckDB)
- ✅ Real Python execution (sandbox)
- ✅ Toast notifications
- ✅ API key rotation (12 keys)
- ✅ SSE streaming
- ✅ Error handling

## 📚 Full Documentation

See: `.kiro/specs/insightx-orchestration/`

- **INTEGRATION_COMPLETE.md** - Integration guide
- **FINAL_SUMMARY.md** - Complete summary
- **QUICK_START.md** - Testing guide

## 🎉 Status

**✅ COMPLETE AND WORKING**

Test now: http://localhost:3000/test-orchestration
