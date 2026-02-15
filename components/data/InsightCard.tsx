"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import Link from "next/link";

interface InsightCardProps {
  id: string;
  title: string;
  category: string;
  timestamp: string;
  metric: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  chartType: "line" | "bar";
  chartData: any[];
  recommendation?: string;
  tags: string[];
  index?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--stroke)',
        padding: '8px 12px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        minWidth: '80px',
        textAlign: 'left',
        zIndex: 100,
        pointerEvents: 'none'
      }}>
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', lineHeight: '1.2' }}>{label}</p>
        <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: 600, color: 'var(--fg)', lineHeight: '1.2' }}>
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function InsightCard({
  id,
  title,
  category,
  timestamp,
  metric,
  trend,
  trendValue,
  chartType,
  chartData,
  recommendation,
  tags,
  index = 0,
}: InsightCardProps) {

  const getTrendIcon = () => {
    switch (trend) {
      case "up": return <TrendingUp size={14} />;
      case "down": return <TrendingDown size={14} />;
      default: return <Minus size={14} />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up": return "var(--accent-green)";
      case "down": return "var(--accent-red)";
      default: return "var(--text-muted)";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      className="insight-card-wrapper"
    >
      <Link href={`/reports/${id}`} className="insight-card-link">
        <div className="insight-card">
          {/* HEADER */}
          <div className="card-header">
            <span className="category-badge">{category}</span>
            <span className="timestamp">{timestamp}</span>
          </div>

          {/* MAIN CONTENT */}
          <div className="card-main">
            <div className="metric-row">
              <span className="metric-value">{metric}</span>
              <div className="trend-badge" style={{
                color: getTrendColor(),
                backgroundColor: `color-mix(in srgb, ${getTrendColor()} 10%, transparent)`
              }}>
                {getTrendIcon()}
                <span>{trendValue}</span>
              </div>
            </div>
            <h3 className="card-title">{title}</h3>
          </div>

          {/* GRAPH SECTION */}
          <div className="graph-container">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart data={chartData}>
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--stroke)', strokeWidth: 1 }} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--fg)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "var(--bg)", stroke: "var(--fg)", strokeWidth: 2 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-elevated)', opacity: 0.5 }} />
                  <Bar
                    dataKey="value"
                    fill="var(--fg)"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* FOOTER */}
          <div className="card-footer">
            {recommendation && (
              <div className="recommendation">
                <span className="rec-icon">💡</span>
                <p>{recommendation}</p>
              </div>
            )}

            <div className="footer-bottom">
              <div className="tags-list">
                {tags && tags.length > 0 && tags.slice(0, 2).map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
              <div className="view-details">
                View Details <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </Link>

      <style jsx>{`
        .insight-card-wrapper {
          height: 100%;
        }
        
        .insight-card-link {
          text-decoration: none;
          color: inherit;
          display: block;
          height: 100%;
        }

        .insight-card {
          background: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 12px;
          padding: 1.5rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: all 0.2s ease-out;
          position: relative;
          overflow: hidden;
        }

        .insight-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.08); /* Minimal shadow */
          border-color: var(--fg);
        }

        /* HEADER */
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-badge {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          background: var(--bg-surface);
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid var(--stroke);
        }

        .timestamp {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* MAIN */
        .card-main {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .metric-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 0.5rem;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 600;
          color: var(--fg);
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .trend-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .card-title {
          font-size: 1rem;
          font-weight: 500;
          color: var(--fg);
          margin: 0;
          line-height: 1.4;
        }

        /* GRAPH */
        .graph-container {
          height: 100px; /* Compact graph */
          width: 100%;
          margin: 0.5rem 0;
        }

        /* FOOTER */
        .card-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--stroke);
        }

        .recommendation {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          font-size: 0.8125rem;
          color: var(--fg);
          opacity: 0.8;
          line-height: 1.5;
        }
        
        .recommendation p {
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tags-list {
          display: flex;
          gap: 6px;
        }

        .tag {
          font-size: 0.6875rem;
          color: var(--text-muted);
          background: var(--bg-surface);
          padding: 2px 8px;
          border-radius: 12px;
          border: 1px solid transparent;
        }

        .view-details {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--fg);
          display: flex;
          align-items: center;
          gap: 4px;
          opacity: 0;
          transform: translateX(-5px);
          transition: all 0.2s ease;
        }

        .insight-card:hover .view-details {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>
    </motion.div>
  );
}
