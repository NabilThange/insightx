# InsightX - Exploratory Analytics Platform

> **Built with Next.js 14+ App Router** | **Design System: Konpo-inspired Minimalism**

A professional, exploratory-first analytics platform that visualizes multi-agent architecture and data understanding.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📁 Project Structure

```
insightx-app/
├── app/
│   ├── page.tsx              # Landing Page (/)
│   ├── connect/
│   │   └── page.tsx          # The Bridge - Data Upload (/connect)
│   ├── workspace/
│   │   └── page.tsx          # The War Room - Analytics (/workspace)
│   ├── reports/
│   │   └── page.tsx          # The Gallery - Saved Insights (/reports)
│   ├── globals.css           # Global styles + Design System
│   └── tailwind.css          # Tailwind v4 CSS config
├── components/
│   └── LandingPage.tsx       # Landing page with GSAP animations
├── lib/
│   └── utils.ts              # Utility functions
├── public/
│   ├── img1.jpg - img15.jpg  # Landing page images
│   └── logo.png              # Logo
├── DESIGN_SYSTEM.md          # Complete design system documentation
└── package.json
```

---

## 🎨 Design System

The entire application follows the **Konpo Landing Page** design system:

### Color Palette
- **Background:** `#f1efe7` (Warm Beige)
- **Foreground:** `#1f1f1f` (Deep Charcoal)
- **Loader BG:** `#e0e0d8` (Lighter Beige)
- **Stroke:** `rgba(0, 0, 0, 0.2)` (Subtle Dividers)
- **Accent:** `#4f46e5` (Indigo for Interactive Elements)

### Typography
- **Font:** PP Neue Montreal (via CDN)
- **H1:** 6rem (96px), weight 500
- **H2:** 1.75rem (28px), weight 500
- **Body:** 1rem (16px), weight 500

### Spacing
- **Base Unit:** 0.25rem (4px)
- **Sidebar:** 5rem (80px)
- **Content Padding:** 1.5rem (24px)

### Animations
- **GSAP** for all state changes
- **Easing:** power3.inOut, power4.out
- **Duration:** 0.3s (micro), 1s (standard), 2-3s (complex)

**Full documentation:** See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

---

## 📄 Pages Overview

### 1. **Landing Page** (`/`)
- **Purpose:** Hero section with GSAP animations
- **Features:**
  - Counter animation (0-100)
  - Image grid with stagger animation
  - Text reveal animations
  - Divider draw effects
- **Navigation:** Links to Portfolio (/workspace), About (/connect), Contact (/connect)

### 2. **The Bridge** (`/connect`)
- **Purpose:** Data upload and connection interface
- **Features:**
  - Drag-and-drop CSV upload
  - Processing animation with status messages
  - Database connection option
  - Auto-redirect to workspace after upload
- **Status Messages:**
  1. "Reading Schema..."
  2. "Profiling 250k rows..."
  3. "Detecting data types..."
  4. "Calculating baselines..."
  5. "Detecting P2P Transfers..."
  6. "Analyzing peak hours..."
  7. "Ready."

### 3. **The War Room** (`/workspace`)
- **Purpose:** Main analytics workspace with three-pane layout
- **Layout:**
  - **Left Panel:** Conversation history + Accumulated insights
  - **Center Panel:** Chat interface with agent responses
  - **Right Panel:** Data DNA (collapsible)
- **Features:**
  - Agent badges (Orchestrator, SQL Agent, Python Agent)
  - Thinking process accordion
  - Suggested queries with sparkle icon
  - Message actions (thumbs up/down, view code)
  - Real-time chat simulation

### 4. **The Gallery** (`/reports`)
- **Purpose:** Saved insights and reports dashboard
- **Features:**
  - Insight cards with metrics and trends
  - Category filters (All, Volume, Performance, Network, Users)
  - Trend indicators (up/down/neutral)
  - Export options (PDF, CSV, Share Link)
  - Pin functionality for important insights

---

## 🧩 Component Architecture

### Core Components (Planned)
Based on `docs/FRONTEND_ARCHITECTURE.md`:

#### A. Layout & Shell
- `AppShell` - Global layout wrapper
- `ContextSidebar` - Left panel (history/insights)
- `ArtifactPanel` - Right panel (Data DNA)
- `ModeToggle` - Dark/Light mode (currently light only)

#### B. Agent & Chat Interface
- `ChatInput` - Multi-line input + voice button
- `AgentMessage` - System response container
- `ThinkingProcess` - Collapsible thought steps
- `AgentBadge` - Agent identifier pill
- `HybridExecutionIndicator` - SQL → Python connector

#### C. Data & Visualization
- `InsightCard` - Summary card with metrics
- `DataVizWrapper` - Chart container (Recharts)
- `CodeBlock` - Syntax-highlighted code viewer
- `ReasoningDisclosure` - "Why did I say this?" dropdown
- `ConfidenceMeter` - Confidence percentage display

