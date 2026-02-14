"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface ReportFilterBarProps {
  onSearchChange: (query: string) => void;
  onFilterChange: (filters: { tag?: string; dateRange?: string }) => void;
}

export default function ReportFilterBar({
  onSearchChange,
  onFilterChange,
}: ReportFilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [selectedDateRange, setSelectedDateRange] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const tags = ["Transactions", "Failures", "Network", "Peak Hours", "Trends"];
  const dateRanges = ["Today", "This Week", "This Month", "All Time"];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  const handleTagSelect = (tag: string) => {
    const newTag = selectedTag === tag ? undefined : tag;
    setSelectedTag(newTag);
    onFilterChange({ tag: newTag, dateRange: selectedDateRange });
  };

  const handleDateRangeSelect = (range: string) => {
    const newRange = selectedDateRange === range ? undefined : range;
    setSelectedDateRange(newRange);
    onFilterChange({ tag: selectedTag, dateRange: newRange });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTag(undefined);
    setSelectedDateRange(undefined);
    onSearchChange("");
    onFilterChange({});
  };

  const hasActiveFilters = searchQuery || selectedTag || selectedDateRange;

  return (
    <div className="filter-bar">
      {/* Search and Filter Toggle */}
      <div className="search-row">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        <button
          className={`filter-toggle ${showFilters ? "active" : ""}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={18} />
          <span>Filters</span>
        </button>
        {hasActiveFilters && (
          <button className="clear-btn" onClick={handleClearFilters}>
            <X size={18} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="filter-options">
          {/* Tags */}
          <div className="filter-section">
            <h4>Tags</h4>
            <div className="filter-chips">
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`filter-chip ${selectedTag === tag ? "active" : ""}`}
                  onClick={() => handleTagSelect(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="filter-section">
            <h4>Date Range</h4>
            <div className="filter-chips">
              {dateRanges.map((range) => (
                <button
                  key={range}
                  className={`filter-chip ${selectedDateRange === range ? "active" : ""}`}
                  onClick={() => handleDateRangeSelect(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .filter-bar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem;
          background-color: var(--bg);
          border-bottom: 1px solid var(--stroke);
        }

        .search-row {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .search-input-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background-color: transparent;
          border: 1px solid var(--stroke);
          border-radius: 0.375rem;
          transition: border-color var(--transition-fast) ease;
        }

        .search-input-wrapper:focus-within {
          border-color: var(--accent);
        }

        .search-input-wrapper :global(svg) {
          color: rgba(31, 31, 31, 0.7);
        }

        .search-input {
          flex: 1;
          background: none;
          border: none;
          color: var(--fg);
          font-family: inherit;
          font-size: 0.875rem;
          outline: none;
        }

        .search-input::placeholder {
          color: rgba(31, 31, 31, 0.5);
        }

        .filter-toggle,
        .clear-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background-color: transparent;
          border: 1px solid var(--stroke);
          border-radius: 0.375rem;
          color: rgba(31, 31, 31, 0.7);
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast) ease;
          white-space: nowrap;
        }

        .filter-toggle:hover,
        .clear-btn:hover {
          border-color: var(--fg);
          color: var(--fg);
        }

        .filter-toggle.active {
          background-color: var(--fg);
          border-color: var(--fg);
          color: var(--bg);
        }

        .filter-options {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding-top: 1rem;
        }

        .filter-section h4 {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(31, 31, 31, 0.7);
          margin: 0 0 0.75rem 0;
        }

        .filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-chip {
          padding: 0.5rem 1rem;
          background-color: var(--loader-bg);
          border: 1px solid var(--stroke);
          border-radius: 9999px;
          color: rgba(31, 31, 31, 0.7);
          font-family: inherit;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast) ease;
        }

        .filter-chip:hover {
          border-color: var(--fg);
          color: var(--fg);
        }

        .filter-chip.active {
          background-color: var(--fg);
          border-color: var(--fg);
          color: var(--bg);
        }

        @media (max-width: 1000px) {
          .search-row {
            flex-wrap: wrap;
          }

          .search-input-wrapper {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
