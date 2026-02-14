# InsightX Application - Quick Start Guide

## 🚀 Getting Started

Your InsightX application is **ready to run**! The development server is already running at:

**http://localhost:3000**

---

## 📍 Application Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      INSIGHTX APP                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📄 Landing Page (/)                                        │
│  ├─ Hero section with GSAP animations                      │
│  ├─ Counter (0-100)                                         │
│  ├─ Image grid (15 images)                                 │
│  └─ Navigation → Portfolio, About, Contact                 │
│                                                             │
│  🌉 The Bridge (/connect)                                  │
│  ├─ CSV Upload (drag-and-drop)                            │
│  ├─ Processing Animation (7 steps)                         │
│  ├─ Database Connection                                    │
│  └─ Auto-redirect to Workspace                            │
│                                                             │
│  ⚔️ The War Room (/workspace)                              │
│  ├─ Left Panel: History + Insights                        │
│  ├─ Center: Chat Interface                                │
│  ├─ Right Panel: Data DNA (collapsible)                   │
│  └─ Agent Responses with Thinking Process                 │
│                                                             │
│  🖼️ The Gallery (/reports)                                 │
│  ├─ Insight Cards Grid                                    │
│  ├─ Category Filters                                      │
│  ├─ Trend Indicators                                      │
│  └─ Export Options (PDF, CSV, Link)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Design System at a Glance

### Colors
```
Background:  #f1efe7  ████████  (Warm Beige)
Foreground:  #1f1f1f  ████████  (Deep Charcoal)
Loader BG:   #e0e0d8  ████████  (Lighter Beige)
Stroke:      rgba(0,0,0,0.2)    (Subtle Dividers)
Accent:      #4f46e5  ████████  (Indigo)
```

### Typography
```
H1:    6rem (96px)  - Hero Headlines
H2:    1.75rem      - Section Titles
Body:  1rem         - Primary Text
Font:  PP Neue Montreal
```

### Spacing
```
Sidebar:         5rem (80px)
Content Padding: 1.5rem (24px)
Border Radius:   0.75rem (12px)
```

---

## 🗺️ Page Navigation Flow

```
┌──────────────┐
│   Landing    │  (/)
│     Page     │
└──────┬───────┘
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌──────────┐   ┌──────────┐
│   The    │   │   The    │
│  Bridge  │──▶│ War Room │
└──────────┘   └────┬─────┘
  (/connect)        │
                    │
                    ▼
              ┌──────────┐
              │   The    │
              │ Gallery  │
              └──────────┘
               (/reports)
```

**User Journey:**
1. **Landing** → See hero animation
2. **Connect** → Upload CSV or connect database
3. **Workspace** → Ask questions, get insights
4. **Reports** → View saved insights

---

## 📁 Key Files

```
insightx-app/
├── 📄 README.md                    ← Project overview
├── 📄 DESIGN_SYSTEM.md             ← Complete design guide
├── 📄 BUILD_SUMMARY.md             ← What was built
├── 📄 COMPONENT_STATUS.md          ← Component tracking
│
├── app/
│   ├── page.tsx                    ← Landing Page
│   ├── connect/page.tsx            ← The Bridge
│   ├── workspace/page.tsx          ← The War Room
│   ├── reports/page.tsx            ← The Gallery
│   ├── globals.css                 ← Global styles
│   └── tailwind.css                ← Tailwind config
│
├── components/
│   └── LandingPage.tsx             ← Landing component
│
└── public/
    ├── img1.jpg - img15.jpg        ← Images
    └── logo.png                    ← Logo
```

---

## 🎬 Animations Overview

### Landing Page Sequence (Total: ~8 seconds)
```
0s     ──▶  Background Reveal (3s)
3s     ──▶  Image Grid Stagger (1s)
3s     ──▶  Counter Animation (2-3s)
4s     ──▶  Image Rearrange (1s)
5.25s  ──▶  Dividers Draw (1s)
5.25s  ──▶  Logo Scale (1s)
6.25s  ──▶  Text Reveals (1s)
```