#### D. Interactive Elements
- `FeedbackButtons` - Thumbs up/down
- `FollowUpSuggester` - Suggested query chips
- `ExploratoryStatus` - Dataset scanning progress

---

## 🛠️ Tech Stack

### Core
- **Framework:** Next.js 16.1.6 (App Router, Turbopack)
- **React:** 19.x
- **TypeScript:** 5.x

### Styling
- **Tailwind CSS:** v4 (CSS-based configuration)
- **CSS Modules:** Scoped styles with `styled-jsx`
- **Font:** PP Neue Montreal (CDN)

### Animation
- **GSAP:** 3.13.0 (free version)
- **@gsap/react:** React integration
- **Note:** Premium plugins (Flip, SplitText) replaced with free alternatives

### UI Components
- **Lucide React:** Icon library
- **Recharts:** Chart library (for future data viz)
- **Zustand:** State management (for future use)

### Utilities
- **clsx:** Conditional class names
- **tailwind-merge:** Merge Tailwind classes

---

## 🎭 Animation Details

### Landing Page Sequence
1. **Background Reveal** (3s) - `scaleY` from bottom
2. **Image Grid Stagger** (1s) - Scale in with 0.125s stagger
3. **Counter Animation** (2-3s) - Digit roll effect
4. **Image Rearrange** (1s) - Position change from top-left to bottom-right
5. **Dividers Draw** (1s) - Sidebar, nav, section dividers
6. **Logo Scale** (1s) - Sidebar logo appears
7. **Text Reveals** (1s) - Nav, header, footer text slides up

### Implementation Notes
- **SplitText Alternative:** Manual word splitting with `<span>` wrappers
- **Flip Alternative:** Position-based animations with GSAP `to()`
- **Easing:** `power2.inOut`, `power3.inOut`, `power4.out`
- **Stagger:** 0.1s for sequential reveals

---

## 📊 Data Flow (Planned)

```
User Upload CSV → /connect
    ↓
Processing Animation (7 steps)
    ↓
Generate "Data DNA" (Artifact)
    ↓
Redirect to /workspace
    ↓
Display Data DNA in Right Panel
    ↓
User asks question
    ↓
Orchestrator routes to Agent
    ↓
Agent responds with insight
    ↓
User can save to /reports
```

---

## 🚧 Future Enhancements

### Phase 1: Core Functionality
- [ ] Real CSV parsing and analysis
- [ ] Backend API integration
- [ ] Database connection support
- [ ] Actual multi-agent orchestration

### Phase 2: Visualization
- [ ] Recharts integration for data viz
- [ ] Interactive charts in chat responses
- [ ] Custom chart components
- [ ] Export chart as image

### Phase 3: Intelligence
- [ ] LLM integration (OpenAI/Anthropic)
- [ ] SQL query generation
- [ ] Python code execution
- [ ] Confidence scoring

### Phase 4: Collaboration
- [ ] User authentication
- [ ] Shared workspaces
- [ ] Comment system
- [ ] Version history

---

## 📝 Design Constraints

### ✅ DO
- Use exact color values from the palette
- Maintain 1.5rem minimum padding on all sides
- Apply GSAP animations for all state changes
- Use PP Neue Montreal font exclusively
- Keep backgrounds light (beige), text dark
- Use subtle strokes for dividers (20% opacity)

### ❌ DON'T
- Use colors outside the defined palette
- Use generic fonts (Arial, Helvetica)
- Use CSS transitions (use GSAP instead)
- Use hard borders (use subtle strokes)
- Use pure white (#fff) or pure black (#000)
- Skip animation sequences

---

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler (if configured)
```

---

## 📦 Dependencies

### Production
```json
{
  "next": "16.1.6",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "gsap": "^3.13.0",
  "@gsap/react": "^2.1.1",
  "lucide-react": "latest",
  "recharts": "latest",
  "zustand": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest"
}
```

### Development
```json
{
  "@tailwindcss/postcss": "latest",
  "@types/node": "latest",
  "@types/react": "latest",
  "@types/react-dom": "latest",
  "eslint": "latest",
  "eslint-config-next": "latest",
  "tailwindcss": "latest",
  "typescript": "latest"
}
```

---

## 🌐 Browser Support

- **Chrome:** Latest 2 versions
- **Firefox:** Latest 2 versions
- **Safari:** Latest 2 versions
- **Edge:** Latest 2 versions

**Note:** GSAP animations require modern browser support.

---

## 📄 License

This project is part of the IIT-B Hackathon submission.

---

## 🤝 Contributing

This is a hackathon project. For questions or suggestions, please contact the team.

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [GSAP Documentation](https://gsap.com/docs/v3/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Design System Documentation](./DESIGN_SYSTEM.md)
- [Frontend Architecture](../docs/FRONTEND_ARCHITECTURE.md)

---

**Last Updated:** 2026-02-13  
**Version:** 1.0.0  
**Built by:** InsightX Team
#   i n s i g h t x  
 