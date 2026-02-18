"use client";

/**
 * RichMarkdownRenderer
 * Transforms plain AI markdown responses into visually rich, structured output.
 *
 * Features:
 * - Custom styled components for all markdown elements
 * - Auto-detects **Label**: Value stat patterns → renders as a visual stats grid
 * - Wraps "INSIGHTX LEAD" responses in a premium insight card container
 */

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "../data/CodeBlock";

interface RichMarkdownRendererProps {
  content: string;
}

// ─── Stat Pattern Detector ────────────────────────────────────────────────────
// Matches lines like: **Average transaction value**: $4,914.65
const STAT_LINE_REGEX = /^\*\*(.+?)\*\*:\s*(.+)$/;

interface StatItem {
  label: string;
  value: string;
}

function extractStats(text: string): StatItem[] {
  const lines = text.split("\n");
  const stats: StatItem[] = [];
  for (const line of lines) {
    const match = line.trim().match(STAT_LINE_REGEX);
    if (match) {
      stats.push({ label: match[1], value: match[2].trim() });
    }
  }
  return stats;
}

// ─── Stats Grid Component ─────────────────────────────────────────────────────
function StatsGrid({ stats }: { stats: StatItem[] }) {
  if (stats.length === 0) return null;
  return (
    <div className="stats-grid">
      {stats.map(({ label, value }) => (
        <div key={label} className="stat-cell">
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value}</div>
        </div>
      ))}
      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 0.625rem;
          margin: 0.75rem 0;
        }
        .stat-cell {
          background: var(--bg-elevated);
          border: 1px solid var(--stroke);
          border-radius: 10px;
          padding: 0.75rem 1rem;
          transition: border-color 0.15s ease;
        }
        .stat-cell:hover {
          border-color: var(--fg);
        }
        .stat-label {
          font-size: 0.6875rem;
          font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.25rem;
          line-height: 1.3;
        }
        .stat-value {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--fg);
          line-height: 1.2;
        }
      `}</style>
    </div>
  );
}

// ─── Highlight Block ──────────────────────────────────────────────────────────
// Renders the primary bold metric (e.g. "Maximum Amount Spent: $9,978.65")
function HighlightBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="highlight-block">
      <div className="highlight-label">{label}</div>
      <div className="highlight-value">{value}</div>
      <style jsx>{`
        .highlight-block {
          background: var(--fg);
          color: var(--bg);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          margin: 0.75rem 0;
          display: inline-flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        .highlight-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          opacity: 0.65;
        }
        .highlight-value {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
      `}</style>
    </div>
  );
}

// ─── Custom ReactMarkdown Components ─────────────────────────────────────────
function buildComponents(highlightStat: StatItem | null, gridStats: StatItem[]) {
  let highlightRendered = false;
  let gridRendered = false;

  return {
    h1: ({ children }: any) => (
      <h1 className="md-h1">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="md-h2">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="md-h3">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="md-h4">{children}</h4>
    ),
    p: ({ children }: any) => {
      // Detect if this paragraph IS the highlight stat line
      const text = typeof children === "string" ? children : "";
      if (highlightStat && !highlightRendered) {
        const match = text.match(/\*\*(.+?)\*\*:\s*(.+)/);
        if (match && match[1] === highlightStat.label) {
          highlightRendered = true;
          return <HighlightBlock label={match[1]} value={match[2]} />;
        }
      }
      return <p className="md-p">{children}</p>;
    },
    strong: ({ children }: any) => {
      const text = String(children);
      // If this strong is a stat label in the grid, suppress it (grid renders it)
      if (gridStats.some((s) => s.label === text) && !gridRendered) {
        return null;
      }
      return <strong className="md-strong">{children}</strong>;
    },
    ul: ({ children }: any) => (
      <ul className="md-ul">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="md-ol">{children}</ol>
    ),
    li: ({ children }: any) => (
      <li className="md-li">
        <span className="md-li-dot">·</span>
        <span>{children}</span>
      </li>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="md-blockquote">{children}</blockquote>
    ),
    a: ({ href, children }: any) => (
      <a href={href} className="md-a" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    hr: () => <hr className="md-hr" />,
    pre: ({ children }: any) => <>{children}</>,
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const codeContent = String(children).replace(/\n$/, "");
      if (!inline && match) {
        return <CodeBlock language={match[1]} code={codeContent} />;
      }
      return (
        <code className="md-inline-code" {...props}>
          {children}
        </code>
      );
    },
    table: ({ children }: any) => (
      <div className="md-table-wrapper">
        <table className="md-table">{children}</table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="md-thead">{children}</thead>
    ),
    tbody: ({ children }: any) => <tbody>{children}</tbody>,
    tr: ({ children }: any) => <tr className="md-tr">{children}</tr>,
    th: ({ children }: any) => <th className="md-th">{children}</th>,
    td: ({ children }: any) => <td className="md-td">{children}</td>,
  };
}

// ─── Insight Card Wrapper ─────────────────────────────────────────────────────
// Wraps the entire response in a premium card when it's an "INSIGHTX LEAD" response
const INSIGHT_PATTERNS = [
  "Maximum Amount",
  "Based on the Data DNA",
  "INSIGHTX LEAD",
  "Additional Context",
];

function isInsightResponse(content: string): boolean {
  return INSIGHT_PATTERNS.some((p) => content.includes(p));
}

// ─── Main Renderer ────────────────────────────────────────────────────────────
export default function RichMarkdownRenderer({ content }: RichMarkdownRendererProps) {
  const { stats, highlightStat, gridStats } = useMemo(() => {
    const all = extractStats(content);
    // First stat is the "highlight" (primary metric), rest go to the grid
    const highlight = all.length > 0 ? all[0] : null;
    const grid = all.length > 1 ? all.slice(1) : all;
    return { stats: all, highlightStat: highlight, gridStats: grid };
  }, [content]);

  const isInsight = useMemo(() => isInsightResponse(content), [content]);
  const components = useMemo(
    () => buildComponents(highlightStat, gridStats),
    [highlightStat, gridStats]
  );

  const markdownBody = (
    <div className="rich-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components as any}>
        {content}
      </ReactMarkdown>

      {/* Stats Grid — rendered after markdown, positioned contextually */}
      {gridStats.length > 0 && <StatsGrid stats={gridStats} />}

      <style jsx>{`
        .rich-md {
          font-size: 0.875rem;
          line-height: 1.65;
          color: var(--fg);
        }

        /* Headings */
        .rich-md :global(.md-h1) {
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: -0.025em;
          color: var(--fg);
          margin: 1.25rem 0 0.5rem;
          line-height: 1.2;
        }
        .rich-md :global(.md-h2) {
          font-size: 1.125rem;
          font-weight: 600;
          letter-spacing: -0.015em;
          color: var(--fg);
          margin: 1rem 0 0.375rem;
          line-height: 1.3;
        }
        .rich-md :global(.md-h3) {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--fg);
          margin: 0.875rem 0 0.25rem;
        }
        .rich-md :global(.md-h4) {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0.75rem 0 0.25rem;
        }

        /* Paragraphs */
        .rich-md :global(.md-p) {
          margin-bottom: 0.625rem;
          color: var(--fg);
        }
        .rich-md :global(.md-p:last-child) {
          margin-bottom: 0;
        }

        /* Bold */
        .rich-md :global(.md-strong) {
          font-weight: 650;
          color: var(--fg);
        }

        /* Lists */
        .rich-md :global(.md-ul),
        .rich-md :global(.md-ol) {
          margin: 0.375rem 0 0.75rem;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .rich-md :global(.md-li) {
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
          color: var(--fg);
        }
        .rich-md :global(.md-li-dot) {
          color: var(--text-muted);
          font-size: 1.1em;
          line-height: 1.5;
          flex-shrink: 0;
          margin-top: 0.05em;
        }

        /* Blockquote */
        .rich-md :global(.md-blockquote) {
          border-left: 2px solid var(--stroke);
          padding: 0.5rem 0 0.5rem 1rem;
          margin: 0.75rem 0;
          color: var(--text-muted);
          font-style: italic;
        }

        /* Links */
        .rich-md :global(.md-a) {
          color: var(--accent);
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        /* HR */
        .rich-md :global(.md-hr) {
          border: none;
          border-top: 1px solid var(--stroke);
          margin: 1rem 0;
        }

        /* Inline code */
        .rich-md :global(.md-inline-code) {
          background: var(--bg-elevated);
          color: var(--accent);
          padding: 0.15em 0.4em;
          border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8em;
          border: 1px solid var(--stroke);
        }

        /* Tables */
        .rich-md :global(.md-table-wrapper) {
          overflow-x: auto;
          margin: 0.75rem 0;
          border: 1px solid var(--stroke);
          border-radius: 10px;
        }
        .rich-md :global(.md-table) {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }
        .rich-md :global(.md-thead) {
          background: var(--bg-elevated);
        }
        .rich-md :global(.md-th) {
          padding: 0.625rem 1rem;
          text-align: left;
          font-weight: 600;
          color: var(--fg);
          border-bottom: 1px solid var(--stroke);
          white-space: nowrap;
        }
        .rich-md :global(.md-tr) {
          border-bottom: 1px solid var(--stroke);
        }
        .rich-md :global(.md-tr:last-child) {
          border-bottom: none;
        }
        .rich-md :global(.md-td) {
          padding: 0.5rem 1rem;
          color: var(--fg);
        }
      `}</style>
    </div>
  );

  if (isInsight) {
    return (
      <div className="insight-wrapper">
        <div className="insight-badge">✦ INSIGHTX LEAD</div>
        {markdownBody}
        <style jsx>{`
          .insight-wrapper {
            background: var(--bg-surface);
            border: 1px solid var(--stroke);
            border-radius: 14px;
            padding: 1.25rem 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .insight-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.6875rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: var(--text-muted);
            background: var(--bg-elevated);
            border: 1px solid var(--stroke);
            padding: 0.25rem 0.625rem;
            border-radius: 999px;
            width: fit-content;
          }
        `}</style>
      </div>
    );
  }

  return markdownBody;
}
