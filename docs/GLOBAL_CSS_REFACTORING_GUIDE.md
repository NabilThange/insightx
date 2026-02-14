# Global CSS Refactoring Guide

**Date:** 2026-02-13  
**Purpose:** Guide for removing inline styles and using global CSS classes

---

## 📋 Overview

All inline `<style jsx>` blocks have been replaced with a comprehensive `globals.css` file containing:
- **Utility classes** for common patterns
- **Component classes** for specific UI elements
- **Layout classes** for navigation, sidebars, and content areas
- **Responsive styles** with mobile-first approach

---

## 🎨 Available Global Classes

### Layout Classes

```tsx
// Page Container
<div className="page-container">

// Navigation
<nav className="app-nav">
  <div className="logo-name"><a href="/">InsightX</a></div>
  <div className="nav-items">
    <a href="/workspace" className="active">Workspace</a>
    <a href="/reports">Reports</a>
  </div>
  <div className="divider" />
</nav>

// Sidebar
<div className="app-sidebar">
  <div className="divider" />
</div>

// Centered Content
<div className="centered-stage">
  <div className="content-wrapper">
    {/* Content here */}
  </div>
</div>
```

### Button Classes

```tsx
// Primary Button
<button className="btn-primary">
  <Send size={20} />
  <span>Send</span>
</button>

// Secondary Button
<button className="btn-secondary">
  <Download size={18} />
  <span>Export All</span>
</button>

// Success Button
<button className="btn-success">
  Continue to Workspace →
</button>
```

### Card Classes

```tsx
// Base Card
<div className="card">
  {/* Card content */}
</div>

// Report Card (with link)
<Link href={`/reports/${id}`} className="report-card-link">
  <div className="report-card">
    <div className="card-header">
      <h3 className="card-title">{title}</h3>
      {isPinned && <div className="pin-badge"><Pin size={14} /></div>}
    </div>
    
    <div className="metric-section">
      <div className="metric">{metric}</div>
      <div className="trend" style={{ color: trendColor }}>
        <TrendingUp size={16} />
        <span>{trendValue}</span>
      </div>
    </div>
    
    <div className="tags-grid">
      {tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
    </div>
    
    <div className="card-footer">
      <div className="date">
        <Calendar size={14} />
        <span>{date}</span>
      </div>
      <ExternalLink size={14} />
    </div>
  </div>
</Link>
```

### Form Classes

```tsx
// Input Field
<input
  type="text"
  className="input-field"
  placeholder="Host"
/>

// Textarea
<textarea
  className="textarea-field"
  placeholder="Ask a question about your data..."
  rows={4}
/>

// Search Input
<div className="search-input-wrapper">
  <Search size={18} />
  <input
    type="text"
    className="search-input"
    placeholder="Search reports..."
  />
</div>
```

### Badge & Tag Classes

```tsx
// Dataset Badge
<div className="badge">
  <Database size={16} />
  <span className="filename">{filename}</span>
  <span className="divider">·</span>
  <span>{rowCount.toLocaleString()} rows</span>
</div>

// Tag
<span className="tag">Transactions</span>

// Pin Badge
<div className="pin-badge">
  <Pin size={14} />
</div>
```

### Chip Classes

```tsx
// Query Chip
<button className="query-chip">
  <Sparkles size={14} />
  <span>Why are failures high?</span>
</button>

// Filter Chip
<button className="filter-chip">Transactions</button>
<button className="filter-chip active">Network</button>

// Tab
<button className="tab">Upload CSV</button>
<button className="tab active">Connect Database</button>
```

### Other Components

```tsx
// Drop Zone
<div className="drop-zone">
  <Upload size={64} />
  <h3>Drop your CSV file here</h3>
  <p>or click to browse</p>
</div>

// Empty State
<div className="empty-state">
  <h3>No reports found</h3>
  <p>Try adjusting your filters or create a new analysis</p>
</div>

// Section Title
<h2 className="section-title">Pinned</h2>

// Subtitle
<p className="subtitle">Saved analyses and pinned insights</p>
```

### Grid Layouts

```tsx
// Reports Grid
<div className="reports-grid">
  {reports.map(report => <ReportCard key={report.id} {...report} />)}
</div>

// Tags Grid
<div className="tags-grid">
  {tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
</div>

// Filter Chips
<div className="filter-chips">
  {filters.map(filter => <button key={filter} className="filter-chip">{filter}</button>)}
</div>

// Suggested Queries
<div className="suggested-queries">
  {queries.map(query => <button key={query} className="query-chip">{query}</button>)}
</div>
```

---

## 🔄 Refactoring Steps

### Step 1: Remove Inline Styles

**Before:**
```tsx
<div className="connect-page">
  {/* Content */}
  
  <style jsx>{`
    .connect-page {
      position: relative;
      width: 100vw;
      min-height: 100vh;
      background-color: var(--bg);
      color: var(--fg);
    }
    /* ... more styles */
  `}</style>
</div>
```

