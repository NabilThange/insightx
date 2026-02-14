"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface InsightCardProps {
    title: string;
    metric: string;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    index?: number;
}

export default function InsightCard({
    title,
    metric,
    trend,
    trendValue,
    index = 0,
}: InsightCardProps) {
    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
    const trendColor =
        trend === "up"
            ? "var(--accent-green)"
            : trend === "down"
                ? "var(--accent-red)"
                : "var(--text-muted)";

    return (
        <motion.div
            className="insight-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
        >
            <h4 className="title">{title}</h4>
            <div className="metric">{metric}</div>
            {trend && trendValue && (
                <div className="trend" style={{ color: trendColor }}>
                    <TrendIcon size={16} />
                    <span>{trendValue}</span>
                </div>
            )}

            <style jsx>{`
        .insight-card {
          padding: 1rem;
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          min-width: 200px;
        }

        .title {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin: 0 0 0.5rem 0;
        }

        .metric {
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--text-primary);
          font-family: "Geist Mono", "JetBrains Mono", monospace;
          margin-bottom: 0.5rem;
        }

        .trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
      `}</style>
        </motion.div>
    );
}
