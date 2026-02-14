"use client";

import { motion } from "framer-motion";
import { Database } from "lucide-react";

interface DatasetBadgeProps {
  filename: string;
  rowCount: number;
}

export default function DatasetBadge({ filename, rowCount }: DatasetBadgeProps) {
  return (
    <motion.div
      className="dataset-badge"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Database size={16} />
      <span className="filename">{filename}</span>
      <span className="divider">·</span>
      <span className="row-count">{rowCount.toLocaleString()} rows</span>

      <style jsx>{`
        .dataset-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: var(--loader-bg);
          border: 1px solid var(--stroke);
          border-radius: 9999px;
          color: rgba(31, 31, 31, 0.7);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .dataset-badge :global(svg) {
          color: var(--success);
        }

        .filename {
          color: var(--fg);
          font-family: "Geist Mono", "JetBrains Mono", monospace;
        }

        .divider {
          color: var(--stroke);
        }

        .row-count {
          color: rgba(31, 31, 31, 0.7);
        }

        @media (max-width: 1000px) {
          .dataset-badge {
            font-size: 0.75rem;
            padding: 0.375rem 0.75rem;
          }

          .dataset-badge :global(svg) {
            width: 14px;
            height: 14px;
          }
        }
      `}</style>
    </motion.div>
  );
}
