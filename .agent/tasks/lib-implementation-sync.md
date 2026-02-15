# InsightX Lib Implementation Sync

**Objective**: Synchronize `insightx-app/lib` with the reference Ohm implementation structure while adapting for InsightX's analytics domain.

## Reference Architecture Analysis

### File Structure (Reference)
```
lib/
├── agents/
│   ├── orchestrator.ts      # BytezClient + AgentRunner + AssemblyLineOrchestrator (ALL IN ONE)
│   ├── config.ts             # Agent configs with system prompts
│   ├── key-manager.ts        # Multi-key rotation with health tracking
│   ├── tools.ts              # Tool definitions
│   ├── tool-executor.ts      # Tool execution logic
│   ├── context-builder.ts    # Dynamic context injection
│   ├── summarizer.ts         # Conversation summarization
│   ├── toast-notifications.ts # User notifications
│   └── agent-identities.ts   # Agent metadata
├── db/
│   ├── artifacts.ts          # Artifact versioning (Git-style)
│   ├── chat.ts               # Chat/message persistence
│   └── components.ts         # Component management
└── [other modules]
```

### Current Structure (InsightX)
```
lib/
├── agents/
│   ├── orchestrator.ts       # AssemblyLineOrchestrator only
│   ├── bytez-client.ts       # ❌ EXTRA FILE (should be in orchestrator.ts)
│   ├── agent-runner.ts       # ❌ EXTRA FILE (should be in orchestrator.ts)
│   ├── config.ts             # ✅ Exists but different agents
│   ├── key-manager.ts        # ✅ Exists
│   ├── tools.ts              # ✅ Exists
│   ├── tool-executor.ts      # ✅ Exists
│   ├── context-builder.ts    # ✅ Exists
│   ├── summarizer.ts         # ✅ Exists
│   ├── toast-notifications.ts # ✅ Exists
│   └── agent-identities.ts   # ✅ Exists
└── db/                       # ❌ MISSING ENTIRELY
```

## Implementation Plan

### Phase 1: Consolidate Architecture (CRITICAL)
**Goal**: Match reference file structure exactly

#### Task 1.1: Merge BytezClient + AgentRunner into orchestrator.ts
- [x] Read reference `orchestrator.ts` (lines 1-400)
- [ ] Merge `BytezClient` class from `bytez-client.ts` into `orchestrator.ts`
- [ ] Merge `AgentRunner` class from `agent-runner.ts` into `orchestrator.ts`
- [ ] Update `AssemblyLineOrchestrator` to use merged classes
- [ ] Delete `bytez-client.ts` and `agent-runner.ts`
- [ ] Update all imports across codebase

#### Task 1.2: Create Missing Database Layer
- [ ] Create `lib/db/artifacts.ts` (exact copy from reference)
- [ ] Create `lib/db/chat.ts` (exact copy from reference)
- [ ] Create `lib/db/components.ts` (exact copy from reference)
- [ ] Verify Supabase types compatibility

### Phase 2: Adapt Agent Configs for InsightX
**Goal**: Keep InsightX analytics agents but use reference patterns

#### Task 2.1: Update config.ts Structure
- [ ] Keep current agents: `orchestrator`, `sql_agent`, `python_agent`, `composer`, `explainer`
- [ ] Add reference patterns:
  - `icon` field for each agent
  - `description` field
  - Enhanced system prompts with tool call instructions
  - Context-aware prompt injection patterns

#### Task 2.2: Update Tool System
- [ ] Review reference `tools.ts` for pattern improvements
- [ ] Update `tool-executor.ts` to match reference execution flow
- [ ] Add `open_drawer` and `write` tool patterns if applicable

### Phase 3: Update Orchestrator Logic
**Goal**: Match reference orchestration flow

#### Task 3.1: Update AssemblyLineOrchestrator
- [ ] Add `chatId` constructor parameter
- [ ] Implement `getHistory()` method using `ChatService`
- [ ] Add context injection via `AgentContextBuilder`
- [ ] Add tool call persistence in metadata
- [ ] Add conversation summarization trigger

#### Task 3.2: Update API Route
- [ ] Update `app/api/agents/chat/route.ts` to match reference SSE pattern
- [ ] Add proper error handling
- [ ] Add key rotation event streaming

### Phase 4: Testing & Validation
- [ ] Test key rotation with multiple keys
- [ ] Test database persistence
- [ ] Test context injection
- [ ] Test tool execution
- [ ] Verify SSE streaming

## Key Differences to Preserve

### InsightX-Specific (Keep These)
1. **Agents**: SQL, Python, Composer (analytics-focused)
2. **Tools**: `run_sql`, `run_python`, `read_data_dna`
3. **Domain**: Data analytics, not hardware/IoT

### Reference Patterns to Adopt
1. **Architecture**: BytezClient + AgentRunner in orchestrator.ts
2. **Database**: Full artifacts/chat/components layer
3. **Context**: Dynamic context injection
4. **Persistence**: Tool calls in metadata
5. **Summarization**: Background conversation summaries

## Success Criteria

✅ **File Structure Matches Reference**
- No extra files (`bytez-client.ts`, `agent-runner.ts` removed)
- Database layer exists (`lib/db/`)
- All classes in correct locations

✅ **Functionality Preserved**
- All current features work
- API routes unchanged
- Frontend compatibility maintained

✅ **Reference Patterns Adopted**
- Context injection working
- Database persistence working
- Tool execution matches reference
- Key rotation with health tracking

## Execution Order

1. Create database layer (non-breaking)
2. Merge classes into orchestrator.ts
3. Update imports across codebase
4. Delete old files
5. Test thoroughly
6. Update config.ts patterns
7. Final validation

---

**Status**: Planning Complete
**Next**: Execute Phase 1 - Consolidate Architecture
