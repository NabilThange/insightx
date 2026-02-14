"use client";

import { motion } from "framer-motion";

interface ColumnCardProps {
    name: string;
    type: "numeric" | "categorical" | "datetime" | "text";
    nullPercentage: number;
    sampleValues: string[];
    index: number;
}

const typeColors = {
    numeric: "var(--accent-green)",
    categorical: "var(--accent-blue)",
    datetime: "var(--accent-amber)",
    text: "var(--text-muted)",
};

const typeIcons = {
    numeric: "#",
    categorical: "◆",
    datetime: "⏰",
    text: "Aa",
};

export default function ColumnCard({
    name,
    type,
    nullPercentage,
    sampleValues,
    index,
}: ColumnCardProps) {
    return (
        <motion.div
            className="column-card"
            initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: [0.23, 1, 0.32, 1],
            }}
        >
            <div className="card-header">
                <div className="type-badge" style={{ color: typeColors[type] }}>
                    <span className="type-icon">{typeIcons[type]}</span>
                    <span className="type-label">{type}</span>
                </div>
                {nullPercentage > 0 && (
                    <div className="null-badge">{nullPercentage}% null</div>
                )}
            </div>

            <h4 className="column-name">{name}</h4>

            <div className="sample-values">
                {sampleValues.slice(0, 3).map((value, i) => (
                    <div key={i} className="sample-value">
                        {value}
                    </div>
                ))}
            </div>

            <style jsx>{`
        .column-card {
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 1rem;
          min-width: 180px;
          transition: all var(--transition-fast) ease;
        }

        .column-card:hover {
          border-color: var(--accent-blue);
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .type-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .type-icon {
          font-size: 1rem;
          font-weight: 700;
        }

        .null-badge {
          font-size: 0.625rem;
          padding: 0.125rem 0.375rem;
          background-color: var(--bg-elevated);
          border-radius: 0.25rem;
          color: var(--text-muted);
        }

        .column-name {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
          font-family: "Geist Mono", "JetBrains Mono", monospace;
        }

        .sample-values {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .sample-value {
          font-size: 0.75rem;
          color: var(--text-muted);
          padding: 0.25rem 0.5rem;
          background-color: var(--bg-base);
          border-radius: 0.25rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: "Geist Mono", "JetBrains Mono", monospace;
        }
      `}</style>
        </motion.div>
    );
}
