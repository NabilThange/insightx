# InsightX Orchestration - Implementation Plan

## Executive Summary

Your InsightX app currently has a **weak, unclear frontend backend** that references an external Python API. We need to build a **complete, self-contained orchestration system** within your Next.js app that handles:

1. **Multi-Agent Orchestration** - Routes queries to SQL/Python/Hybrid agents
2. **Tool Execution** - Reads Data DNA, executes SQL/Python code
3. **Real-Time Feedback** - Toast notifications for agent switches and tool calls
4. **API Key Management** - Automatic failover between 12 Bytez keys
5. **Workspace Integration** - Display results in right sidebar

## Current State vs. Target State

### Current State (❌ Broken)
```
User Query → Frontend → External Python Backend (different repo)
                ↓
            ❌ Doesn't work
            ❌ No orchestration
            ❌ No tool execution
            ❌ No feedback
```

### Target State (✅ Working)
```
User Query → Orchestrator Agent → Classifies Intent
                ↓
            SQL Agent / Python Agent / Hybrid
                ↓
            Tool Executor (read_data_dna, run_sql, run_python)
                ↓
            Composer Agent → Final Response
                ↓
            Toast Notifications + Workspace Display
```

## Architecture Overview

### 1. Agent Flow (Based on Reference Project)

```typescript
// Step 1: User asks question
"What's the failure rate for Android users?"

// Step 2: Orchestrator classifies
{
  classification: "SQL_ONLY",
  reasoning: "Simple aggregation query",
  next_agents: ["sql_agent"]
}

// Step 3: SQL Agent executes
Tool Call: read_data_dna() → Gets column names, baselines
Tool Call: run_sql("SELECT ...") → Executes query
Result: { android_failure_rate: 6.2% }

// Step 4: Composer synthesizes
"Android users show 6.2% failure rate, which is 48% higher 
than the overall average of 4.2%."

// Step 5: UI Updates
✅ Toast: "Using SQL Agent"
✅ Toast: "Agent called read_data_dna"
✅ Toast: "Agent called run_sql"
✅ Sidebar: Shows SQL query + results
```

### 2. Key Components to Build

#### A. Agent System (`lib/agents/`)
```
orchestrator.ts       - Routes queries to agents
config.ts            - Agent definitions & prompts
tools.ts             - Tool definitions (read_data_dna, run_sql, etc.)
tool-executor.ts     - Executes tools, persists results
key-manager.ts       - Manages 12 Bytez API keys
toast-notifications.ts - Shows toast messages
```

#### B. API Routes (`app/api/`)
```
/api/chat/stream     - SSE streaming endpoint
/api/tools/sql       - Execute SQL queries
/api/tools/python    - Execute Python code
```

#### C. UI Components (`components/`)
```
ToastProvider.tsx    - Global toast manager
WorkspaceRightSidebar.tsx - Shows Data DNA, code, results
AgentBadge.tsx       - Shows active agent
CodeBlock.tsx        - Syntax-highlighted code display
```

#### D. Database Integration (`lib/db/`)
```
chat.ts              - Message persistence
artifacts.ts         - Store Data DNA, results
sessions.ts          - Session management
```

## Implementation Phases

### Phase 1: Core Orchestration (Week 1)
**Goal**: Get basic agent routing working

**Tasks**:
1. ✅ Create requirements.md (DONE)
2. Create agent config with 5 agents (orchestrator, sql, python, composer, explainer)
3. Implement AgentRunner with Bytez API integration
4. Implement KeyManager with 12-key rotation
5. Create basic orchestrator flow (classify → route → execute)
6. Test with simple SQL query

**Deliverable**: User can ask "What's the average transaction?" and get SQL result

---

### Phase 2: Tool Execution (Week 1-2)
**Goal**: Enable agents to read Data DNA and execute code

**Tasks**:
1. Implement ToolExecutor class
2. Create `read_data_dna` tool (reads from Supabase)
3. Create `run_sql` tool (DuckDB integration)
4. Create `run_python` tool (sandbox execution)
5. Create `read_context` / `write_context` tools
6. Persist tool results to artifacts table

**Deliverable**: Agents can read Data DNA and execute SQL/Python

---

### Phase 3: Toast Notifications (Week 2)
**Goal**: Real-time user feedback

**Tasks**:
1. Install @ark-ui/react/toast
2. Create ToastProvider component
3. Implement toast-notifications.ts (from reference project)
4. Add agent selection toasts
5. Add tool execution toasts
6. Add API key rotation toasts
7. Integrate with orchestrator

