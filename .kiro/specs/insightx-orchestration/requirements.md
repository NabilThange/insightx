# InsightX Multi-Agent Orchestration System - Requirements

## 1. Overview

InsightX needs a complete frontend-backend orchestration system that handles conversational analytics queries through intelligent agent routing, tool execution, and real-time user feedback. The current implementation references an external backend API but lacks proper agent orchestration, tool execution, and UI feedback mechanisms.

## 2. User Stories

### US-1: Query Processing
**As a** business user  
**I want to** ask questions about my data in plain English  
**So that** I can get instant insights without knowing SQL or Python

**Acceptance Criteria:**
- User can type natural language queries in chat interface
- System automatically routes query to appropriate agent (SQL, Python, or Hybrid)
- User sees real-time status updates during processing
- Results are displayed in easy-to-understand format with explanations

### US-2: Agent Transparency
**As a** user  
**I want to** know which AI agent is handling my request  
**So that** I understand how my query is being processed

**Acceptance Criteria:**
- Toast notification shows which agent is selected (SQL Agent, Python Analyst, etc.)
- Agent icon and name displayed in chat interface
- User can see the reasoning behind agent selection

### US-3: Tool Execution Visibility
**As a** user  
**I want to** see when the system reads data or executes code  
**So that** I understand what operations are being performed

**Acceptance Criteria:**
- Toast notifications for tool calls (read_data_dna, run_sql, run_python)
- Tool execution results visible in workspace sidebar
- Code snippets shown with syntax highlighting

### US-4: API Key Management
**As a** system  
**I want to** automatically failover between API keys when one is exhausted  
**So that** users experience uninterrupted service

**Acceptance Criteria:**
- Automatic key rotation on 429/402 errors
- Toast notification when key switches
- User sees remaining backup keys count
- System continues processing without user intervention

### US-5: Context Awareness
**As a** user  
**I want** the system to remember previous queries and build on them  
**So that** I can have natural follow-up conversations

**Acceptance Criteria:**
- System maintains conversation history
- Agents read Data DNA before generating queries
- Follow-up questions reference previous context
- Accumulated insights stored and reused

## 3. Functional Requirements

### FR-1: Multi-Agent Orchestration
- **FR-1.1**: Orchestrator agent classifies user intent (SQL_ONLY, PY_ONLY, SQL_THEN_PY, EXPLAIN_ONLY)
- **FR-1.2**: System routes to appropriate specialist agent based on classification
- **FR-1.3**: Hybrid queries execute SQL first, then pass results to Python agent
- **FR-1.4**: Composer agent synthesizes final response from specialist outputs
- **FR-1.5**: Explainer agent handles non-execution queries

### FR-2: Tool Execution System
- **FR-2.1**: `read_data_dna` tool loads dataset metadata before query generation
- **FR-2.2**: `run_sql` tool executes DuckDB queries against Parquet files
- **FR-2.3**: `run_python` tool executes statistical analysis code in sandbox
- **FR-2.4**: `read_context` tool retrieves accumulated insights
- **FR-2.5**: `write_context` tool stores new findings for future queries
- **FR-2.6**: Tool results persisted to database for audit trail

### FR-3: Real-Time Feedback System
- **FR-3.1**: Toast notifications for agent selection
- **FR-3.2**: Toast notifications for API key rotation
- **FR-3.3**: Toast notifications for tool execution
- **FR-3.4**: Status messages during long-running operations
- **FR-3.5**: Progress indicators for multi-step workflows

### FR-4: Workspace Integration
- **FR-4.1**: Right sidebar displays Data DNA panel
- **FR-4.2**: Code execution results shown in dedicated panel
- **FR-4.3**: SQL queries displayed with syntax highlighting
- **FR-4.4**: Python code displayed with syntax highlighting
- **FR-4.5**: Results formatted as tables/charts where appropriate

### FR-5: API Key Management
- **FR-5.1**: KeyManager loads multiple Bytez API keys from environment
- **FR-5.2**: Automatic rotation on quota errors (429, 402, 401)
- **FR-5.3**: Failed keys marked and skipped in future attempts
- **FR-5.4**: Success tracking for key health monitoring
- **FR-5.5**: Client-side toast notifications for rotation events

## 4. Non-Functional Requirements

### NFR-1: Performance
- Agent classification: < 2 seconds
- SQL query execution: < 3 seconds for 250K rows
- Python analysis: < 5 seconds for aggregated data
- Hybrid queries: < 8 seconds total
- Toast notifications: < 100ms to display

