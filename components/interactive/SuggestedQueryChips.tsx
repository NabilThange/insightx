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
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
          max-width: 800px;
        }

        .query-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background-color: var(--loader-bg);
          border: 1px solid var(--stroke);
          border-radius: 9999px;
          color: var(--fg);
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast) ease;
        }

        .query-chip:hover {
          border-color: var(--fg);
          background-color: var(--bg);
        }

        .query-chip :global(svg) {
          color: var(--warning);
        }

        @media (max-width: 1000px) {
          .suggested-queries {
            max-width: 100%;
          }

          .query-chip {
            font-size: 0.8125rem;
            padding: 0.625rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}
