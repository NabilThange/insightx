# InsightX Design System

> **Philosophy:** Minimalist, Professional, Animation-Rich

---

## 🎨 Color Palette

### Primary Colors
```css
--bg: #f1efe7;              /* Warm Beige Background */
--fg: #1f1f1f;              /* Deep Charcoal Text */
--loader-bg: #e0e0d8;       /* Lighter Beige for Loading States */
--stroke: rgba(0, 0, 0, 0.2); /* Subtle Divider Lines */
```

### Semantic Colors (Extended for Analytics)
```css
--success: #2d5016;         /* Deep Green for Success States */
--warning: #d97706;         /* Amber for Warnings/Anomalies */
--error: #b91c1c;           /* Deep Red for Errors */
--info: #1e40af;            /* Electric Blue for AI/Info */
--accent: #4f46e5;          /* Indigo for Interactive Elements */
```

### Usage Guidelines
- **Background:** Always use `--bg` for main backgrounds
- **Text:** Primary text uses `--fg`, secondary text at 70% opacity
- **Dividers:** Use `--stroke` for all separators and borders
- **Interactive Elements:** Use `--accent` for hover states and CTAs

---

## 📐 Typography

### Font Family
```css
font-family: "PP Neue Montreal", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

**Fallback Strategy:**
1. PP Neue Montreal (Primary - loaded via CDN)
2. System fonts for performance
3. Generic sans-serif

### Type Scale

| Element | Size | Weight | Letter Spacing | Line Height | Usage |
|---------|------|--------|----------------|-------------|-------|
| **H1** | 6rem (96px) | 500 | -0.1rem | 1.1 | Hero Headlines |
| **H2** | 1.75rem (28px) | 500 | -0.02rem | 1.1 | Section Titles |
| **Body** | 1rem (16px) | 500 | 0 | 1 | Primary Text |
| **Small** | 0.875rem (14px) | 400 | 0 | 1.2 | Captions, Labels |
| **Code** | 0.875rem (14px) | 400 | 0 | 1.5 | Code Blocks |

### Responsive Typography
```css
@media (max-width: 1000px) {
  h1 { font-size: 2.5rem; letter-spacing: -0.05rem; }
  h2 { font-size: 1.5rem; }
}
```

---

## 📏 Spacing System

### Base Unit: 0.25rem (4px)

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 0.25rem (4px) | Tight spacing, icon gaps |
| `sm` | 0.5rem (8px) | Small gaps, padding |
| `md` | 1rem (16px) | Standard spacing |
| `lg` | 1.5rem (24px) | Section padding |
| `xl` | 3rem (48px) | Large gaps |
| `2xl` | 6rem (96px) | Hero spacing |
| `3xl` | 7.5rem (120px) | Sidebar width |

### Layout Constraints
- **Sidebar Width:** `5rem` (80px)
- **Content Padding:** `1.5rem` (24px)
- **Max Content Width:** `60%` for readability
- **Gutter:** `1.5rem` minimum on all sides

---

## 🔲 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 0.375rem (6px) | Small cards, buttons |
| `md` | 0.75rem (12px) | Images, cards |
| `lg` | 1rem (16px) | Large containers |
| `full` | 9999px | Pills, badges |

**Default:** `0.75rem` for all images and cards

---

## 🎭 Animation Principles

### GSAP Configuration
```javascript
// Default Easing
ease: "power3.inOut"  // Smooth, professional
ease: "power4.out"    // Text reveals
ease: "power2.inOut"  // Background transitions
```

### Animation Durations
| Type | Duration | Usage |
|------|----------|-------|
| **Micro** | 0.3s | Hover states, small transitions |
| **Standard** | 1s | Element reveals, fades |
| **Complex** | 2-3s | Page load sequences |
| **Stagger** | 0.1s | Sequential reveals |

### Key Animation Patterns

#### 1. Text Reveal (SplitText)
```javascript
// Split into lines, wrap in spans, animate from bottom
transform: translateY(125%) → translateY(0%)
duration: 1s
stagger: 0.1s
ease: "power4.out"
```

#### 2. Scale Entrance
```javascript
// Images, logos
scale: 0 → scale: 1
duration: 1s
ease: "power3.out"
```

#### 3. Divider Draw
```javascript
// Horizontal: scaleX(0%) → scaleX(100%)
// Vertical: scaleY(0%) → scaleY(100%)
duration: 1s
ease: "power3.inOut"
```

#### 4. Counter Animation
```javascript
// Digit roll effect
translateY: 0 → translateY: -totalDistance
duration: 2-3s
ease: "power2.inOut"
```

### Animation Sequence (Page Load)
1. **Background Reveal** (3s) - `scaleY` from bottom
2. **Image Grid Stagger** (1s) - Scale in with 0.125s stagger
3. **Flip Animation** (1s) - Images rearrange to final positions
4. **Dividers Draw** (1s) - Sidebar, nav, section dividers
5. **Logo Scale** (1s) - Sidebar logo appears
6. **Text Reveals** (1s) - Nav, header, footer text slides up

---

## 🧩 Component Anatomy

### Navigation
```
Height: 5rem (80px)
Padding: 1.5rem horizontal, 1.5rem vertical
Left Offset: 7.5rem (to account for sidebar)
Divider: 1px bottom border
```

### Sidebar
```
Width: 5rem (80px)
Height: 100vh (full height)
Logo Size: 2rem × 2rem
Divider: 1px right border
```

### Hero Section
```
Width: 100vw
Height: 100vh
Background: var(--bg)
Overflow: hidden
```

### Image Grid
```
Image Size: 20% width, aspect-ratio 5/3
Border Radius: 0.75rem
Position: Absolute positioning for Flip animations
Initial: Top-left (1.5rem, 1.5rem)
Final: Bottom-right (1.5rem, 1.5rem)
```

### Content Sections
```
Header: 35% from top, 60% width
Site Info: 60% from top, 20% width, right-aligned
Footer: Bottom 1.5rem, left 7.5rem
```

---

## 📱 Responsive Breakpoints

### Desktop First Approach
```css
/* Desktop: Default styles */
/* Tablet/Mobile: max-width: 1000px */

