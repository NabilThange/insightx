"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Download } from "lucide-react";
import ReportCard from "@/components/data/ReportCard";
import ReportFilterBar from "@/components/interactive/ReportFilterBar";

interface Report {
  id: string;
  title: string;
  date: string;
  metric: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  isPinned?: boolean;
  tags: string[];
}

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{ tag?: string; dateRange?: string }>({});

  // Mock reports data
  const allReports: Report[] = [
    {
      id: "1",
      title: "Transaction Failure Analysis",
      date: "Today, 9:45 PM",
      metric: "23%",
      trend: "down",
      trendValue: "-5%",
      isPinned: true,
      tags: ["Failures", "Network"],
    },
    {
      id: "2",
      title: "Peak Hour Transaction Volume",
      date: "Yesterday",
      metric: "250K",
      trend: "up",
      trendValue: "+15%",
      isPinned: true,
      tags: ["Transactions", "Peak Hours"],
    },
    {
      id: "3",
      title: "Payment Method Distribution",
      date: "2 days ago",
      metric: "3 methods",
      trend: "neutral",
      tags: ["Transactions"],
    },
    {
      id: "4",
      title: "4G Network Timeout Rate",
      date: "3 days ago",
      metric: "23%",
      trend: "up",
      trendValue: "+8%",
      tags: ["Network", "Failures"],
    },
    {
      id: "5",
      title: "Weekend vs Weekday Trends",
      date: "1 week ago",
      metric: "+15%",
      trend: "up",
      trendValue: "+15%",
      tags: ["Trends"],
    },
    {
      id: "6",
      title: "Average Transaction Amount",
      date: "1 week ago",
      metric: "₹1,245",
      trend: "up",
      trendValue: "+3%",
      tags: ["Transactions"],
    },
  ];

  // Filter reports
  const filteredReports = allReports.filter((report) => {
    // Search filter
    if (searchQuery && !report.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Tag filter
    if (filters.tag && !report.tags.includes(filters.tag)) {
      return false;
    }

    // Date range filter (simplified)
    if (filters.dateRange === "Today" && !report.date.includes("Today")) {
      return false;
    }

    return true;
  });

  // Separate pinned and unpinned
  const pinnedReports = filteredReports.filter((r) => r.isPinned);
  const unpinnedReports = filteredReports.filter((r) => !r.isPinned);

  return (
    <div className="reports-page">
      {/* Navigation */}
      <nav className="reports-nav">
        <div className="logo-name">
          <a href="/">InsightX</a>
        </div>
        <div className="nav-items">
          <a href="/workspace">Workspace</a>
          <a href="/reports" className="active">
            Reports
          </a>
          <a href="/connect">Settings</a>
        </div>
        <div className="divider" />
      </nav>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="divider" />
      </div>

      {/* Main Content */}
      <div className="reports-content">
        {/* Header */}
        <div className="reports-header">
          <div>
            <h1>Reports & Insights</h1>
            <p className="subtitle">
              Saved analyses and pinned insights from your workspace
            </p>
          </div>
          <div className="header-actions">
            <button className="action-btn secondary">
              <Download size={18} />
              <span>Export All</span>
            </button>
            <button className="action-btn primary" onClick={() => window.location.href = "/workspace"}>
              <Plus size={18} />
              <span>New Analysis</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <ReportFilterBar
          onSearchChange={setSearchQuery}
          onFilterChange={setFilters}
        />

        {/* Reports Grid */}
        <div className="reports-container">
          {/* Pinned Section */}
          {pinnedReports.length > 0 && (
            <div className="reports-section">
              <h2 className="section-title">Pinned</h2>
              <div className="reports-grid">
                {pinnedReports.map((report, index) => (
                  <ReportCard key={report.id} {...report} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* All Reports Section */}
          {unpinnedReports.length > 0 && (
            <div className="reports-section">
              <h2 className="section-title">
                {pinnedReports.length > 0 ? "All Reports" : "Reports"}
              </h2>
              <div className="reports-grid">
                {unpinnedReports.map((report, index) => (
                  <ReportCard
                    key={report.id}
                    {...report}
                    index={index + pinnedReports.length}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredReports.length === 0 && (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3>No reports found</h3>
              <p>Try adjusting your filters or create a new analysis</p>
            </motion.div>
          )}
        </div>
      </div>

      <style jsx>{`
        .reports-page {
          position: relative;
          width: 100vw;
          min-height: 100vh;
          background-color: var(--bg);
          color: var(--fg);
        }

        .reports-nav {
          position: relative;
          width: 100vw;
          height: 5rem;
          padding: 1.5rem 1.5rem 1.5rem 7.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--bg);
        }

        .logo-name a {
          font-size: 1.5rem;
          color: var(--fg);
          text-decoration: none;
          font-weight: 600;
        }

        .nav-items {
          display: flex;
          gap: 2rem;
        }

        .nav-items a {
          color: rgba(31, 31, 31, 0.7);
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          transition: color var(--transition-fast) ease;
        }

        .nav-items a:hover,
        .nav-items a.active {
          color: var(--fg);
        }

        .reports-nav .divider {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 1px;
          background-color: var(--stroke);
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 5rem;
          height: 100vh;
          z-index: 10;
        }

        .sidebar .divider {
          position: absolute;
          right: 0;
          top: 0;
          width: 1px;
          height: 100vh;
          background-color: var(--stroke);
        }

        .reports-content {
          padding: 0 0 3rem 5rem;
          min-height: calc(100vh - 5rem);
        }

        .reports-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 3rem 3rem 2rem 3rem;
        }

        .reports-header h1 {
          font-size: 2.5rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: var(--fg);
        }

        .subtitle {
          font-size: 1rem;
          color: rgba(31, 31, 31, 0.7);
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 0.375rem;
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast) ease;
          border: none;
        }

        .action-btn.secondary {
          background-color: var(--bg);
          border: 1px solid var(--stroke);
          color: var(--fg);
        }

        .action-btn.secondary:hover {
          border-color: var(--fg);
          background-color: var(--loader-bg);
        }

        .action-btn.primary {
          background-color: var(--fg);
          color: var(--bg);
        }

        .action-btn.primary:hover {
          transform: scale(1.02);
        }

        .reports-container {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .reports-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(31, 31, 31, 0.7);
          margin: 0;
          padding: 0 3rem;
        }

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          padding: 0 3rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--fg);
          margin: 0 0 0.5rem 0;
        }

        .empty-state p {
          font-size: 1rem;
          color: rgba(31, 31, 31, 0.7);
          margin: 0;
        }

        @media (max-width: 1000px) {
          .reports-content {
            padding-left: 5rem;
          }

          .reports-header {
            flex-direction: column;
            gap: 1.5rem;
            padding: 2rem 1.5rem;
          }

          .reports-header h1 {
            font-size: 2rem;
          }

          .header-actions {
            width: 100%;
          }

          .action-btn {
            flex: 1;
            justify-content: center;
          }

          .reports-grid {
            grid-template-columns: 1fr;
            padding: 0 1.5rem;
          }

          .section-title {
            padding: 0 1.5rem;
          }

          .nav-items {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
