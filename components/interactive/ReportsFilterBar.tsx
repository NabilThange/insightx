"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, X, SlidersHorizontal, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ReportsFilterBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: any) => void;
}

interface DropdownOption {
  label: string;
  value: string;
}

const CATEGORY_OPTIONS: DropdownOption[] = [
  { label: "Transactions", value: "transactions" },
  { label: "Network", value: "network" },
  { label: "Security", value: "security" },
  { label: "User Behavior", value: "user_behavior" },
  { label: "Infrastructure", value: "infrastructure" },
];

const RISK_OPTIONS: DropdownOption[] = [
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const DATE_OPTIONS: DropdownOption[] = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "All time", value: "all" },
];

function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: DropdownOption[];
  value: string | null;
  onChange: (val: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="rfb-dropdown" ref={ref}>
      <button
        className={`rfb-dropdown-btn ${open || value ? "rfb-dropdown-btn-active" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{selected ? selected.label : label}</span>
        <ChevronDown
          size={13}
          className={`rfb-chevron ${open ? "rfb-chevron-open" : ""}`}
        />
        {value && (
          <span
            className="rfb-active-dot"
            title="Filter active"
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="rfb-dropdown-menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {value && (
              <button
                className="rfb-dropdown-option rfb-clear-option"
                onClick={() => { onChange(null); setOpen(false); }}
              >
                <X size={12} />
                Clear
              </button>
            )}
            {options.map((opt) => (
              <button
                key={opt.value}
                className={`rfb-dropdown-option ${value === opt.value ? "rfb-option-selected" : ""}`}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                <span className="rfb-option-label">{opt.label}</span>
                {value === opt.value && <Check size={12} className="rfb-check" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .rfb-dropdown {
          position: relative;
        }

        .rfb-dropdown-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 0.875rem;
          background: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 0.375rem;
          font-size: 0.8125rem;
          font-weight: 500;
          font-family: inherit;
          color: var(--fg);
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          white-space: nowrap;
          position: relative;
        }

        .rfb-dropdown-btn:hover {
          border-color: var(--fg);
          background: var(--bg-elevated);
        }

        .rfb-dropdown-btn-active {
          border-color: var(--fg);
        }

        .rfb-chevron {
          color: var(--text-muted);
          transition: transform 0.2s;
          flex-shrink: 0;
        }

        .rfb-chevron-open {
          transform: rotate(180deg);
        }

        .rfb-active-dot {
          width: 5px;
          height: 5px;
          background: var(--accent, #4f46e5);
          border-radius: 50%;
          flex-shrink: 0;
        }

        :global(.rfb-dropdown-menu) {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          min-width: 160px;
          background: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 0.625rem;
          padding: 0.375rem;
          z-index: 200;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .rfb-dropdown-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.5rem 0.625rem;
          background: transparent;
          border: none;
          border-radius: 0.375rem;
          font-size: 0.8125rem;
          font-family: inherit;
          color: var(--fg);
          cursor: pointer;
          text-align: left;
          transition: background 0.1s;
        }

        .rfb-dropdown-option:hover {
          background: var(--bg-elevated);
        }

        .rfb-option-selected {
          font-weight: 500;
          background: var(--bg-elevated);
        }

        .rfb-option-label {
          flex: 1;
        }

        .rfb-check {
          color: var(--accent-green, #2d5016);
        }

        .rfb-clear-option {
          color: var(--text-muted);
          border-bottom: 1px solid var(--stroke);
          border-radius: 0;
          margin-bottom: 0.25rem;
          padding-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}

export default function ReportsFilterBar({ onSearch, onFilterChange }: ReportsFilterBarProps) {
  const [category, setCategory] = useState<string | null>(null);
  const [risk, setRisk] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");

  const activeFiltersCount = [category, risk, dateRange].filter(Boolean).length;

  const handleClearAll = () => {
    setCategory(null);
    setRisk(null);
    setDateRange(null);
    setSearchValue("");
    onSearch("");
    onFilterChange({});
  };

  const handleCategoryChange = (v: string | null) => {
    setCategory(v);
    onFilterChange({ category: v, risk, dateRange });
  };

  const handleRiskChange = (v: string | null) => {
    setRisk(v);
    onFilterChange({ category, risk: v, dateRange });
  };

  const handleDateChange = (v: string | null) => {
    setDateRange(v);
    onFilterChange({ category, risk, dateRange: v });
  };

  return (
    <motion.div
      className="rfb-container"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* SEARCH */}
      <div className="rfb-search-row">
        <div className="rfb-search-wrap">
          <Search size={14} className="rfb-search-icon" />
          <input
            type="text"
            placeholder="Search by report name, tag or metric…"
            className="rfb-search-input"
            value={searchValue}
            onChange={(e) => { setSearchValue(e.target.value); onSearch(e.target.value); }}
          />
          {searchValue && (
            <button
              className="rfb-search-clear"
              onClick={() => { setSearchValue(""); onSearch(""); }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filters row inline */}
        <div className="rfb-filters">
          <div className="rfb-filters-label">
            <SlidersHorizontal size={12} />
          </div>

          <FilterDropdown
            label="Category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={handleCategoryChange}
          />
          <FilterDropdown
            label="Risk Level"
            options={RISK_OPTIONS}
            value={risk}
            onChange={handleRiskChange}
          />
          <FilterDropdown
            label="Date Range"
            options={DATE_OPTIONS}
            value={dateRange}
            onChange={handleDateChange}
          />

          {activeFiltersCount > 0 && (
            <button className="rfb-clear-all" onClick={handleClearAll}>
              <X size={12} />
              Clear{activeFiltersCount > 1 ? ` (${activeFiltersCount})` : ""}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .rfb-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .rfb-search-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        /* Search */
        .rfb-search-wrap {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.5625rem 1rem;
          background: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 0.375rem;
          flex: 1;
          min-width: 220px;
          transition: border-color 0.15s;
        }

        .rfb-search-wrap:focus-within {
          border-color: var(--fg);
        }

        .rfb-search-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .rfb-search-input {
          border: none;
          background: transparent;
          width: 100%;
          font-size: 0.875rem;
          font-family: inherit;
          color: var(--fg);
          outline: none;
        }

        .rfb-search-input::placeholder {
          color: var(--text-muted);
        }

        .rfb-search-clear {
          display: flex;
          color: var(--text-muted);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
          transition: color 0.15s;
        }

        .rfb-search-clear:hover {
          color: var(--fg);
        }

        /* Filters */
        .rfb-filters {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .rfb-filters-label {
          display: flex;
          align-items: center;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .rfb-clear-all {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.5rem 0.75rem;
          background: transparent;
          border: 1px solid var(--stroke);
          border-radius: 0.375rem;
          font-size: 0.8125rem;
          font-weight: 500;
          font-family: inherit;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
        }

        .rfb-clear-all:hover {
          color: var(--error, #b91c1c);
          border-color: var(--error, #b91c1c);
        }

        @media (max-width: 900px) {
          .rfb-search-row {
            flex-direction: column;
            align-items: stretch;
          }
          .rfb-search-wrap {
            min-width: unset;
          }
          .rfb-filters {
            overflow-x: auto;
            padding-bottom: 2px;
          }
        }
      `}</style>
    </motion.div>
  );
}