**Deliverable**: User sees toast notifications for all agent/tool actions

---

### Phase 4: Workspace Integration (Week 2-3)
**Goal**: Display results in UI

**Tasks**:
1. Update WorkspaceRightSidebar with panels
2. Create DataDNAPanel component
3. Create CodeExecutionPanel component
4. Add syntax highlighting (react-syntax-highlighter)
5. Format SQL/Python results as tables
6. Add copy-to-clipboard functionality

**Deliverable**: Code and results visible in sidebar

---

### Phase 5: Hybrid Execution (Week 3)
**Goal**: SQL→Python workflows

**Tasks**:
1. Implement SQL_THEN_PY classification
2. Pass SQL results to Python agent
3. Handle data serialization between agents
4. Test complex analytical queries
5. Optimize performance

**Deliverable**: "Compare failure rates and identify outliers" works end-to-end

---

### Phase 6: Context & Learning (Week 3-4)
**Goal**: System remembers and learns

**Tasks**:
1. Implement conversation summarization
2. Store accumulated insights in artifacts
3. Inject context into agent prompts
4. Handle follow-up questions
5. Test multi-turn conversations

**Deliverable**: User can ask follow-up questions that reference previous context

---

### Phase 7: Polish & Testing (Week 4)
**Goal**: Production-ready system

**Tasks**:
1. Error handling and edge cases
2. Performance optimization
3. Integration testing
4. User acceptance testing
5. Documentation

**Deliverable**: Fully functional orchestration system

## Technical Decisions

### 1. Why Next.js API Routes (Not External Backend)?
- **Self-contained**: Everything in one repo
- **Simpler deployment**: No separate backend to manage
- **Better DX**: TypeScript end-to-end
- **Easier debugging**: All code in one place

### 2. Why DuckDB for SQL?
- **Fast**: Optimized for analytics
- **Parquet support**: Native integration
- **Embeddable**: Can run in Node.js or WASM
- **SQL standard**: Familiar syntax

### 3. Why @ark-ui/react for Toasts?
- **Proven**: Used in reference project
- **Flexible**: Supports all toast types
- **Performant**: Minimal re-renders
- **Accessible**: ARIA compliant

### 4. Why 12 API Keys?
- **Reliability**: Automatic failover
- **Cost-effective**: Spread usage across keys
- **Scalability**: Handle high traffic
- **Monitoring**: Track per-key usage

## Key Differences from Reference Project

### What We're Copying:
✅ Agent orchestration pattern  
✅ Tool execution architecture  
✅ Toast notification system  
✅ KeyManager with rotation  
✅ Multi-agent workflow  

### What We're Adapting:
🔄 Agent prompts (hardware → analytics)  
🔄 Tool definitions (BOM → Data DNA)  
🔄 Database schema (circuits → sessions)  
🔄 UI components (drawers → sidebar)  

### What We're NOT Copying:
❌ Hardware-specific logic  
❌ Circuit diagram generation  
❌ Component marketplace  
❌ Wiring diagrams  

## Success Criteria

The system is complete when:

1. ✅ User asks "What's the average transaction?" → Gets SQL result in < 3 seconds
2. ✅ User asks "Which states are outliers?" → Gets hybrid SQL→Python analysis
3. ✅ Toast shows "Using SQL Agent" when SQL query runs
4. ✅ Toast shows "Agent called read_data_dna" when tool executes
5. ✅ API key rotates automatically on quota error with toast notification
6. ✅ Workspace sidebar shows SQL query + results
7. ✅ Follow-up question "Why is that?" uses previous context
8. ✅ System handles 100 concurrent users without errors
9. ✅ All tests pass (unit + integration)
10. ✅ Documentation complete

## Next Steps

1. **Review this plan** - Make sure you understand the architecture
2. **Approve requirements.md** - Confirm user stories and acceptance criteria
3. **Start Phase 1** - I'll create the design document and begin implementation
4. **Iterative development** - We'll build and test incrementally

## Questions to Answer

Before we proceed, please confirm:

1. ✅ Do you want to use Next.js API routes (not external Python backend)?
2. ✅ Are you okay with DuckDB for SQL execution?
3. ✅ Do you have 12 Bytez API keys configured in .env.local?
4. ✅ Should we use the existing Supabase schema or modify it?
5. ✅ Any specific UI preferences for toast notifications?

---

**Ready to proceed?** Let me know and I'll create the detailed design document!
