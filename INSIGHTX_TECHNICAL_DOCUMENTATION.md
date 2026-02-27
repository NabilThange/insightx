# InsightX - Technical Documentation

**Version:** 1.0.0  
**Date:** February 26, 2026  
**Project Type:** Conversational Analytics Platform  
**Built For:** IIT-B Hackathon

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Data Analysis Methodology](#4-data-analysis-methodology)
5. [Key Features & Functionality](#5-key-features--functionality)
6. [Directory Structure & File Organization](#6-directory-structure--file-organization)
7. [Setup & Installation Instructions](#7-setup--installation-instructions)
8. [Development Workflow](#8-development-workflow)
9. [API Endpoints Reference](#9-api-endpoints-reference)
10. [Deployment](#10-deployment)

---

## 1. Executive Summary

### 1.1 Project Overview

InsightX is a sophisticated conversational analytics platform designed for digital payments analysis. It enables business users to interact with their data using natural language queries and receive instant, data-backed insights through an intelligent multi-agent AI system.

### 1.2 Core Purpose

The platform transforms complex data analysis into simple conversations. Users can upload CSV files and ask questions like "What's the success rate?" or "Show me transactions over $1000" and receive comprehensive answers with visualizations, statistical analysis, and actionable insights.

### 1.3 Key Innovation

InsightX implements a hybrid SQL→Python architecture that achieves 10-50x performance improvements by intelligently routing queries between:
- **DuckDB** for fast data aggregation (columnar storage)
- **Python** for statistical analysis and machine learning
- **Multi-Agent System** for intelligent query classification and execution

### 1.4 Core Technologies

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend:** FastAPI (Python), DuckDB, pandas, scipy
- **Database:** Supabase (PostgreSQL + S3-compatible Storage)
- **AI/LLM:** Claude Sonnet 4.5 via Bytez API
- **Deployment:** Vercel (frontend), Railway (backend)

### 1.5 Project Status

✅ Production-ready with full deployment pipeline  
✅ Complete multi-agent orchestration system  
✅ Real-time streaming responses via SSE  
✅ Comprehensive data profiling and analysis  
✅ Interactive visualizations with Recharts

---


## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                        │
│  Next.js Frontend (Vercel) - React + Zustand + Tailwind + GSAP │
│  - Landing Page, Upload Interface, Workspace, Reports          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP/SSE (REST API)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    API GATEWAY LAYER                            │
│  FastAPI (Railway) - CORS + Routing + Request Handling         │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────┐         ┌──────────┐        ┌──────────┐
   │ Upload  │         │ Explore  │        │ Chat     │
   │ Service │         │ Service  │        │ Service  │
   └────┬────┘         └────┬─────┘        └────┬─────┘
        │                   │                    │
        └───────────────────┼────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐
   │ Orchestrator│  │ SQL Executor │  │ Python Executor  │
   │ Agent       │  │ (DuckDB)     │  │ (pandas/scipy)   │
   └─────────────┘  └──────────────┘  └──────────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   ┌──────────┐      ┌──────────┐      ┌──────────────┐
   │ Bytez    │      │ Railway  │      │ Supabase     │
   │ API      │      │ Disk     │      │ (PostgreSQL) │
   │(Claude)  │      │ Cache    │      │ + Storage    │
   └──────────┘      └──────────┘      └──────────────┘
```

### 2.2 Component Communication

**Frontend → Backend:**
- REST API calls for CRUD operations
- Server-Sent Events (SSE) for streaming responses
- WebSocket-like real-time updates via Supabase subscriptions

**Backend → Database:**
- Supabase client for PostgreSQL operations
- Direct S3-compatible storage for file operations
- Local disk caching for performance optimization

**Backend → AI:**
- Bytez API for Claude Sonnet 4.5 inference
- OpenAI-compatible API format
- Automatic key rotation for resilience

### 2.3 Data Flow Architecture

```
User Upload CSV
    ↓
Convert to Parquet (10-50x faster)
    ↓
Store in Supabase Storage + Railway Cache
    ↓
Generate Data DNA (exploratory analysis)
    ↓
User Asks Question
    ↓
Orchestrator Agent Classifies Query
    ↓
┌─────────────────────────────────────────┐
│ SQL_ONLY → SQL Agent → DuckDB           │
│ PY_ONLY → Python Agent → Analysis       │
│ SQL_THEN_PY → SQL → Python (Hybrid)     │
│ EXPLAIN_ONLY → Reference Insights       │
└─────────────────────────────────────────┘
    ↓
Composer Agent Synthesizes Response
    ↓
Stream Results to Frontend (SSE)
    ↓
Display with Visualizations
```

### 2.4 Multi-Agent System

InsightX implements a sophisticated 5-agent system:

1. **Orchestrator Agent** - Classifies queries and routes to specialists
2. **SQL Agent** - Generates and executes DuckDB queries
3. **Python Agent** - Performs statistical analysis and ML
4. **Composer Agent** - Synthesizes results into user-friendly responses
5. **Explainer Agent** - Handles general knowledge questions

Each agent is powered by Claude Sonnet 4.5 with specialized prompts and tool access.

---


## 3. Technology Stack

### 3.1 Frontend Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | Next.js | 16.1.6 | React framework with App Router |
| UI Library | React | 19.2.3 | Component-based UI |
| Language | TypeScript | 5.x | Type-safe development |
| Styling | Tailwind CSS | 4.x | Utility-first CSS framework |
| State Management | Zustand | 5.0.11 | Lightweight state management |
| Animations | GSAP | 3.14.2 | High-performance animations |
| UI Components | shadcn/ui | Latest | Accessible component library |
| Charts | Recharts | 3.7.0 | Data visualization |
| Markdown | react-markdown | 10.1.0 | Markdown rendering |
| Code Highlighting | react-syntax-highlighter | 16.1.0 | Syntax highlighting |
| Database Client | @supabase/supabase-js | 2.95.3 | Supabase integration |
| AI SDK | ai | 6.0.90 | AI/LLM utilities |
| HTTP Client | Fetch API | Native | REST API calls |

**Key Frontend Dependencies:**
- `framer-motion` - Advanced animations
- `lucide-react` - Icon library
- `clsx` + `tailwind-merge` - Conditional styling
- `streamdown` - Markdown streaming
- `@radix-ui` - Accessible primitives

### 3.2 Backend Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | FastAPI | Latest | Python async web framework |
| Language | Python | 3.13+ | Backend programming |
| Query Engine | DuckDB | Latest | In-process SQL OLAP database |
| Data Processing | pandas | Latest | Data manipulation |
| Scientific Computing | numpy | Latest | Numerical operations |
| Statistics | scipy | Latest | Statistical analysis |
| File Format | pyarrow | Latest | Parquet support |
| Database Client | supabase-py | Latest | Supabase Python client |
| HTTP Client | httpx | Latest | Async HTTP requests |
| Server | uvicorn | Latest | ASGI server |
| Environment | python-dotenv | Latest | Environment variables |
| Validation | pydantic | Latest | Data validation |

**Backend Dependencies Explained:**
- **FastAPI** - Modern, fast web framework with automatic API docs
- **DuckDB** - Columnar database for 10-50x faster queries than CSV
- **pandas** - Industry-standard data manipulation library
- **scipy** - Statistical tests, outlier detection, confidence scoring
- **pyarrow** - Efficient Parquet file handling

### 3.3 Database & Storage

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Primary Database | PostgreSQL (Supabase) | User data, sessions, chats, messages |
| File Storage | S3-compatible (Supabase) | CSV and Parquet files |
| Local Cache | Railway Disk | Fast Parquet access |
| Data Format | Parquet | Columnar storage (10-50x faster) |
| Real-time | Supabase Realtime | Live updates |

**Database Schema:**
- `users` - User accounts
- `sessions` - Dataset sessions with Data DNA
- `chats` - Chat threads
- `messages` - Chat messages with metadata
- `workspace_sidebar` - Sidebar context
- `context_insights` - Accumulated insights

### 3.4 AI & LLM

| Component | Technology | Purpose |
|-----------|-----------|---------|
| LLM Provider | Bytez API | Claude API access |
| Model | Claude Sonnet 4.5 | Multi-agent orchestration |
| API Format | OpenAI-compatible | Standard API interface |
| Temperature | 0.2-0.5 | Varies by agent role |
| Max Tokens | 500-1500 | Varies by agent role |

**Agent Configuration:**
- Orchestrator: Temperature 0.3, 500 tokens
- SQL Agent: Temperature 0.2, 1000 tokens (deterministic)
- Python Agent: Temperature 0.3, 1500 tokens
- Composer: Temperature 0.5, 1000 tokens (creative)
- Explainer: Temperature 0.4, 800 tokens

### 3.5 Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| TypeScript Compiler | Type checking |
| PostCSS | CSS processing |
| Git | Version control |
| npm | Package management |
| pip | Python package management |

### 3.6 Deployment Infrastructure

| Component | Platform | Purpose |
|-----------|----------|---------|
| Frontend Hosting | Vercel | Serverless Next.js deployment |
| Backend Hosting | Railway | Container-based Python hosting |
| Database | Supabase Cloud | Managed PostgreSQL + Storage |
| CDN | Vercel Edge Network | Global content delivery |
| SSL/TLS | Automatic | HTTPS encryption |

---


## 4. Data Analysis Methodology

### 4.1 Query Processing Pipeline

```
User Query Input
    ↓
1. QUERY INGESTION
   - Receive natural language question
   - Load conversation history
   - Retrieve Data DNA context
    ↓
2. QUERY CLASSIFICATION (Orchestrator Agent)
   - Analyze query intent
   - Determine required operations
   - Classify as: SQL_ONLY, PY_ONLY, SQL_THEN_PY, or EXPLAIN_ONLY
    ↓
3. EXECUTION ROUTING
   ┌─────────────────────────────────────────┐
   │ SQL_ONLY: Simple aggregation/filtering  │
   │ → SQL Agent generates DuckDB query      │
   │ → Execute on Parquet file               │
   │ → Return structured results             │
   │                                         │
   │ PY_ONLY: ML/forecasting/complex stats   │
   │ → Python Agent generates analysis code  │
   │ → Execute with pandas/scipy             │
   │ → Return statistical findings           │
   │                                         │
   │ SQL_THEN_PY: Hybrid (27x faster!)       │
   │ → SQL Agent aggregates 250K → 28 rows   │
   │ → Python Agent analyzes 28 rows         │
   │ → Combine results                       │
   │                                         │
   │ EXPLAIN_ONLY: General knowledge         │
   │ → Reference accumulated insights        │
   │ → Explainer Agent generates response    │
   └─────────────────────────────────────────┘
    ↓
4. RESULT SYNTHESIS (Composer Agent)
   - Combine SQL/Python results
   - Generate user-friendly explanation
   - Create visualization specifications
   - Add confidence scores
   - Suggest follow-up questions
    ↓
5. RESPONSE DELIVERY
   - Stream via Server-Sent Events (SSE)
   - Display thinking process
   - Render visualizations
   - Save to conversation history
```

### 4.2 Data DNA Generation

When a dataset is uploaded, InsightX automatically generates a comprehensive "Data DNA" profile:

**Schema Profiling:**
- Column names, types, and data types
- Null percentages and unique counts
- Min/max/mean/std for numeric columns
- Top values and distributions for categorical columns

**Statistical Baselines:**
- Dataset-wide averages and totals
- Success rates and conversion metrics
- Peak hours/days and temporal patterns
- Date ranges and time spans

**Pattern Detection:**
- Seasonality identification
- Correlation analysis between columns
- Relationship hints for cross-tabulation
- Anomaly pre-scanning

**Anomaly Detection:**
- High null columns (>30%)
- Suspicious distributions
- Column role detection (amount vs ID vs count)
- Data quality issues

### 4.3 Hybrid SQL→Python Architecture

**The Performance Breakthrough:**

Traditional approach (slow):
```
Load 250,000 rows → Python analysis → 30+ seconds
```

InsightX hybrid approach (fast):
```
SQL: 250,000 rows → Aggregate → 28 rows (0.5 seconds)
Python: Analyze 28 rows → Results (0.5 seconds)
Total: ~1 second (27x faster!)
```

**When to Use Each:**
- **SQL Only:** Simple counts, sums, filters, grouping
- **Python Only:** ML models, forecasting, complex algorithms
- **SQL→Python:** Statistical analysis on aggregated data

### 4.4 Statistical Analysis Capabilities

**Python Agent Tools:**
- **scipy.stats** - T-tests, chi-square, ANOVA, correlation
- **Z-score analysis** - Outlier detection
- **Baseline comparison** - Change detection
- **Confidence scoring** - Result reliability (0-100%)
- **Trend analysis** - Time series patterns

**Example Analysis:**
```python
# Detect outliers using Z-score
from scipy import stats
z_scores = np.abs(stats.zscore(data['amount']))
outliers = data[z_scores > 3]

# Statistical significance test
t_stat, p_value = stats.ttest_ind(group_a, group_b)
confidence = (1 - p_value) * 100
```

### 4.5 Visualization Generation

**Chart Types Supported:**
- Bar charts - Categorical comparisons
- Line charts - Time series trends
- Scatter plots - Correlation analysis
- Pie charts - Proportional data

**Chart Specification Format:**
```json
{
  "type": "bar",
  "data": [
    {"category": "Success", "value": 49000},
    {"category": "Failed", "value": 1000}
  ],
  "xAxis": "category",
  "yAxis": "value",
  "title": "Transaction Status Distribution"
}
```

### 4.6 Accumulated Insights System

InsightX maintains a growing knowledge base of insights:

**Insight Structure:**
```json
{
  "query": "What's the success rate?",
  "finding": "98% success rate, up 2% from baseline",
  "confidence": 95,
  "timestamp": "2026-02-26T10:30:00Z",
  "sql_used": "SELECT COUNT(*) WHERE status='success'",
  "python_used": "scipy.stats.ttest_ind(...)"
}
```

**Benefits:**
- Faster responses for repeated questions
- Context-aware follow-up answers
- Trend tracking over time
- Consistency in analysis

---


## 5. Key Features & Functionality

### 5.1 Data Upload & Processing

**Feature:** Drag-and-drop CSV upload with automatic conversion

**How it Works:**
1. User drags CSV file onto upload zone
2. Frontend sends file to backend via multipart/form-data
3. Backend converts CSV to Parquet format (10-50x faster)
4. Both files uploaded to Supabase Storage
5. Parquet cached locally on Railway disk
6. Session created in database with metadata

**Components Involved:**
- Frontend: `app/connect/page.tsx`, `components/data/ScanningAnimation.tsx`
- Backend: `routes/upload.py`, `services/storage.py`
- Database: `sessions` table

**User Interaction:**
- Drag file or click to browse
- See real-time upload progress
- Automatic redirect to workspace when ready

### 5.2 Automatic Data Profiling (Data DNA)

**Feature:** Comprehensive dataset analysis without writing code

**How it Works:**
1. After upload, exploration automatically triggered
2. Backend loads Parquet file
3. Generates schema profile, baselines, patterns, anomalies
4. Stores as JSON in `sessions.data_dna` column
5. Frontend displays insights and suggested queries

**Components Involved:**
- Backend: `routes/explore.py`, `services/explorer.py`
- Frontend: `components/data/DataDnaPreview.tsx`
- Database: `sessions.data_dna` JSONB column

**User Interaction:**
- Automatic - no user action required
- See scanning animation with progress
- View detected patterns and insights
- Get suggested queries to start with

### 5.3 Natural Language Querying

**Feature:** Ask questions in plain English, get data-backed answers

**How it Works:**
1. User types question in chat input
2. Orchestrator agent classifies query type
3. Routes to appropriate specialist agent
4. Agent generates SQL or Python code
5. Executes on backend
6. Composer synthesizes user-friendly response
7. Streams back via SSE with visualizations

**Components Involved:**
- Frontend: `components/chat/ChatInput.tsx`, `lib/agents/orchestrator.ts`
- Backend: `routes/chat.py`, `services/orchestrator.py`
- Agents: All 5 specialist agents

**User Interaction:**
- Type natural language question
- See thinking process in real-time
- View SQL/Python code used
- Get answer with metrics and charts

### 5.4 Real-Time Streaming Responses

**Feature:** See AI thinking process as it happens

**How it Works:**
1. Backend opens Server-Sent Events (SSE) stream
2. Emits events as orchestration progresses:
   - Status updates ("Loading dataset...")
   - Orchestrator classification
   - SQL query generation and results
   - Python analysis execution
   - Final composed response
3. Frontend updates UI for each event
4. Displays thinking process, code, and results

**Components Involved:**
- Backend: `routes/chat.py` (SSE streaming)
- Frontend: `lib/api/backend.ts` (SSE client), `components/chat/ThinkingProcess.tsx`

**User Interaction:**
- Watch AI "think" in real-time
- See which agent is working
- View generated code
- Understand reasoning process

### 5.5 Interactive Data Visualizations

**Feature:** Automatic chart generation from query results

**How it Works:**
1. Composer agent analyzes results
2. Determines appropriate chart type
3. Generates chart specification JSON
4. Frontend renders with Recharts library
5. Interactive tooltips and legends

**Components Involved:**
- Backend: Composer agent in `services/orchestrator.py`
- Frontend: `components/data/` chart components, Recharts

**User Interaction:**
- Hover for detailed values
- Toggle data series
- Responsive to screen size
- Export-ready visualizations

### 5.6 Multi-Chat Sessions

**Feature:** Organize analyses into separate conversations

**How it Works:**
1. Each dataset session can have multiple chats
2. Chats stored in `chats` table with session reference
3. Messages linked to specific chat
4. Switch between chats in sidebar
5. Each chat maintains its own context

**Components Involved:**
- Frontend: `components/workspace/WorkspaceSidebar.tsx`
- Backend: `routes/chats.py`
- Database: `chats` and `messages` tables

**User Interaction:**
- Create new chat threads
- Switch between conversations
- Rename chats
- Delete old chats

### 5.7 Context-Aware Responses

**Feature:** AI remembers previous questions and builds on them

**How it Works:**
1. Conversation history passed with each query
2. Accumulated insights stored in Data DNA
3. Agents reference past findings
4. Consistent terminology and metrics
5. Follow-up questions understand context

**Components Involved:**
- Backend: `services/orchestrator.py` (history management)
- Database: `sessions.data_dna.accumulated_insights`
- Agents: All agents have access to context

**User Interaction:**
- Ask follow-up questions naturally
- Reference previous findings
- Build complex analyses step-by-step
- Get consistent answers

### 5.8 SQL Query Execution

**Feature:** Direct SQL queries on uploaded data

**How it Works:**
1. SQL Agent generates DuckDB-compatible query
2. Backend validates for safety (no DROP, DELETE, etc.)
3. Executes on local Parquet file
4. Returns structured results
5. Applies row limits (500 default)

**Components Involved:**
- Backend: `services/sql_executor.py`, `routes/sql_execute.py`
- DuckDB: In-process query engine
- Safety: Keyword blocking, regex validation

**User Interaction:**
- Ask data questions naturally
- See generated SQL query
- View results in table format
- Understand query logic

### 5.9 Python Statistical Analysis

**Feature:** Advanced statistical tests and ML capabilities

**How it Works:**
1. Python Agent generates analysis code
2. Backend validates code (AST check)
3. Executes in isolated environment
4. Uses pandas, numpy, scipy
5. Returns statistical findings with confidence scores

**Components Involved:**
- Backend: `services/python_executor.py`, `routes/python_execute.py`
- Libraries: pandas, scipy, numpy
- Safety: Import whitelist, timeout protection

**User Interaction:**
- Request statistical analysis
- See Python code used
- Get confidence scores
- Understand methodology

### 5.10 Saved Reports & Insights

**Feature:** Gallery of saved analyses for future reference

**How it Works:**
1. User saves interesting findings
2. Stored as artifacts in database
3. Displayed in reports gallery
4. Filterable and searchable
5. Shareable links

**Components Involved:**
- Frontend: `app/reports/page.tsx`, `components/data/ReportCard.tsx`
- Database: Artifacts storage
- State: `store/dataStore.ts`

**User Interaction:**
- Save important insights
- Browse past analyses
- Filter by date/type
- Share with team

---


## 6. Directory Structure & File Organization

### 6.1 Frontend Structure

```
insightx-app/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout with providers
│   ├── globals.css               # Global styles
│   ├── connect/                  # Data upload page
│   │   └── page.tsx
│   ├── workspace/                # Main analytics interface
│   │   ├── page.tsx              # Workspace router
│   │   └── [id]/page.tsx         # Active workspace
│   ├── reports/                  # Saved insights gallery
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── recents/page.tsx          # Recent sessions
│   ├── login/page.tsx            # Authentication
│   └── api/                      # Next.js API routes
│       ├── chat/stream/route.ts  # SSE streaming
│       └── agents/               # Agent endpoints
│
├── components/                   # React components
│   ├── chat/                     # Chat interface components
│   │   ├── ChatInput.tsx         # Message input
│   │   ├── ChatTimeline.tsx      # Message history
│   │   ├── UserMessage.tsx       # User message bubble
│   │   ├── AgentMessage.tsx      # AI response bubble
│   │   ├── AgentBadge.tsx        # Agent identifier
│   │   └── ThinkingProcess.tsx   # AI thinking visualization
│   ├── data/                     # Data display components
│   │   ├── DataDnaPreview.tsx    # Dataset profile
│   │   ├── ColumnCard.tsx        # Column statistics
│   │   ├── InsightCard.tsx       # Insight display
│   │   ├── CodeBlock.tsx         # Code syntax highlighting
│   │   └── ScanningAnimation.tsx # Upload animation
│   ├── workspace/                # Workspace layout
│   │   ├── WorkspaceLayout.tsx
│   │   ├── WorkspaceSidebar.tsx
│   │   ├── ChatPanel.tsx
│   │   └── DataDNAPanel.tsx
│   ├── interactive/              # Interactive UI elements
│   │   ├── SuggestedQueryChips.tsx
│   │   ├── FollowUpSuggester.tsx
│   │   └── DatasetBadge.tsx
│   ├── layout/                   # Page layout components
│   │   ├── GlobalHeader.tsx
│   │   └── ContextSidebar.tsx
│   ├── ui/                       # Reusable UI primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ... (shadcn/ui components)
│   └── LandingPage.tsx           # Landing page component
│
├── lib/                          # Core libraries and utilities
│   ├── agents/                   # Local agent system
│   │   ├── orchestrator.ts       # Multi-agent coordinator
│   │   ├── config.ts             # Agent configurations
│   │   ├── tools.ts              # Tool definitions
│   │   ├── tool-executor.ts      # Tool execution logic
│   │   ├── agent-identities.ts   # Agent metadata
│   │   ├── key-manager.ts        # API key rotation
│   │   └── toast-notifications.ts # Toast events
│   ├── api/                      # API client layer
│   │   ├── backend.ts            # Backend API calls
│   │   ├── chats.ts              # Chat operations
│   │   ├── messages.ts           # Message operations
│   │   └── sessions.ts           # Session operations
│   ├── db/                       # Database operations
│   │   ├── chat.ts               # Chat database
│   │   ├── artifacts.ts          # Saved reports
│   │   ├── context.ts            # Context management
│   │   └── sidebar.ts            # Sidebar state
│   ├── hooks/                    # React hooks
│   │   ├── useChats.ts
│   │   ├── useMessages.ts
│   │   └── useSession.ts
│   ├── supabase/                 # Supabase integration
│   │   ├── client.ts             # Supabase client
│   │   └── types.ts              # Type definitions
│   └── utils/                    # Utility functions
│       ├── logger.ts             # Structured logging
│       ├── toast.tsx             # Toast notifications
│       └── response-parser.ts    # Response parsing
│
├── store/                        # Zustand state management
│   ├── chatStore.ts              # Chat state
│   ├── dataStore.ts              # Dataset state
│   └── workspaceStore.ts         # Workspace UI state
│
├── public/                       # Static assets
│   ├── images/
│   └── fonts/
│
├── .kiro/                        # Kiro AI configuration
│   ├── specs/                    # Project specifications
│   └── settings/
│
├── MASTER_CONTEXT/               # Project documentation
│   ├── README.md
│   ├── MASTER_ARCHITECTURE_DOCUMENT.md
│   ├── FRONTEND_MASTER_DOC.md
│   └── ... (other docs)
│
├── package.json                  # Frontend dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── next.config.ts                # Next.js configuration
└── .env.local                    # Environment variables
```

### 6.2 Backend Structure

```
backend/
├── routes/                       # API endpoint handlers
│   ├── upload.py                 # POST /api/upload
│   ├── explore.py                # POST /api/explore/{session_id}
│   ├── sessions.py               # GET /api/session/{session_id}
│   ├── chats.py                  # Chat CRUD operations
│   ├── chat.py                   # POST /api/chat/stream (SSE)
│   ├── sql_execute.py            # POST /api/sql/execute
│   ├── python_execute.py         # POST /api/python/execute
│   └── insights.py               # Insights management
│
├── services/                     # Business logic layer
│   ├── orchestrator.py           # Multi-agent workflow
│   ├── sql_executor.py           # DuckDB query execution
│   ├── python_executor.py        # Python code execution
│   ├── explorer.py               # Data DNA generation
│   ├── bytez_client.py           # LLM API client
│   ├── key_manager.py            # API key rotation
│   ├── storage.py                # Supabase Storage helpers
│   ├── duckdb_runner.py          # DuckDB operations
│   ├── agent_config.py           # Agent prompts
│   └── context_service.py        # Context management
│
├── models/                       # Data models
│   └── schemas.py                # Pydantic request/response models
│
├── db/                           # Database layer
│   └── client.py                 # Supabase client singleton
│
├── migrations/                   # Database migrations
│   ├── 001_create_workspace_sidebar_table.sql
│   ├── 002_migrate_existing_data.sql
│   └── ... (other migrations)
│
├── main.py                       # FastAPI application entry
├── requirements.txt              # Python dependencies
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── run.bat                       # Windows startup script
├── run.sh                        # Unix startup script
├── sample_data.csv               # Test dataset
│
└── Documentation/                # Backend documentation
    ├── README.md
    ├── START_HERE.md
    ├── SETUP_GUIDE.md
    ├── ARCHITECTURE.md
    └── BUILD_SUMMARY.md
```

### 6.3 Key File Purposes

**Frontend Key Files:**

- `app/workspace/[id]/page.tsx` - Main analytics interface where users interact with data
- `lib/agents/orchestrator.ts` - Core orchestration logic for routing queries
- `lib/agents/tool-executor.ts` - Executes tools (SQL, Python) via backend APIs
- `store/chatStore.ts` - Manages chat sessions and message history
- `store/dataStore.ts` - Manages dataset and Data DNA state
- `components/chat/AgentMessage.tsx` - Displays AI responses with visualizations

**Backend Key Files:**

- `main.py` - FastAPI application with CORS and route registration
- `services/orchestrator.py` - Multi-agent workflow coordinator
- `services/sql_executor.py` - Safe SQL execution with DuckDB
- `services/python_executor.py` - Sandboxed Python code execution
- `services/explorer.py` - Automatic Data DNA generation
- `routes/chat.py` - SSE streaming endpoint for real-time responses

### 6.4 Configuration Files

- `package.json` - Frontend dependencies and scripts
- `requirements.txt` - Backend Python dependencies
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.js` - Tailwind CSS theme and plugins
- `next.config.ts` - Next.js build configuration
- `.env.local` - Frontend environment variables
- `backend/.env` - Backend environment variables

---


## 7. Setup & Installation Instructions

### 7.1 Prerequisites

**Required Software:**
- Node.js 20.x or higher
- npm 10.x or higher
- Python 3.13 or higher
- pip (Python package manager)
- Git

**Required Accounts:**
- Supabase account (free tier available)
- Bytez API account for Claude access
- Vercel account (for deployment, optional)
- Railway account (for deployment, optional)

### 7.2 Frontend Setup

**Step 1: Clone Repository**
```bash
git clone <repository-url>
cd insightx-app
```

**Step 2: Install Dependencies**
```bash
npm install
```

**Step 3: Configure Environment Variables**

Create `.env.local` file in root directory:
```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xvtqbvavwbowyyoevolo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Bytez API (for local agent system)
NEXT_PUBLIC_BYTEZ_API_KEY=your-bytez-api-key-here
```

**Step 4: Start Development Server**
```bash
npm run dev
```

Frontend will be available at: `http://localhost:3000`

**Step 5: Build for Production**
```bash
npm run build
npm start
```

### 7.3 Backend Setup

**Step 1: Navigate to Backend Directory**
```bash
cd backend
```

**Step 2: Create Virtual Environment**

Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

Mac/Linux:
```bash
python -m venv venv
source venv/bin/activate
```

**Step 3: Install Dependencies**
```bash
pip install -r requirements.txt
```

**Step 4: Configure Environment Variables**

Copy `.env.example` to `.env`:
```bash
copy .env.example .env  # Windows
cp .env.example .env    # Mac/Linux
```

Edit `.env` file:
```env
# Supabase Configuration
SUPABASE_URL=https://xvtqbvavwbowyyoevolo.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Bytez API Keys (for Claude)
BYTEZ_API_KEY_1=your-primary-api-key
BYTEZ_API_KEY_2=your-fallback-api-key
```

**Getting Supabase Service Key:**
1. Go to: https://supabase.com/dashboard/project/xvtqbvavwbowyyoevolo/settings/api
2. Find the "service_role" key (NOT the anon key)
3. Copy and paste into `.env`

**Step 5: Start Backend Server**

Windows:
```bash
run.bat
```

Mac/Linux:
```bash
chmod +x run.sh
./run.sh
```

Or manually:
```bash
uvicorn main:app --reload
```

Backend will be available at: `http://localhost:8000`
API documentation at: `http://localhost:8000/docs`

### 7.4 Database Setup

**Supabase Tables:**

The following tables should exist in your Supabase project:

1. **users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

2. **sessions**
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  filename TEXT NOT NULL,
  row_count INTEGER,
  status TEXT DEFAULT 'uploading',
  data_dna JSONB,
  parquet_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. **chats**
```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

4. **messages**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id),
  role TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Supabase Storage:**

Create a storage bucket named `datasets`:
1. Go to Supabase Dashboard → Storage
2. Create new bucket: `datasets`
3. Set to public or private based on requirements

**Run Migrations:**

Execute migration files in `backend/migrations/` in order:
```bash
# Connect to Supabase and run each .sql file
```

### 7.5 Testing the Installation

**Test Backend:**
1. Open `http://localhost:8000/docs`
2. Try the health check endpoint: `GET /`
3. Upload test file: `POST /api/upload` with `backend/sample_data.csv`
4. Check response for session_id

**Test Frontend:**
1. Open `http://localhost:3000`
2. Navigate to `/connect`
3. Upload a CSV file
4. Wait for Data DNA generation
5. Should redirect to `/workspace/{session_id}`
6. Try asking a question

**Test Integration:**
1. Upload dataset via frontend
2. Ask question: "What's the total count?"
3. Verify response appears
4. Check backend logs for agent execution
5. Verify data saved in Supabase

### 7.6 Common Setup Issues

**Issue: "SUPABASE_SERVICE_KEY must be set"**
- Solution: Add service role key to `backend/.env`

**Issue: "Module not found" errors**
- Solution: Run `pip install -r requirements.txt` in activated venv

**Issue: "Port 8000 already in use"**
- Solution: Kill existing process or use different port:
  ```bash
  uvicorn main:app --reload --port 8001
  ```

**Issue: "Cannot connect to Supabase"**
- Solution: Verify URL and keys in `.env` files
- Check Supabase project is active

**Issue: Frontend can't reach backend**
- Solution: Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check backend is running on correct port
- Verify CORS settings in `backend/main.py`

**Issue: "Bytez API key invalid"**
- Solution: Verify API key is correct
- Check key has sufficient credits
- Try fallback key if available

### 7.7 Development Tools Setup

**Recommended VS Code Extensions:**
- ESLint
- Prettier
- Python
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

**Optional Tools:**
- Postman or Insomnia for API testing
- DBeaver for database management
- React Developer Tools browser extension

---


## 8. Development Workflow

### 8.1 Adding New Features

**General Workflow:**
1. Create feature branch from main
2. Implement changes in appropriate layer
3. Test locally
4. Update documentation
5. Create pull request
6. Deploy after review

### 8.2 Adding Frontend Components

**Location:** `components/` directory

**Steps:**
1. Create new component file in appropriate subdirectory:
   - `components/chat/` - Chat-related components
   - `components/data/` - Data display components
   - `components/workspace/` - Workspace layout
   - `components/ui/` - Reusable UI primitives

2. Follow naming convention: `ComponentName.tsx`

3. Use TypeScript for type safety:
```typescript
interface MyComponentProps {
  title: string;
  data: any[];
  onAction?: () => void;
}

export function MyComponent({ title, data, onAction }: MyComponentProps) {
  // Component logic
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

4. Import and use in pages or other components

5. Add to exports if needed for reusability

### 8.3 Adding Backend Routes

**Location:** `backend/routes/` directory

**Steps:**
1. Create new route file: `backend/routes/my_feature.py`

2. Define router and endpoints:
```python
from fastapi import APIRouter, HTTPException
from models.schemas import MyRequest, MyResponse

router = APIRouter()

@router.post("/my-endpoint")
async def my_endpoint(request: MyRequest) -> MyResponse:
    try:
        # Business logic
        result = await process_request(request)
        return MyResponse(data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

3. Register router in `backend/main.py`:
```python
from routes import my_feature

app.include_router(my_feature.router, prefix="/api", tags=["My Feature"])
```

4. Test endpoint at `http://localhost:8000/docs`

### 8.4 Adding Backend Services

**Location:** `backend/services/` directory

**Steps:**
1. Create service file: `backend/services/my_service.py`

2. Implement service logic:
```python
from db.client import get_supabase

async def my_service_function(param: str) -> dict:
    """Service function description."""
    supabase = get_supabase()
    
    # Business logic
    result = await supabase.table("my_table").select("*").execute()
    
    return {"data": result.data}
```

3. Import and use in routes:
```python
from services.my_service import my_service_function

@router.get("/data")
async def get_data():
    return await my_service_function("param")
```

### 8.5 Adding New Agent Capabilities

**Location:** `lib/agents/` (frontend) or `backend/services/` (backend)

**Frontend Agent:**
1. Update `lib/agents/config.ts` with new agent configuration
2. Add agent prompt and tools
3. Update orchestrator routing logic
4. Test with sample queries

**Backend Agent:**
1. Update `backend/services/agent_config.py`
2. Add new agent prompt
3. Update orchestrator classification logic
4. Add tool definitions if needed

### 8.6 Adding New Tools

**Location:** `lib/agents/tools.ts` (frontend) or backend services

**Steps:**
1. Define tool schema in `tools.ts`:
```typescript
{
  name: "my_tool",
  description: "What this tool does",
  parameters: {
    type: "object",
    properties: {
      param1: { type: "string", description: "Parameter description" }
    },
    required: ["param1"]
  }
}
```

2. Implement tool executor in `tool-executor.ts`:
```typescript
async function executeMyTool(params: any): Promise<any> {
  // Tool implementation
  const result = await callBackendAPI(params);
  return result;
}
```

3. Add to tool executor switch statement

4. Update agent configurations to include new tool

### 8.7 State Management

**Adding New State:**

1. Choose appropriate store:
   - `chatStore.ts` - Chat-related state
   - `dataStore.ts` - Dataset-related state
   - `workspaceStore.ts` - UI state

2. Add state and actions:
```typescript
interface MyStore {
  myData: any[];
  setMyData: (data: any[]) => void;
}

export const useMyStore = create<MyStore>()(
  persist(
    (set) => ({
      myData: [],
      setMyData: (data) => set({ myData: data }),
    }),
    {
      name: 'my-store',
    }
  )
);
```

3. Use in components:
```typescript
const { myData, setMyData } = useMyStore();
```

### 8.8 Database Operations

**Adding New Table:**

1. Create migration file: `backend/migrations/XXX_description.sql`

2. Define table schema:
```sql
CREATE TABLE my_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. Run migration on Supabase

4. Update TypeScript types in `lib/supabase/types.ts`

5. Create database service in `lib/db/` or `backend/db/`

### 8.9 Common Development Tasks

**Running Tests:**
```bash
# Frontend
npm run test

# Backend
cd backend
python test_api.py
python test_exploration.py
```

**Linting:**
```bash
# Frontend
npm run lint

# Backend
pylint backend/
```

**Type Checking:**
```bash
# Frontend
npx tsc --noEmit
```

**Building:**
```bash
# Frontend
npm run build

# Backend (no build needed for Python)
```

**Viewing Logs:**
```bash
# Frontend (browser console)
# Backend (terminal output)
```

### 8.10 Code Style Guidelines

**TypeScript/React:**
- Use functional components with hooks
- Prefer `const` over `let`
- Use TypeScript interfaces for props
- Follow Airbnb style guide
- Use Tailwind for styling (no CSS modules)

**Python:**
- Follow PEP 8 style guide
- Use type hints
- Async/await for I/O operations
- Docstrings for functions
- Use Pydantic for validation

**Naming Conventions:**
- Components: PascalCase (`MyComponent.tsx`)
- Functions: camelCase (`myFunction`)
- Constants: UPPER_SNAKE_CASE (`API_URL`)
- Files: kebab-case (`my-file.ts`) or PascalCase for components

### 8.11 Git Workflow

**Branch Naming:**
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

**Commit Messages:**
- Use conventional commits format
- Examples:
  - `feat: add new chart type`
  - `fix: resolve SQL injection vulnerability`
  - `docs: update setup instructions`
  - `refactor: simplify orchestrator logic`

**Pull Request Process:**
1. Create feature branch
2. Make changes and commit
3. Push to remote
4. Create pull request
5. Request review
6. Address feedback
7. Merge after approval

---


## 9. API Endpoints Reference

### 9.1 Upload & Exploration Endpoints

#### POST /api/upload
**Purpose:** Upload CSV file and create session

**Request:**
```
Content-Type: multipart/form-data

Body:
  file: <CSV file>
```

**Response:**
```json
{
  "session_id": "uuid-string",
  "filename": "transactions.csv",
  "row_count": 50000,
  "status": "uploading",
  "parquet_path": "datasets/uuid/raw.parquet"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid file format
- 500: Server error

---

#### POST /api/explore/{session_id}
**Purpose:** Generate Data DNA exploratory analysis

**Request:**
```
No body required
```

**Response:**
```json
{
  "session_id": "uuid-string",
  "status": "ready",
  "data_dna": {
    "schema": { ... },
    "baselines": { ... },
    "patterns": { ... },
    "anomalies": [ ... ]
  }
}
```

**Status Codes:**
- 200: Success
- 404: Session not found
- 500: Exploration failed

---

#### GET /api/session/{session_id}
**Purpose:** Get session details with Data DNA

**Response:**
```json
{
  "id": "uuid-string",
  "filename": "transactions.csv",
  "row_count": 50000,
  "status": "ready",
  "data_dna": { ... },
  "created_at": "2026-02-26T10:30:00Z"
}
```

**Status Codes:**
- 200: Success
- 404: Session not found

---

### 9.2 Chat Management Endpoints

#### POST /api/chats
**Purpose:** Create new chat thread

**Request:**
```json
{
  "session_id": "uuid-string",
  "title": "Transaction Analysis"
}
```

**Response:**
```json
{
  "id": "uuid-string",
  "session_id": "uuid-string",
  "title": "Transaction Analysis",
  "created_at": "2026-02-26T10:30:00Z"
}
```

**Status Codes:**
- 201: Created
- 400: Invalid request
- 404: Session not found

---

#### GET /api/chats/{session_id}
**Purpose:** List all chats for a session

**Response:**
```json
[
  {
    "id": "uuid-string",
    "title": "Transaction Analysis",
    "created_at": "2026-02-26T10:30:00Z",
    "message_count": 12
  }
]
```

**Status Codes:**
- 200: Success
- 404: Session not found

---

### 9.3 Message Endpoints

#### POST /api/messages
**Purpose:** Save message to database

**Request:**
```json
{
  "chat_id": "uuid-string",
  "role": "user",
  "content": {
    "text": "What's the success rate?"
  }
}
```

**Response:**
```json
{
  "id": "uuid-string",
  "chat_id": "uuid-string",
  "role": "user",
  "content": { ... },
  "created_at": "2026-02-26T10:30:00Z"
}
```

**Status Codes:**
- 201: Created
- 400: Invalid request
- 404: Chat not found

---

#### GET /api/messages/{chat_id}
**Purpose:** Get all messages for a chat

**Response:**
```json
[
  {
    "id": "uuid-string",
    "role": "user",
    "content": { "text": "What's the success rate?" },
    "created_at": "2026-02-26T10:30:00Z"
  },
  {
    "id": "uuid-string",
    "role": "assistant",
    "content": {
      "text": "The success rate is 98%",
      "metrics": { "success_rate": "98%" },
      "confidence": 95
    },
    "created_at": "2026-02-26T10:30:05Z"
  }
]
```

**Status Codes:**
- 200: Success
- 404: Chat not found

---

### 9.4 Chat Streaming Endpoint

#### POST /api/chat/stream
**Purpose:** Stream AI response via Server-Sent Events

**Request:**
```json
{
  "chat_id": "uuid-string",
  "session_id": "uuid-string",
  "message": "What's the success rate?",
  "history": [
    {
      "role": "user",
      "content": "Previous question"
    }
  ]
}
```

**Response:** Server-Sent Events stream

**Event Types:**

1. **status** - Progress update
```
data: {"type": "status", "message": "Loading dataset profile..."}
```

2. **orchestrator_result** - Query classification
```
data: {
  "type": "orchestrator_result",
  "data": {
    "classification": "SQL_ONLY",
    "reasoning": "Simple aggregation query",
    "next_agent": "sql_agent"
  }
}
```

3. **sql_result** - SQL execution result
```
data: {
  "type": "sql_result",
  "data": {
    "query": "SELECT COUNT(*) FROM transactions WHERE status='success'",
    "rows": 28,
    "columns": ["count"],
    "data": [[49000]]
  }
}
```

4. **python_result** - Python analysis result
```
data: {
  "type": "python_result",
  "data": {
    "code": "import scipy.stats as stats\n...",
    "results": {
      "confidence": 95,
      "p_value": 0.001
    }
  }
}
```

5. **final_response** - Composed response
```
data: {
  "type": "final_response",
  "data": {
    "text": "The success rate is 98%, up 2% from baseline.",
    "metrics": {
      "success_rate": "98%",
      "change": "+2%"
    },
    "chart_spec": {
      "type": "bar",
      "data": [...]
    },
    "confidence": 95,
    "follow_ups": ["What about failed transactions?"]
  }
}
```

6. **error** - Error occurred
```
data: {"type": "error", "message": "SQL execution failed"}
```

7. **Stream end**
```
data: [DONE]
```

**Status Codes:**
- 200: Stream started
- 400: Invalid request
- 404: Session or chat not found
- 500: Server error

---

### 9.5 SQL Execution Endpoint

#### POST /api/sql/execute
**Purpose:** Execute SQL query on dataset

**Request:**
```json
{
  "session_id": "uuid-string",
  "query": "SELECT * FROM transactions WHERE amount > 1000 LIMIT 10"
}
```

**Response:**
```json
{
  "columns": ["transaction_id", "amount", "status"],
  "data": [
    [1, 1500, "success"],
    [2, 2000, "success"]
  ],
  "row_count": 2,
  "summary": "Returned 2 rows"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid SQL
- 403: Dangerous SQL detected
- 404: Session not found
- 500: Execution failed

**Safety Restrictions:**
- Only SELECT statements allowed
- Dangerous keywords blocked (DROP, DELETE, INSERT, UPDATE, etc.)
- Row limit enforced (500 default)

---

### 9.6 Python Execution Endpoint

#### POST /api/python/execute
**Purpose:** Execute Python analysis code

**Request:**
```json
{
  "session_id": "uuid-string",
  "code": "import pandas as pd\nresult = df['amount'].mean()\nprint(result)"
}
```

**Response:**
```json
{
  "output": "1250.50",
  "results": {
    "mean": 1250.50
  },
  "execution_time": 0.5
}
```

**Status Codes:**
- 200: Success
- 400: Invalid Python code
- 403: Dangerous code detected
- 404: Session not found
- 500: Execution failed
- 504: Timeout (30 seconds)

**Safety Restrictions:**
- AST validation before execution
- Allowed imports: pandas, numpy, scipy, math, json
- Blocked calls: exec, eval, open, os, sys
- Timeout: 30 seconds
- Memory limits enforced

---

### 9.7 Insights Endpoint

#### GET /api/insights/{session_id}
**Purpose:** Get accumulated insights for session

**Response:**
```json
{
  "insights": [
    {
      "query": "What's the success rate?",
      "finding": "98% success rate",
      "confidence": 95,
      "timestamp": "2026-02-26T10:30:00Z"
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 404: Session not found

---

### 9.8 Health Check Endpoints

#### GET /
**Purpose:** Basic health check

**Response:**
```json
{
  "status": "ok",
  "service": "InsightX Backend",
  "version": "1.0.0"
}
```

---

#### GET /health
**Purpose:** Detailed health check

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "storage": "connected",
  "timestamp": "2026-02-26T10:30:00Z"
}
```

---

### 9.9 Error Response Format

All endpoints return errors in consistent format:

```json
{
  "detail": "Error message description",
  "error_code": "ERROR_CODE",
  "timestamp": "2026-02-26T10:30:00Z"
}
```

**Common Error Codes:**
- `SESSION_NOT_FOUND` - Session ID doesn't exist
- `INVALID_SQL` - SQL query validation failed
- `DANGEROUS_CODE` - Blocked dangerous operation
- `EXECUTION_TIMEOUT` - Operation exceeded time limit
- `STORAGE_ERROR` - File storage operation failed
- `DATABASE_ERROR` - Database operation failed

---


## 10. Deployment

### 10.1 Frontend Deployment (Vercel)

**Prerequisites:**
- Vercel account
- GitHub repository connected
- Environment variables configured

**Deployment Steps:**

1. **Connect Repository to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Select the root directory

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   NEXT_PUBLIC_SUPABASE_URL=https://xvtqbvavwbowyyoevolo.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_BYTEZ_API_KEY=your-bytez-key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Access at: `https://your-project.vercel.app`

**Automatic Deployments:**
- Push to `main` branch triggers production deployment
- Push to other branches creates preview deployments
- Pull requests get unique preview URLs

**Custom Domain:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate automatically provisioned

---

### 10.2 Backend Deployment (Railway)

**Prerequisites:**
- Railway account
- GitHub repository
- Environment variables ready

**Deployment Steps:**

1. **Create New Project**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Service**
   - Root Directory: `backend`
   - Build Command: (automatic)
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables**
   ```
   SUPABASE_URL=https://xvtqbvavwbowyyoevolo.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key
   BYTEZ_API_KEY_1=your-primary-key
   BYTEZ_API_KEY_2=your-fallback-key
   PORT=8000
   ```

4. **Configure Disk Storage**
   - Add persistent volume for Parquet caching
   - Mount path: `/data`
   - Size: 10GB (adjust based on needs)

5. **Deploy**
   - Railway automatically builds and deploys
   - Access at: `https://your-project.railway.app`

**Automatic Deployments:**
- Push to `main` branch triggers deployment
- Railway rebuilds and redeploys automatically

**Custom Domain:**
1. Go to Settings → Domains
2. Add custom domain
3. Configure DNS CNAME record
4. SSL automatically configured

---

### 10.3 Database Setup (Supabase)

**Already Configured:**
- Project URL: `https://xvtqbvavwbowyyoevolo.supabase.co`
- Tables: users, sessions, chats, messages
- Storage bucket: `datasets`

**For New Supabase Project:**

1. **Create Project**
   - Go to https://supabase.com
   - Create new project
   - Note project URL and keys

2. **Run Migrations**
   - Execute SQL files in `backend/migrations/`
   - In order: 001, 002, 003, etc.

3. **Create Storage Bucket**
   - Go to Storage
   - Create bucket: `datasets`
   - Set policies for authenticated access

4. **Configure Row Level Security (RLS)**
   - Enable RLS on all tables
   - Add policies for user access

5. **Get API Keys**
   - Go to Settings → API
   - Copy `anon` key for frontend
   - Copy `service_role` key for backend

---

### 10.4 Environment Configuration

**Production Environment Variables:**

**Frontend (.env.production):**
```env
NEXT_PUBLIC_API_URL=https://insightx-backend.railway.app/api
NEXT_PUBLIC_SUPABASE_URL=https://xvtqbvavwbowyyoevolo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=production-anon-key
NEXT_PUBLIC_BYTEZ_API_KEY=production-bytez-key
```

**Backend (Railway Environment Variables):**
```env
SUPABASE_URL=https://xvtqbvavwbowyyoevolo.supabase.co
SUPABASE_SERVICE_KEY=production-service-key
BYTEZ_API_KEY_1=production-primary-key
BYTEZ_API_KEY_2=production-fallback-key
PORT=8000
ENVIRONMENT=production
```

---

### 10.5 Monitoring & Logging

**Vercel Monitoring:**
- Real-time logs in Vercel dashboard
- Performance metrics
- Error tracking
- Analytics

**Railway Monitoring:**
- Application logs in Railway dashboard
- Resource usage metrics
- Deployment history
- Health checks

**Supabase Monitoring:**
- Database performance
- Storage usage
- API request metrics
- Real-time connections

**Recommended Additional Tools:**
- **Sentry** - Error tracking and monitoring
- **LogRocket** - Session replay and debugging
- **New Relic** - Application performance monitoring

---

### 10.6 CI/CD Pipeline

**GitHub Actions Workflow:**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          # Railway automatically deploys on push
          echo "Backend deployment triggered"
```

---

### 10.7 Scaling Considerations

**Frontend Scaling:**
- Vercel automatically scales
- Edge network for global distribution
- Serverless functions scale on demand

**Backend Scaling:**
- Railway horizontal scaling available
- Add more instances for high traffic
- Consider load balancer for multiple instances

**Database Scaling:**
- Supabase offers vertical scaling
- Upgrade plan for more connections
- Consider read replicas for high read loads

**Storage Scaling:**
- Supabase Storage scales automatically
- Monitor usage and upgrade as needed
- Consider CDN for frequently accessed files

---

### 10.8 Security Best Practices

**Production Checklist:**

✅ Use environment variables for all secrets
✅ Enable HTTPS only (automatic on Vercel/Railway)
✅ Configure CORS properly (restrict origins)
✅ Enable Supabase Row Level Security (RLS)
✅ Use service role key only on backend
✅ Implement rate limiting on API endpoints
✅ Validate all user inputs
✅ Sanitize SQL queries
✅ Sandbox Python execution
✅ Monitor for suspicious activity
✅ Regular security audits
✅ Keep dependencies updated

**CORS Configuration:**

Update `backend/main.py` for production:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend.vercel.app",
        "https://your-custom-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

---

### 10.9 Backup & Recovery

**Database Backups:**
- Supabase automatic daily backups
- Point-in-time recovery available
- Manual backups via Supabase dashboard

**Storage Backups:**
- Supabase Storage redundancy
- Consider periodic exports to S3
- Version control for critical files

**Code Backups:**
- Git repository on GitHub
- Multiple branches for safety
- Tag releases for rollback capability

---

### 10.10 Performance Optimization

**Frontend Optimizations:**
- Next.js automatic code splitting
- Image optimization with Next.js Image
- Lazy loading for components
- Caching with Zustand persist

**Backend Optimizations:**
- Parquet caching on Railway disk
- DuckDB columnar format (10-50x faster)
- Async/await for non-blocking I/O
- Connection pooling for database

**Database Optimizations:**
- Indexed queries on frequently accessed columns
- JSONB for flexible schema
- Materialized views for complex queries
- Query optimization with EXPLAIN

---

### 10.11 Rollback Procedures

**Frontend Rollback:**
1. Go to Vercel dashboard
2. Select previous deployment
3. Click "Promote to Production"
4. Instant rollback

**Backend Rollback:**
1. Go to Railway dashboard
2. Select previous deployment
3. Click "Redeploy"
4. Or revert Git commit and push

**Database Rollback:**
1. Use Supabase point-in-time recovery
2. Or restore from backup
3. Run reverse migrations if needed

---

## Appendix

### A. Glossary

- **Data DNA** - Comprehensive dataset profile with schema, baselines, patterns, and anomalies
- **Orchestrator** - AI agent that classifies queries and routes to specialist agents
- **SSE** - Server-Sent Events, protocol for streaming data from server to client
- **Parquet** - Columnar storage format, 10-50x faster than CSV
- **DuckDB** - In-process SQL OLAP database for analytics
- **Zustand** - Lightweight state management library for React
- **Bytez API** - API service providing access to Claude LLM

### B. Useful Links

- **Frontend Repository:** [GitHub URL]
- **Backend Repository:** [GitHub URL]
- **Supabase Dashboard:** https://supabase.com/dashboard/project/xvtqbvavwbowyyoevolo
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Railway Dashboard:** https://railway.app/dashboard
- **API Documentation:** http://localhost:8000/docs (local) or https://your-backend.railway.app/docs (production)

### C. Support & Contact

For technical support or questions:
- Check documentation in `MASTER_CONTEXT/` folder
- Review API docs at `/docs` endpoint
- Check GitHub issues
- Contact development team

---

**Document Version:** 1.0.0  
**Last Updated:** February 26, 2026  
**Status:** Complete & Production Ready  
**Total Pages:** ~15 pages

---

**End of Technical Documentation**

