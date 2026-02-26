# InsightX
**Conversational Analytics Platform for Data-Driven Insights**

> 📖 **[Read the Full Technical Documentation](./INSIGHTX_TECHNICAL_DOCUMENTATION.md)** for comprehensive system architecture, API reference, and deployment guides.

## What is InsightX?

InsightX transforms complex data analysis into simple conversations. Upload your CSV files and ask questions in plain English to get instant, data-backed insights with visualizations and statistical analysis. Built with a sophisticated multi-agent AI system that intelligently routes queries between SQL and Python for 10-50x performance improvements.

Perfect for business analysts, data scientists, and anyone who needs quick insights from their data without writing code.

## ✨ Key Features

- **Natural Language Queries** - Ask questions in plain English, get data-backed answers
- **Automatic Data Profiling** - Instant dataset analysis with schema, patterns, and anomalies
- **Multi-Agent AI System** - 5 specialized agents (Orchestrator, SQL, Python, Composer, Explainer)
- **Hybrid SQL→Python Architecture** - 27x faster analysis by intelligently combining DuckDB and Python
- **Real-Time Streaming** - Watch AI think and process your queries in real-time
- **Interactive Visualizations** - Automatic chart generation with Recharts
- **Context-Aware Conversations** - AI remembers previous questions and builds on them

## 🛠️ Tech Stack

**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Zustand  
**Backend:** FastAPI (Python), DuckDB, pandas, scipy  
**Database:** Supabase (PostgreSQL + Storage)  
**AI/LLM:** Claude Sonnet 4.5 via Bytez API  
**Deployment:** Vercel (frontend), Railway (backend)

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

## 💡 Usage Example

1. **Upload Dataset**: Navigate to `/connect` and drag-drop your CSV file
2. **Automatic Analysis**: Wait for Data DNA generation (schema, patterns, anomalies)
3. **Ask Questions**: In the workspace, type natural language queries:
   - "What's the success rate?"
   - "Show me transactions over $1000"
   - "What are the top 5 categories by revenue?"
4. **Get Insights**: Receive answers with metrics, visualizations, and confidence scores
5. **Follow Up**: Ask context-aware follow-up questions to dive deeper

## 📚 Documentation

- **Technical Documentation**: See `INSIGHTX_TECHNICAL_DOCUMENTATION.md` for comprehensive system details
- **Master Context**: Check `MASTER_CONTEXT/` folder for architecture, implementation, and integration docs
- **Backend Setup**: See `backend/START_HERE.md` for detailed backend setup
- **API Reference**: Visit http://localhost:8000/docs for interactive API documentation

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

## 🚢 Deployment

**Frontend (Vercel):**
```bash
npm run build
# Deploy via Vercel dashboard or CLI
```

**Backend (Railway):**
- Push to GitHub
- Railway auto-deploys from `main` branch
- Configure environment variables in Railway dashboard

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Developers

**Team Members:**
- **Nabil Salim Thange** - [GitHub](https://github.com/NabilThange) | [Portfolio](https://nabil-thange.vercel.app/)
- **Tanish Soni**
- **Yojith Rao**

Built for IIT-B Hackathon

**Project Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** February 26, 2026

## 🔗 Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/xvtqbvavwbowyyoevolo
- **API Documentation**: http://localhost:8000/docs (local)
- **Technical Docs**: `INSIGHTX_TECHNICAL_DOCUMENTATION.md`

## 🆘 Support

For issues or questions:
- Check `MASTER_CONTEXT/` documentation
- Review API docs at `/docs` endpoint
- Open a GitHub issue

---

**Made with ❤️ for data-driven decision making**
