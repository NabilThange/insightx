"use client";

import { motion } from "framer-motion";
import { Calendar, TrendingUp, Pin, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ReportCardProps {
  id: string;
  title: string;
  date: string;
  metric: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  isPinned?: boolean;
  tags: string[];
  index?: number;
}

export default function ReportCard({
  id,
  title,
  date,
  metric,
  trend,
  trendValue,
  isPinned = false,
  tags,
  index = 0,
}: ReportCardProps) {
  const trendColor =
    trend === "up"
      ? "var(--accent-green)"
      : trend === "down"
        ? "var(--accent-red)"
        : "var(--text-muted)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/reports/${id}`} className="report-card-link">
        <div className="report-card">
          {/* Header */}
          <div className="card-header">
            <h3 className="title">{title}</h3>
            {isPinned && (
              <div className="pin-badge">
                <Pin size={14} />
              </div>
            )}
          </div>

          {/* Metric */}
          <div className="metric-section">
            <div className="metric">{metric}</div>
            {trend && trendValue && (
              <div className="trend" style={{ color: trendColor }}>
                <TrendingUp size={16} />
                <span>{trendValue}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="tags">
            {tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="card-footer">
            <div className="date">
              <Calendar size={14} />
              <span>{date}</span>
            </div>
            <ExternalLink size={14} className="link-icon" />
          </div>
        </div>
      </Link>

      <style jsx>{`
        :global(.report-card-link) {
          text-decoration: none;
          display: block;
        }

        .report-card {
          background-color: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 0.75rem; /* Standard refined radius */
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          cursor: pointer;
          position: relative;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1); /* Apple-like easing */
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .report-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          border-color: var(--stroke-strong, rgba(0,0,0,0.15));
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .header-content {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .report-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--fg);
          margin: 0;
          line-height: 1.4;
        }

        .report-date {
          font-size: 0.75rem;
          color: rgba(31, 31, 31, 0.5); /* Subtle metadata */
        }

        /* Metric Emphasis */
        .metric-section {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--stroke-subtle, rgba(0,0,0,0.05));
        }

        .metric {
          font-size: 2rem; /* Dominant metric */
          font-weight: 500;
          color: var(--fg);
          letter-spacing: -0.03em;
          line-height: 1;
        }

        .trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          background-color: rgba(0,0,0,0.03); /* Very subtle background */
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        }

        .tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .tag {
          padding: 0.25rem 0.75rem;
          background-color: var(--loader-bg);
          border: 1px solid var(--stroke);
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(31, 31, 31, 0.7);
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid var(--stroke);
        }

        .date {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          color: rgba(31, 31, 31, 0.7);
        }

        :global(.link-icon) {
          color: rgba(31, 31, 31, 0.7);
          transition: color var(--transition-fast) ease;
        }

        .report-card:hover :global(.link-icon) {
          color: var(--fg);
        }
      `}</style>
    </motion.div>
  );
}
