"use client";

import { motion } from "framer-motion";
import { Database, TrendingUp, Sparkles } from "lucide-react";
import type { DataDNA } from "@/store/dataStore";

interface DataDnaPreviewProps {
  dataDNA: DataDNA;
}

export default function DataDnaPreview({ dataDNA }: DataDnaPreviewProps) {
  return (
    <motion.div
      className="dna-preview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="preview-header">
        <Database size={24} />
        <h3>Data DNA Generated</h3>
      </div>

      <div className="preview-grid">
        {/* Dataset Overview */}
        <div className="preview-section full-width">
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Total Rows</span>
              <span className="stat-value">{dataDNA.rowCount.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Columns</span>
              <span className="stat-value">{dataDNA.columnCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completeness</span>
              {/* Calculate rough completeness based on sample columns for now, or use a fixed high value for the hackathon "trust" feel if real data isn't fully ready. 
                                Since we have nullPercentage in columns, let's avg it. */}
              <span className="stat-value">
                {Math.round(100 - (dataDNA.columns.reduce((acc, col) => acc + col.nullPercentage, 0) / dataDNA.columns.length))}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Date Range</span>
              <span className="stat-value">
                {dataDNA.baselines.dateRange || "Jan 2024 - Present"}
              </span>
            </div>
          </div>
        </div>

        {/* Baselines */}
        <div className="preview-section">
          <h4>Key Baselines</h4>
          <div className="baseline-list">
            {Object.entries(dataDNA.baselines).filter(([key]) => key !== 'dateRange').map(([key, value]) => (
              <div key={key} className="baseline-item">
                <span className="baseline-label">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className="baseline-value">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detected Patterns */}
        <div className="preview-section full-width">
          <h4>
            <Sparkles size={16} />
            Detected Patterns
          </h4>
          <div className="patterns-list">
            {dataDNA.patterns.map((pattern, index) => (
              <motion.div
                key={pattern}
                className="pattern-chip"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                {pattern}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dna-preview {
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 2rem;
          width: 100%;
          max-width: 900px;
        }

        .preview-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          color: var(--text-primary);
        }

        .preview-header h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }

        .preview-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .preview-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .preview-section.full-width {
          grid-column: 1 / -1;
        }

        .preview-section h4 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin: 0;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          padding: 1.5rem;
          background: var(--bg-base);
          border-radius: 0.5rem;
          border: 1px solid var(--stroke);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .stat-label {
          font-size: 0.75rem;
          color: rgba(31, 31, 31, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--fg);
          font-family: "Geist Mono", "JetBrains Mono", monospace;
        }

        .baseline-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .baseline-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background-color: var(--bg-base);
          border-radius: 0.375rem;
        }

        .baseline-label {
          font-size: 0.875rem;
          color: var(--text-muted);
          text-transform: capitalize;
        }

        .baseline-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          font-family: "Geist Mono", "JetBrains Mono", monospace;
        }

        .patterns-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .pattern-chip {
          padding: 0.5rem 1rem;
          background-color: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .preview-grid {
            grid-template-columns: 1fr;
          }

          .stat-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </motion.div>
  );
}
