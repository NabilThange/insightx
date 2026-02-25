"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface SuggestedQueryChipsProps {
  queries: string[];
  onQueryClick: (query: string) => void;
}

export default function SuggestedQueryChips({
  queries,
  onQueryClick,
}: SuggestedQueryChipsProps) {
  return (
    <div className="suggested-queries">
      {queries.map((query, index) => (
        <motion.button
          key={query}
          className="query-chip"
          onClick={() => onQueryClick(query)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles size={14} />
          <span>{query}</span>
        </motion.button>
      ))}

      <style jsx>{`
        .suggested-queries {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          align-items: stretch;
          width: 100%;
          max-width: 800px;
        }

        .query-chip {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 12px;
          height: 44px;
          padding: 0 16px;
          background-color: var(--loader-bg);
          border: 1px solid var(--stroke);
          border-radius: 10px;
          color: var(--fg);
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s, border-color 0.2s;
          text-align: left;
          outline: none;
        }

        .query-chip:focus-visible {
          box-shadow: 0 0 0 3px rgba(31,31,31,0.5);
        }

        .query-chip:hover {
          border-color: var(--fg);
          background-color: var(--bg);
        }

        .query-chip :global(svg) {
          color: var(--warning);
          flex-shrink: 0;
        }

        @media (max-width: 1000px) {
          .suggested-queries {
            max-width: 100%;
          }

          .query-chip {
            font-size: 14px;
            padding: 0 16px;
          }
        }
      `}</style>
    </div>
  );
}