### NFR-2: Reliability
- 99% uptime for orchestration system
- Automatic failover between API keys
- Graceful degradation if tools fail
- Error messages clear and actionable

### NFR-3: Scalability
- Support up to 12 API keys for failover
- Handle concurrent requests from multiple users
- Queue system for long-running operations
- Efficient memory usage for large datasets

### NFR-4: Security
- API keys stored in environment variables only
- SQL injection prevention via parameterized queries
- Python code execution in sandboxed environment
- User data isolated per session

### NFR-5: Usability
- Toast notifications non-intrusive
- Agent selection reasoning clear
- Error messages helpful and specific
- Code snippets properly formatted

## 5. Technical Constraints

### TC-1: Technology Stack
- Frontend: Next.js 14+ with React
- Backend: Next.js API routes (not external Python backend)
- LLM API: Bytez (OpenAI-compatible)
- Database: Supabase (PostgreSQL)
- Query Engine: DuckDB for SQL execution
- Toast Library: @ark-ui/react/toast

### TC-2: Agent Models
- Orchestrator: anthropic/claude-sonnet-4-5
- SQL Agent: anthropic/claude-sonnet-4-5
- Python Agent: anthropic/claude-sonnet-4-5
- Composer: anthropic/claude-sonnet-4-5
- Explainer: anthropic/claude-sonnet-4-5

### TC-3: Data Storage
- Sessions table: stores session metadata
- Messages table: stores conversation history
- Artifacts table: stores Data DNA and results
- Artifact_versions table: version control for artifacts

### TC-4: Integration Points
- Must work with existing Supabase schema
- Must integrate with current chat UI components
- Must support existing Data DNA format
- Must maintain backward compatibility

## 6. Dependencies

### External Dependencies
- Bytez API for LLM calls
- Supabase for data persistence
- DuckDB for SQL execution (via wasm or server-side)
- @ark-ui/react for toast notifications

### Internal Dependencies
- Existing chat UI components
- Existing Data DNA generation
- Existing workspace layout
- Existing database schema

## 7. Assumptions

1. Data DNA is already generated and stored in sessions table
2. Parquet files are accessible for SQL queries
3. Python execution environment is available (Docker or serverless)
4. Multiple Bytez API keys are configured in environment
5. Users have uploaded datasets before querying

## 8. Out of Scope

- Data upload and exploration (already implemented)
- Database schema changes (use existing schema)
- Visualization generation (future enhancement)
- Real-time collaboration features
- Mobile app support
- Voice input/output

## 9. Success Metrics

### Quantitative Metrics
- 95% of queries successfully classified
- < 5 second average response time
- < 1% API key exhaustion rate
- 90% user satisfaction with explanations
- < 2% error rate in tool execution

### Qualitative Metrics
- Users understand which agent is handling their query
- Users find toast notifications helpful, not annoying
- Users can follow the reasoning in responses
- Users trust the system's accuracy
- Users feel the system is responsive

## 10. Risks and Mitigations

### Risk 1: API Key Exhaustion
**Impact**: High  
**Probability**: Medium  
**Mitigation**: Implement 12-key rotation system with monitoring

### Risk 2: DuckDB Integration Complexity
**Impact**: High  
**Probability**: High  
**Mitigation**: Start with simple SQL queries, expand gradually

### Risk 3: Python Sandbox Security
**Impact**: Critical  
**Probability**: Medium  
**Mitigation**: Use Docker containers with strict resource limits

### Risk 4: Toast Notification Overload
**Impact**: Medium  
**Probability**: Medium  
**Mitigation**: Limit to 5 concurrent toasts, 4-5 second duration

### Risk 5: Context Window Limits
**Impact**: Medium  
**Probability**: High  
**Mitigation**: Implement conversation summarization, selective context injection

## 11. Acceptance Criteria Summary

The orchestration system is complete when:

1. ✅ User can ask natural language questions and get accurate answers
2. ✅ System automatically selects the right agent (SQL/Python/Hybrid)
3. ✅ Toast notifications show agent selection and tool execution
4. ✅ API keys automatically rotate on quota errors
5. ✅ Code and results display in workspace sidebar
6. ✅ System maintains conversation context across queries
7. ✅ All tool calls (read_data_dna, run_sql, run_python) work correctly
8. ✅ Error handling is graceful with clear user feedback
9. ✅ Performance meets NFR targets (< 8 seconds for hybrid queries)
10. ✅ System passes integration tests with existing components

## 12. Next Steps

After requirements approval:
1. Create detailed design document
2. Define agent system prompts
3. Design tool execution architecture
4. Plan database schema updates (if needed)
5. Create implementation task list
