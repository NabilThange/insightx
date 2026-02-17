# Data DNA → Orchestrator Integration Fix

## Problem Identified
The Data DNA agent's system prompt allowed it to directly specify which agents to call (`needs_agents: ["sql_agent", "python_agent"]`), which bypassed the orchestrator and made it redundant. This violated the architectural principle that the orchestrator should be the sole coordinator of multi-agent workflows.

## Solution Implemented

### 1. Updated Data DNA Agent Prompt (`lib/agents/config.ts`)

Changed the response format from:
```json
{
  "can_answer": true/false,
  "answer": "...",
  "reasoning": "...",
  "needs_agents": ["sql_agent", "python_agent"]  // ❌ Direct agent specification
}
```

To:
```json
{
  "can_answer": true/false,
  "answer": "...",
  "reasoning": "...",
  "needs_orchestration": true/false  // ✅ Automatic orchestrator routing
}
```

### 2. Updated Orchestrator Logic (`lib/agents/orchestrator.ts`)

Added explicit handling for the `needs_orchestration` flag:

```typescript
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
}
```

## Architecture Flow (Fixed)

```
User Query
    ↓
Data DNA Agent (Quick Check)
    ↓
Can answer from metadata?
    ├─ YES → Return answer immediately ✅
    └─ NO → Set needs_orchestration: true
              ↓
         Orchestrator Agent (Automatic)
              ↓
         Classifies query type
              ↓
         Routes to SQL/Python agents
              ↓
         Composer synthesizes final response
```

## Key Benefits

1. **Single Source of Truth**: Orchestrator is the only agent that decides which specialist agents to call
2. **Clear Separation of Concerns**: Data DNA focuses on metadata, Orchestrator handles workflow coordination
3. **Automatic Routing**: When Data DNA can't answer, orchestration happens automatically without manual agent specification
4. **Better Logging**: Clear console messages show when orchestration is triggered
5. **User Feedback**: Toast notifications inform users when routing to orchestrator

## Testing

Test with queries that require execution:
- "What's the average transaction amount?" → Should trigger orchestration
- "Which state has the highest fraud rate?" → Should trigger orchestration
- "What columns are in this dataset?" → Should be answered by Data DNA directly

The orchestrator will now be properly utilized for all queries requiring SQL/Python execution.