### Connect Page
```
Upload  ──▶  Progress Bar (0-100%)
        ──▶  Processing Steps (7 steps, ~6s)
        ──▶  Redirect to Workspace
```

---

## 🎯 Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

## 🌐 Access Points

| Page | URL | Purpose |
|------|-----|---------|
| **Landing** | http://localhost:3000 | Hero section |
| **Connect** | http://localhost:3000/connect | Data upload |
| **Workspace** | http://localhost:3000/workspace | Analytics |
| **Reports** | http://localhost:3000/reports | Saved insights |

---

## 🎨 Design System Quick Reference

### Component Styles
```css
/* Card */
.card {
  background: var(--bg);
  border: 1px solid var(--stroke);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

/* Button */
.button {
  background: var(--fg);
  color: var(--bg);
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
}

/* Input */
.input {
  background: transparent;
  border: 1px solid var(--stroke);
  border-radius: 0.375rem;
  padding: 0.75rem 1rem;
}
```

---

## 📊 Features Implemented

### ✅ Core Features
- [x] Landing page with GSAP animations
- [x] CSV upload with drag-and-drop
- [x] Processing animation (7 steps)
- [x] Three-pane workspace layout
- [x] Chat interface with agents
- [x] Agent badges and thinking process
- [x] Data DNA panel
- [x] Insight cards with trends
- [x] Category filters
- [x] Export options
- [x] Responsive design

### 🟡 Partial Features
- [ ] Real CSV parsing (simulated)
- [ ] Backend integration (simulated)
- [ ] Chart visualization (Recharts installed)
- [ ] Code syntax highlighting (button exists)

### ⚪ Planned Features
- [ ] LLM integration
- [ ] Database connections
- [ ] User authentication
- [ ] Real-time collaboration

---

## 🔧 Troubleshooting

### Server not starting?
```bash
# Kill existing process
taskkill /F /IM node.exe

# Restart
npm run dev
```

### Build errors?
```bash
# Clear cache
rm -rf .next
npm run build
```

### Missing images?
```bash
# Check public folder
ls public/
# Should see: img1.jpg - img15.jpg, logo.png
```

---

## 📚 Documentation Index

1. **README.md** - Project overview and setup
2. **DESIGN_SYSTEM.md** - Complete design guide
3. **BUILD_SUMMARY.md** - What was built
4. **COMPONENT_STATUS.md** - Component tracking
5. **QUICK_START.md** - This file

---

## 🎓 Learning Resources

### Next.js
- [Next.js Docs](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)

### GSAP
- [GSAP Docs](https://gsap.com/docs/v3/)
- [GSAP Easing Visualizer](https://gsap.com/docs/v3/Eases)

### Tailwind CSS
- [Tailwind v4 Docs](https://tailwindcss.com/docs)

### Design System
- See `DESIGN_SYSTEM.md` for complete guide

---

## 🚀 Next Steps

1. **Explore the app** - Visit all 4 pages
2. **Read the docs** - Check DESIGN_SYSTEM.md
3. **Customize** - Modify colors, content, animations
4. **Extend** - Add new components from COMPONENT_STATUS.md

---

## 💡 Pro Tips

1. **Design System** - Always use CSS variables (var(--bg), var(--fg))
2. **Animations** - Use GSAP, not CSS transitions
3. **Spacing** - Use multiples of 0.25rem (4px)
4. **Colors** - Never use colors outside the palette
5. **Font** - Always use PP Neue Montreal

---

## 🎉 You're All Set!

Your InsightX application is ready. Visit:

**http://localhost:3000**

Enjoy exploring! 🚀

---

**Last Updated:** 2026-02-13  
**Version:** 1.0.0  
**Status:** ✅ Ready to Use
