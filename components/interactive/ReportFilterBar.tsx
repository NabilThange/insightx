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
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .search-container {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(31, 31, 31, 0.4);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.625rem 1rem 0.625rem 2.5rem;
          font-size: 0.9375rem;
          background-color: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 0.5rem;
          color: var(--fg);
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
        }

        .search-input::placeholder {
          color: rgba(31, 31, 31, 0.4);
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background-color: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--fg);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-toggle:hover {
          background-color: rgba(0,0,0,0.02);
        }

        .filter-toggle.active {
          background-color: rgba(0,0,0,0.05);
          border-color: var(--fg);
        }

        .filter-options {
          overflow: hidden;
        }

        .filter-group {
          padding: 1rem;
          background-color: var(--bg-surface, #f9f9f9); /* Subtle background for filter area */
          border: 1px solid var(--stroke-subtle);
          border-radius: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .group-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(31, 31, 31, 0.5);
          margin-bottom: 0.5rem;
          display: block;
        }

        .options-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-chip {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
          background-color: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 999px; /* Pill shape */
          color: rgba(31, 31, 31, 0.7);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-chip:hover {
          border-color: var(--fg);
          color: var(--fg);
        }

        .filter-chip.active {
          background-color: var(--fg);
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
