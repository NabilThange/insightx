# Landing Page Design System & Constraints

> **Scope**: This document specifically governs the **Landing Page** (`/`). 
> **Note**: The landing page operates on a distinct "Legacy" design system separate from the main application's "Bloomberg Terminal" dark mode aesthetic.

---

## 1. Design Theme & Philosophy

The landing page follows a **"Swiss Brutalist"** aesthetic characterized by:
- **High Contrast**: Harsh dark grey text against a warm off-white background.
- **Visible Structure**: Layout grid lines are explicitly visible as dividers.
- **Typography-First**: Massive headings (6rem+) drive the visual hierarchy.
- **Motion-Driven**: The page is defined by its entrance sequence (counters, reveals, flips); static states are secondary.

### Core Visual Traits
- **Flat Design**: No shadows, no gradients, no depth.
- **Sharp Edges**: Buttons and containers have defined borders (though some contrast with rounded 2rem buttons).
- **Asymmetry**: Content is balanced asymmetrically (Header left, Site Info right).

---

## 2. Design System (Tokens)

The landing page implementation relies on a minimal set of CSS variables defined in global scope.

### 🎨 Color Palette
| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#f1efe7` | **Canvas**. A warm, paper-like off-white. |
| `--fg` | `#1f1f1f` | **Ink**. A soft, lighter black for text and borders. |
| `--loader-bg` | `#e0e0d8` | **Curtain**. Slightly darker beige for the initial reveal overlay. |
| `--stroke` | `rgba(0, 0, 0, 0.2)` | **Grid**. Subtle lines for dividers. |

### ✒️ Typography
**Font Family**: `PP Neue Montreal` (Primary), sans-serif (Fallback).

| Element | Size | weight | Letter Spacing | Line Height | Usage |
|---------|------|--------|----------------|-------------|-------|
| **H1** | `6rem` | 500 | `-0.1rem` | 1.1 | Main Headline |
| **H2** | `1.75rem` | 500 | `-0.02rem` | 1.1 | Sub-headlines |
| **Body/Link** | `1rem` | 500 | Normal | 1.0 | Navigation, Copy |
| **Counter** | `120px` | N/A | N/A | 150px | Preloader Digits |

### 📐 Layout & Spacing
The layout is built on rigid block units:
- **Sidebar Width**: `5rem` (Fixed)
- **Nav Height**: `5rem` (Fixed)
- **Gutter/Padding**: `1.5rem` (Standard padding)
- **Content Offset**: `7.5rem` (Sidebar `5rem` + Padding `1.5rem` = Content Start)

---

## 3. Component Architecture & Behavior

### The Hero Section
- **Structure**: `100svh` (Small Viewport Height) to prevent mobile scroll issues.
- **Background**: Solid `--bg`.
- **Preloader**: A dedicated `.hero-bg` overlay and `.counter` element that animate out.

### Imagery (GSAP Flip)
- **State A (Initial)**: Images are scattered or positioned centrally (implied by `position: absolute`).
- **State B (Final)**: Images move to specific grid positions or `bottom-right` depending on CSS classes.
- **Mechanism**: The `GSAP Flip` plugin captures the state change and animates the layout reflow.

### Text Reveals (SplitText)
- **Mechanism**: All text (H1, H2, P, Links) is split into lines (`.line`).
- **Animation**: Inner spans translate from `y: 125%` to `y: 0%`.
- **Constraint**: Text containers must have `overflow: hidden` to mask the entry.

---

## 4. Design Constraints (Technical & Stylistic)

### ⚠️ Critical Constraints
1.  **Style Isolation**: 
    - **DO NOT** use the `v2.0` variables (`--bg-base`, `--accent-blue`) on the landing page.
    - **DO NOT** import components from the main app that rely on the dark theme.
    - The landing page must remain practically self-contained.
    
2.  **Animation Dependencies**:
    - The page **requires** `gsap`, `Flip`, and `SplitText` plugins registered.
    - Text animations **must** run effectively on client-side hydration (`useLayoutEffect` or `useEffect`).
    - **Performance**: Heavy DOM manipulation is used. Avoid adding too many additional animated elements.

3.  **Responsive Hard-Stop**:
    - **Breakpoint**: `1000px`.
    - **Behavior**: 
        - Navigation links **disappear** (`display: none`).
        - H1 shrinks drastically (`6rem` -> `2.5rem`).
        - Layout shifts from multi-column to single-column stack.
    - **Constraint**: Any new content added must account for this aggressive simplification at `1000px`.

4.  **Z-Index & Stacking**:
    - The `sidebar` and `nav` overlays sit above the content.
    - The `hero-bg` (curtain) sits above everything initially.

### ❌ Anti-Patterns (What to Avoid)
- **Gradients**: The theme is strictly flat colors.
- **Box Shadows**: Depth is created by layout and borders, not shadows.
- **System Fonts**: The design breaks without `PP Neue Montreal` (sizing/spacing is tuned to it).
- **Mixing Themes**: Do not introduce "Dark Mode" toggles to this page; it is intentionally strictly light/print-styled.
