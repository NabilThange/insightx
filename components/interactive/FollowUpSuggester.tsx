"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface FollowUpSuggesterProps {
    suggestions: string[];
    onSuggestionClick: (suggestion: string) => void;
}

export default function FollowUpSuggester({
    suggestions,
    onSuggestionClick,
}: FollowUpSuggesterProps) {
    if (suggestions.length === 0) return null;

    return (
        <div className="follow-up-suggester">
            <p className="label">Suggested follow-ups:</p>
            <div className="suggestions">
                {suggestions.map((suggestion, index) => (
                    <motion.button
                        key={suggestion}
                        className="suggestion-chip"
                        onClick={() => onSuggestionClick(suggestion)}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Sparkles size={12} />
                        <span>{suggestion}</span>
                    </motion.button>
                ))}
            </div>

            <style jsx>{`
        .follow-up-suggester {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
        }

        .suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .suggestion-chip {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 9999px;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast) ease;
        }

        .suggestion-chip:hover {
          border-color: var(--accent-blue);
          background-color: var(--bg-elevated);
        }

        .suggestion-chip :global(svg) {
          color: var(--accent-amber);
        }
      `}</style>
        </div>
    );
}