**After:**
```tsx
<div className="page-container">
  {/* Content */}
</div>
```

### Step 2: Replace Custom Classes with Global Classes

**Before:**
```tsx
<button className="connect-btn" onClick={handleConnect}>
  Test Connection
</button>

<style jsx>{`
  .connect-btn {
    padding: 0.75rem 1.5rem;
    background-color: var(--fg);
    color: var(--bg);
    /* ... */
  }
`}</style>
```

**After:**
```tsx
<button className="btn-primary" onClick={handleConnect}>
  Test Connection
</button>
```

### Step 3: Use Utility Classes for Text

**Before:**
```tsx
<p style={{ color: 'var(--text-muted)' }}>
  Saved analyses and pinned insights
</p>
```

**After:**
```tsx
<p className="subtitle">
  Saved analyses and pinned insights
</p>
```

---

## 📝 Component Refactoring Examples

### Example 1: Connect Page

**Before (with inline styles):**
```tsx
export default function ConnectPage() {
  return (
    <div className="connect-page">
      <nav className="connect-nav">
        {/* ... */}
      </nav>
      
      <style jsx>{`
        .connect-page { /* ... */ }
        .connect-nav { /* ... */ }
        /* 200+ lines of CSS */
      `}</style>
    </div>
  );
}
```

**After (using global classes):**
```tsx
export default function ConnectPage() {
  return (
    <div className="page-container">
      <nav className="app-nav">
        <div className="logo-name"><a href="/">InsightX</a></div>
        <div className="divider" />
      </nav>
      
      <div className="app-sidebar">
        <div className="divider" />
      </div>
      
      {/* No inline styles needed! */}
    </div>
  );
}
```

### Example 2: ReportCard Component

**Before:**
```tsx
export default function ReportCard({ title, metric, tags }) {
  return (
    <>
      <div className="report-card">
        <h3 className="title">{title}</h3>
        <div className="metric">{metric}</div>
        <div className="tags">
          {tags.map(tag => <span className="tag">{tag}</span>)}
        </div>
      </div>
      
      <style jsx>{`
        .report-card { /* ... */ }
        .title { /* ... */ }
        .metric { /* ... */ }
        .tags { /* ... */ }
        .tag { /* ... */ }
      `}</style>
    </>
  );
}
```

**After:**
```tsx
export default function ReportCard({ title, metric, tags }) {
  return (
    <div className="report-card">
      <h3 className="card-title">{title}</h3>
      <div className="metric">{metric}</div>
      <div className="tags-grid">
        {tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
      </div>
    </div>
  );
}
```

---

## ✅ Benefits

1. **Consistency:** All components use the same design system
2. **Maintainability:** Update styles in one place (globals.css)
3. **Performance:** No duplicate CSS in every component
4. **Readability:** Cleaner component code without style blocks
5. **Reusability:** Classes can be used across any component
6. **Type Safety:** No string interpolation in CSS

---

## 🎯 Next Steps

To complete the refactoring:

1. **Update Pages:**
   - `app/connect/page.tsx` - Remove inline styles, use global classes
   - `app/reports/page.tsx` - Remove inline styles, use global classes
   - `app/workspace/page.tsx` - Remove inline styles, use global classes

2. **Update Components:**
   - `components/data/ReportCard.tsx` - Use `.report-card`, `.card-title`, etc.
   - `components/interactive/ReportFilterBar.tsx` - Use `.filter-bar`, `.filter-chip`, etc.
   - `components/interactive/DatasetBadge.tsx` - Use `.badge` class
   - `components/interactive/SuggestedQueryChips.tsx` - Use `.query-chip` class

3. **Test:**
   - Verify all pages render correctly
   - Check responsive behavior at 1000px breakpoint
   - Ensure hover states work properly
   - Validate color consistency

---

## 📚 CSS Variables Reference

All available CSS variables in `globals.css`:

```css
/* Colors */
--bg: #f1efe7
--fg: #1f1f1f
--loader-bg: #e0e0d8
--stroke: rgba(0, 0, 0, 0.2)
--success: #22C55E
--warning: #F59E0B
--error: #EF4444
--info: #3B7FF5
--accent: #3B7FF5
--accent-purple: #A855F7
--text-muted: rgba(31, 31, 31, 0.7)
--text-subtle: rgba(31, 31, 31, 0.5)

/* Transitions */
--transition-fast: 150ms
--transition-medium: 300ms
--transition-slow: 500ms

/* Spacing */
--sidebar-width: 5rem
--nav-height: 5rem
--padding-standard: 1.5rem
--padding-content: 7.5rem

/* Border Radius */
--radius-sm: 0.25rem
--radius-md: 0.375rem
--radius-lg: 0.75rem
--radius-full: 9999px
```

---

**Last Updated:** 2026-02-13  
**Version:** 2.0.0  
**Status:** Ready for implementation
