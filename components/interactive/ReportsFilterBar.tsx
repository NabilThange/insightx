"use client";

import { motion } from "framer-motion";
import { Search, ChevronDown, X, Filter } from "lucide-react";
import { useState } from "react";

interface ReportsFilterBarProps {
    onSearch: (query: string) => void;
    onFilterChange: (filters: any) => void;
}

export default function ReportsFilterBar({ onSearch, onFilterChange }: ReportsFilterBarProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeRisk, setActiveRisk] = useState<string | null>(null);

    // Mock data for dropdowns (simple implementation for now)
    const categories = ["Transactions", "Network", "Security", "User Behavior"];
    const risks = ["High", "Medium", "Low"];

    return (
        <motion.div
            className="filter-bar-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
        >
            {/* SEARCH INPUT */}
            <div className="search-wrapper">
                <Search size={16} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search by report name, tag or metric..."
                    className="search-input"
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>

            {/* FILTERS GROUP */}
            <div className="filters-group">
                <div className="filter-dropdown">
                    <span>Category</span>
                    <ChevronDown size={14} className="chevron" />
                </div>

                <div className="filter-dropdown">
                    <span>Risk Level</span>
                    <ChevronDown size={14} className="chevron" />
                </div>

                <div className="filter-dropdown">
                    <span>Date Range</span>
                    <ChevronDown size={14} className="chevron" />
                </div>

                <button className="clear-btn">
                    <span>Clear All</span>
                    <X size={14} />
                </button>
            </div>

            <style jsx>{`
        .filter-bar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
          padding: 0.5rem;
          background: var(--bg-surface);
          border: 1px solid var(--stroke);
          border-radius: 0.75rem; /* Matches card radius */
        }

        .search-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 1rem;
          background: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 0.5rem;
          max-width: 480px;
          transition: border-color 0.2s ease;
        }

        .search-wrapper:focus-within {
          border-color: var(--fg);
        }

        .search-icon {
          color: var(--text-muted);
        }

        .search-input {
          border: none;
          background: transparent;
          width: 100%;
          font-size: 0.875rem;
          color: var(--fg);
          outline: none;
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .filters-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .filter-dropdown {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--fg);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-dropdown:hover {
          background: var(--bg-elevated);
          border-color: var(--text-muted);
        }

        .chevron {
          color: var(--text-muted);
        }

        .clear-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: transparent;
          border: none;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .clear-btn:hover {
          color: var(--fg);
        }

        @media (max-width: 1024px) {
          .filter-bar-container {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .search-wrapper {
            max-width: 100%;
          }

          .filters-group {
            overflow-x: auto;
            padding-bottom: 4px; /* Space for scrollbar if needed */
          }
        }
      `}</style>
        </motion.div>
    );
}
