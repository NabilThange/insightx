# InsightX
**Conversational Analytics Platform for Data-Driven Insights**

> 🚀 **[🌐 Check it out Live → https://insightxx.vercel.app/](https://insightxx.vercel.app/)**

> 📖 **[Read the Full Technical Documentation](./INSIGHTX_TECHNICAL_DOCUMENTATION.md)** for comprehensive system architecture, API reference, and deployment guides.

---

## 📑 Table of Contents

- [What is InsightX?](#what-is-insightx)
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running the Application](#running-the-application)
- [Project Structure](#-project-structure)
- [Usage Example](#-usage-example)
- [Sample Query Bank](#-sample-query-bank)
  - [Execution Paths](#execution-paths)
  - [Category 1 — Descriptive Analytics](#category-1--descriptive-analytics)
  - [Category 2 — Comparative Analytics](#category-2--comparative-analytics)
  - [Category 3 — Temporal Analytics](#category-3--temporal-analytics)
  - [Category 4 — Segmentation Analytics](#category-4--segmentation-analytics)
  - [Category 5 — Correlation Analytics](#category-5--correlation-analytics)
  - [Category 6 — Risk Analytics](#category-6--risk-analytics)
  - [Conversational Context Chain](#bonus--conversational-context-chain)
- [Architecture Highlights](#️-architecture-highlights)
- [Documentation](#-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Developers](#-developers)
- [Links](#-links)
- [Support](#-support)

---

## What is InsightX?

InsightX transforms complex data analysis into simple conversations. Upload your CSV files and ask questions in plain English to get instant, data-backed insights with visualizations and statistical analysis. Built with a sophisticated multi-agent AI system that intelligently routes queries between SQL and Python for 10-50x performance improvements.

Perfect for business analysts, data scientists, and anyone who needs quick insights from their data without writing code.

---

## ✨ Key Features

- **Natural Language Queries** - Ask questions in plain English, get data-backed answers
- **Automatic Data Profiling** - Instant dataset analysis with schema, patterns, and anomalies
- **Multi-Agent AI System** - 5 specialized agents (Orchestrator, SQL, Python, Composer, Explainer)
- **Hybrid SQL→Python Architecture** - 27x faster analysis by intelligently combining DuckDB and Python
- **Real-Time Streaming** - Watch AI think and process your queries in real-time
- **Interactive Visualizations** - Automatic chart generation with Recharts
- **Context-Aware Conversations** - AI remembers previous questions and builds on them

---

## 🛠️ Tech Stack

**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Zustand  
**Backend:** FastAPI (Python), DuckDB, pandas, scipy  
**Database:** Supabase (PostgreSQL + Storage)  
**AI/LLM:** Claude Sonnet 4.5 via Bytez API  
**Deployment:** Vercel (frontend), Railway (backend)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or higher
- Python 3.13 or higher
- npm and pip

### Installation

```bash
# Clone repository
git clone <repository-url>
cd insightx-app

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Environment Setup

**Frontend** - Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SUPABASE_URL=https://xvtqbvavwbowyyoevolo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BYTEZ_API_KEY=your-bytez-key
```

**Backend** - Create `backend/.env`:
```env
SUPABASE_URL=https://xvtqbvavwbowyyoevolo.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
BYTEZ_API_KEY_1=your-primary-key
BYTEZ_API_KEY_2=your-fallback-key
```

### Running the Application

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
# Windows
run.bat

# Mac/Linux
./run.sh
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📁 Project Structure

```
insightx-app/
├── app/                    # Next.js pages (landing, workspace, reports)
├── components/             # React components (chat, data, workspace, ui)
├── lib/                    # Core libraries (agents, api, db, utils)
├── store/                  # Zustand state management
├── backend/                # FastAPI backend
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic (orchestrator, executors)
│   ├── models/            # Pydantic schemas
│   └── main.py            # FastAPI app entry
├── MASTER_CONTEXT/         # Comprehensive documentation
└── package.json
```

---

## 💡 Usage Example

1. **Upload Dataset**: Navigate to `/connect` and drag-drop your CSV file
2. **Automatic Analysis**: Wait for Data DNA generation (schema, patterns, anomalies)
3. **Ask Questions**: In the workspace, type natural language queries:
   - "What's the success rate?"
   - "Show me transactions over $1000"
   - "What are the top 5 categories by revenue?"
4. **Get Insights**: Receive answers with metrics, visualizations, and confidence scores
5. **Follow Up**: Ask context-aware follow-up questions to dive deeper

---

## 🧠 Sample Query Bank

InsightX is validated against 30 business questions spanning 6 analytics categories. Each query is tagged by execution path — showing exactly how the multi-agent system routes and handles it.

### Execution Paths

| Symbol | Path | Description |
|--------|------|-------------|
| — | `SQL` | Pure SQL aggregation via the SQL Agent |
| ⭐ | `PYTHON` | Statistical analysis via the Python Agent |
| ⭐⭐ | `HYBRID` | SQL extracts → Python analyzes (InsightX's core differentiator) |

---

### Category 1 — Descriptive Analytics
> What is happening in the data?

| # | Query | Path |
|---|-------|------|
| 1 | What is the overall transaction success rate across all transaction types? | `SQL` |
| 2 | What is the average transaction amount for each transaction type? | `SQL` |
| 3 | Which sender bank processes the highest total transaction volume (in ₹)? | `SQL` |
| 4 | How many transactions were made on weekends vs weekdays? | `SQL` |
| 5 | What is the most commonly used device type for transactions? | `SQL` |

---

### Category 2 — Comparative Analytics
> How do different segments differ?

| # | Query | Path |
|---|-------|------|
| 6 | How do failure rates compare between Android, iOS, and Web users? | `SQL` |
| 7 | Which bank pair (sender → receiver) has the highest failure rate in P2P transfers? | `SQL` |
| 8 | Do 5G users have a higher average transaction amount than 3G users? | `SQL` |
| 9 | Compare fraud flag rates between P2P and P2M transactions. | `SQL` |
| 10 | Are the failure rate differences between device types statistically significant, or could they be due to random chance? | ⭐ `PYTHON` |

---

### Category 3 — Temporal Analytics
> When do patterns occur?

| # | Query | Path |
|---|-------|------|
| 11 | What are the peak transaction hours by volume for the Food merchant category? | `SQL` |
| 12 | Which day of the week has the highest P2P transfer volume? | `SQL` |
| 13 | At what hour do transaction failures peak across all transaction types? | `SQL` |
| 14 | How does average transaction amount differ between weekdays and weekends for the 18-25 age group? | `SQL` |
| 15 | Is there a statistically significant spike in fraud-flagged transactions during peak hours (8–10 PM) vs off-peak? | ⭐⭐ `HYBRID` |

---

### Category 4 — Segmentation Analytics
> Who is doing what?

| # | Query | Path |
|---|-------|------|
| 16 | Which age group uses P2P transfers most frequently, and what is their average transfer amount? | `SQL` |
| 17 | Which Indian state has the highest average transaction value, and which has the lowest? | `SQL` |
| 18 | How do the 18-25 and 56+ age groups differ in their preferred transaction types? | `SQL` |
| 19 | Which merchant category is most popular among users aged 36-45? | `SQL` |
| 20 | Segment all Indian states into high, medium, and low fraud-risk tiers. Which tier does Maharashtra fall into? | ⭐⭐ `HYBRID` |

---

### Category 5 — Correlation Analytics
> What drives what?

| # | Query | Path |
|---|-------|------|
| 21 | Is there a relationship between network type and transaction success rate? | `SQL` |
| 22 | Do higher-value transactions have a higher fraud flag rate? | `SQL` |
| 23 | What is the correlation coefficient between transaction amount and fraud flag status? Is it significant? | ⭐ `PYTHON` |
| 24 | Does the sender's bank significantly influence the probability of a transaction being flagged? | ⭐ `PYTHON` |
| 25 | Which combination of network type × device type produces the worst outcomes? Is the interaction effect significant? | ⭐⭐ `HYBRID` |

---

### Category 6 — Risk Analytics
> Where are the anomalies?

| # | Query | Path |
|---|-------|------|
| 26 | What percentage of transactions above ₹10,000 are flagged for review? | `SQL` |
| 27 | Which merchant category has the highest fraud flag rate? Does it also have the highest failure rate? | `SQL` |
| 28 | Are failed transactions more likely to be flagged for review than successful ones? | `SQL` |
| 29 | Which states are statistical outliers for fraud flag rates — significantly above or below the national average? | ⭐ `PYTHON` |
| 30 | Which combination of age group × transaction type × network type produces the highest fraud flag rate? Is the sample size large enough to trust this finding? | ⭐⭐ `HYBRID` |

---

### Bonus — Conversational Context Chain
> Tests multi-turn memory and pronoun resolution

```
Turn 1 → "What is the failure rate for Android users?"
Turn 2 → "Why is that higher than iOS?"
Turn 3 → "Is this pattern consistent on weekends too?"
Turn 4 → "Now break it down by age group."
Turn 5 → "Which age group should we prioritize fixing first?"
```

Each turn builds on the last. InsightX retains filters, resolves pronouns ("that", "this"), and accumulates context — no repetition needed from the user.

---

### Distribution Summary

| Path | Count |
|------|-------|
| `SQL` | 20 |
| ⭐ `PYTHON` | 5 |
| ⭐⭐ `HYBRID` | 5 |

> SQL handles speed. Python handles statistical rigor. Hybrid handles both — at 10–27x the performance of a Python-only approach on large datasets.

---

## 🏗️ Architecture Highlights

**Multi-Agent System:**
- **Orchestrator Agent** - Classifies queries (SQL_ONLY, PY_ONLY, SQL_THEN_PY, EXPLAIN_ONLY)
- **SQL Agent** - Generates DuckDB queries for data retrieval
- **Python Agent** - Performs statistical analysis with scipy
- **Composer Agent** - Synthesizes results into user-friendly responses
- **Explainer Agent** - Handles general knowledge questions

**Performance Innovation:**
- Traditional: Load 250K rows → Python analysis → 30+ seconds
- InsightX: SQL aggregates 250K → 28 rows → Python analysis → ~1 second (27x faster!)

---

## 📚 Documentation

- **Technical Documentation**: See `INSIGHTX_TECHNICAL_DOCUMENTATION.md` for comprehensive system details
- **Master Context**: Check `MASTER_CONTEXT/` folder for architecture, implementation, and integration docs
- **Backend Setup**: See `backend/START_HERE.md` for detailed backend setup
- **API Reference**: Visit http://localhost:8000/docs for interactive API documentation

---

## 🧪 Testing

**Backend API:**
```bash
cd backend
python test_api.py
python test_exploration.py
```

**Frontend:**
```bash
npm run test
```

---

## 🚢 Deployment

**Live Application:** 🌐 **[https://insightxx.vercel.app/](https://insightxx.vercel.app/)** — Check it out!

**Frontend (Vercel):**
```bash
npm run build
# Deploy via Vercel dashboard or CLI
```
> The frontend is deployed on Vercel. **[Check it out → https://insightxx.vercel.app/](https://insightxx.vercel.app/)**

**Backend (Railway):**
- Push to GitHub
- Railway auto-deploys from `main` branch
- Configure environment variables in Railway dashboard

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 👥 Developers

**Team Members:**
- **Nabil Salim Thange** - [GitHub](https://github.com/NabilThange) | [Portfolio](https://nabil-thange.vercel.app/)
- **Tanish Soni**
- **Yojith Rao**

Built for IIT-B Techfest Hackathon

**Project Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** February 26, 2026

---

## 🔗 Links

- **🌐 Live App**: [https://insightxx.vercel.app/](https://insightxx.vercel.app/) — Check it out!
- **Supabase Dashboard**: https://supabase.com/dashboard/project/xvtqbvavwbowyyoevolo
- **API Documentation**: http://localhost:8000/docs (local)
- **Technical Docs**: `INSIGHTX_TECHNICAL_DOCUMENTATION.md`

---

## 🆘 Support

For issues or questions:
- Check `MASTER_CONTEXT/` documentation
- Review API docs at `/docs` endpoint
- Open a GitHub issue

---

**Made with ❤️ for data-driven decision making**