@media (max-width: 1000px) {
  /* Adjustments */
  - Hide nav links (keep logo and CTA)
  - Increase image size to 30%
  - Adjust header width to calc(100% - 12.5rem)
  - Stack site info below header
}
```

### Mobile Constraints
- Minimum touch target: 44px × 44px
- Readable line length: max 60 characters
- Minimum font size: 14px

---

## 🎯 Design Constraints

### ✅ DO
- Use exact color values from the palette
- Maintain 1.5rem minimum padding on all sides
- Apply GSAP animations for all state changes
- Use PP Neue Montreal font exclusively
- Keep backgrounds light (beige), text dark
- Use subtle strokes for dividers (20% opacity)
- Animate text with SplitText line reveals
- Stagger sequential animations by 0.1s

### ❌ DON'T
- Use colors outside the defined palette
- Use generic fonts (Arial, Helvetica)
- Use CSS transitions (use GSAP instead)
- Use hard borders (use subtle strokes)
- Use pure white (#fff) or pure black (#000)
- Skip animation sequences
- Use abrupt state changes
- Ignore responsive breakpoints

---

## 🔧 Utility Classes (Tailwind Extension)

### Custom Tailwind Config
```javascript
theme: {
  extend: {
    colors: {
      bg: '#f1efe7',
      fg: '#1f1f1f',
      'loader-bg': '#e0e0d8',
      stroke: 'rgba(0, 0, 0, 0.2)',
    },
    fontFamily: {
      sans: ['PP Neue Montreal', 'system-ui', 'sans-serif'],
    },
    spacing: {
      '7.5': '1.875rem',
      '15': '3.75rem',
      '30': '7.5rem',
    },
  },
}
```

---

## 📊 Analytics-Specific Extensions

### Chart Colors (for Recharts)
```javascript
const chartColors = {
  primary: '#1f1f1f',      // Main data line
  secondary: '#4f46e5',    // Secondary data
  success: '#2d5016',      // Positive trends
  warning: '#d97706',      // Anomalies
  error: '#b91c1c',        // Failures
  grid: 'rgba(0,0,0,0.1)', // Grid lines
  tooltip: '#f1efe7',      // Tooltip background
}
```

### Agent Badge Colors
```javascript
const agentColors = {
  orchestrator: '#4f46e5', // Indigo
  sql: '#1e40af',          // Blue
  python: '#2d5016',       // Green
  system: '#1f1f1f',       // Charcoal
}
```

### Confidence Meter
```javascript
// Color based on confidence level
>= 90%: success (#2d5016)
70-89%: info (#1e40af)
50-69%: warning (#d97706)
< 50%: error (#b91c1c)
```

---

## 🎨 Component-Specific Patterns

### Cards
```css
background: var(--bg)
border: 1px solid var(--stroke)
border-radius: 0.75rem
padding: 1.5rem
box-shadow: none (flat design)
```

### Buttons
```css
/* Primary */
background: var(--fg)
color: var(--bg)
padding: 0.75rem 1.5rem
border-radius: 0.375rem
font-weight: 500

/* Hover */
transform: scale(1.02)
transition: GSAP (0.3s, power3.out)
```

### Inputs
```css
background: transparent
border: 1px solid var(--stroke)
border-radius: 0.375rem
padding: 0.75rem 1rem
color: var(--fg)
font-family: inherit

/* Focus */
border-color: var(--accent)
outline: none
```

### Code Blocks
```css
background: var(--loader-bg)
border-radius: 0.75rem
padding: 1rem
font-family: 'JetBrains Mono', 'Courier New', monospace
font-size: 0.875rem
color: var(--fg)
overflow-x: auto
```

---

## 📖 Usage Examples

### Example 1: InsightCard Component
```tsx
<div className="insight-card">
  <h3>Transaction Volume</h3>
  <div className="metric">250,000</div>
  <div className="trend positive">↑ 12%</div>
</div>

// Styles
.insight-card {
  background: var(--bg);
  border: 1px solid var(--stroke);
  border-radius: 0.75rem;
  padding: 1.5rem;
}
```

### Example 2: Agent Badge
```tsx
<span className="agent-badge sql">
  🐘 SQL Agent
</span>

// Styles
.agent-badge {
  background: var(--loader-bg);
  color: var(--fg);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}
```

---

## 🚀 Implementation Checklist

When creating new components:

- [ ] Use exact color values from palette
- [ ] Apply PP Neue Montreal font
- [ ] Include GSAP animations for state changes
- [ ] Follow spacing system (multiples of 0.25rem)
- [ ] Use 0.75rem border radius for cards/images
- [ ] Add responsive styles for mobile (<1000px)
- [ ] Test with SplitText for text reveals
- [ ] Ensure 1.5rem minimum padding
- [ ] Use subtle strokes (20% opacity) for dividers
- [ ] Maintain flat design (no shadows)

---

**Last Updated:** 2026-02-13  
**Version:** 1.0.0  
**Maintained by:** InsightX Team
