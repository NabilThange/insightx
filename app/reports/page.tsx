"use client";

import { useState } from "react";
import GlobalHeader from "@/components/layout/GlobalHeader";
import ReportsHero from "@/components/layout/ReportsHero";
import ReportsFilterBar from "@/components/interactive/ReportsFilterBar";
import InsightCard from "@/components/data/InsightCard";
import { ArrowDown } from "lucide-react";

// Mock Data Types
interface ReportData {
  id: string;
  title: string;
  category: string;
  timestamp: string;
  metric: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  chartType: "line" | "bar";
  chartData: any[]; // Using any[] for simplicity with Recharts data prop
  recommendation?: string;
  tags: string[];
  isPinned?: boolean;
}

// Chart Data Generators
const generateTrendData = (length: number) => {
  return Array.from({ length }, (_, i) => {
    let base = 50;
    const random = Math.random() * 20 - 10;
    base += i * 2; // Slight upward trend
    return { name: `Day ${i + 1}`, value: Math.max(0, Math.round(base + random)) };
  });
};

const generateSpikeData = (length: number) => {
  return Array.from({ length }, (_, i) => {
    const isSpike = i === Math.floor(length / 2);
    return { name: `Day ${i + 1}`, value: isSpike ? Math.round(Math.random() * 100 + 150) : Math.round(Math.random() * 50 + 20) };
  });
};

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  // simple filter state placeholder
  const [filters, setFilters] = useState({});

  // Mock Reports Data
  const pinnedReports: ReportData[] = [
    {
      id: "1",
      title: "Transaction Failure Rate Spike",
      category: "Critical Alert",
      timestamp: "Today, 9:45 PM",
      metric: "2.3%",
      trend: "down",
      trendValue: "+15%",
      chartType: "bar",
      chartData: generateSpikeData(14),
      recommendation: "Investigate gateway timeouts in region US-East-1 immediately.",
      tags: ["Failures", "Network", "Urgent"],
      isPinned: true
    },
    {
      id: "2",
      title: "User Acquisition Velocity",
      category: "Growth",
      timestamp: "Yesterday",
      metric: "1,240",
      trend: "up",
      trendValue: "+8.5%",
      chartType: "line",
      chartData: generateTrendData(14),
      recommendation: "Conversion rates are stabilizing. Consider increasing ad spend.",
      tags: ["Growth", "Acquisition"],
      isPinned: true
    },
    {
      id: "3",
      title: "API Latency Degradation",
      category: "Performance",
      timestamp: "2 days ago",
      metric: "340ms",
      trend: "down",
      trendValue: "+12%",
      chartType: "line",
      chartData: generateTrendData(14),
      recommendation: "Database indexing recommended for users table.",
      tags: ["Performance", "Backend"],
      isPinned: true
    }
  ];

  const allReportsList: ReportData[] = [
    {
      id: "4",
      title: "Churn Rate Analysis",
      category: "Retention",
      timestamp: "3 days ago",
      metric: "0.8%",
      trend: "up",
      trendValue: "-2.1%",
      chartType: "line",
      chartData: generateTrendData(14),
      tags: ["Churn", "Retention"],
      isPinned: false
    },
    {
      id: "5",
      title: "Payment Method Distribution",
      category: "Transactions",
      timestamp: "1 week ago",
      metric: "4 Types",
      trend: "neutral",
      trendValue: "0%",
      chartType: "bar",
      chartData: generateSpikeData(7),
      tags: ["Payments", "Finance"],
      isPinned: false
    },
    {
      id: "6",
      title: "Server Load Distribution",
      category: "Infrastructure",
      timestamp: "1 week ago",
      metric: "45%",
      trend: "up",
      trendValue: "+5%",
      chartType: "line",
      chartData: generateTrendData(14),
      tags: ["Server", "DevOps"],
      isPinned: false
    }
  ];

  return (
    <div className="reports-page-wrapper">
      {/* Global Header handled inside page layout now */}
      <GlobalHeader />

      <main className="reports-content">
        <ReportsHero />
        <ReportsFilterBar onSearch={setSearchQuery} onFilterChange={setFilters} />

        {/* PINNED SECTION */}
        <section className="reports-section">
          <h3 className="section-title">Pinned Critical Insights</h3>
          <div className="insight-grid">
            {pinnedReports.map((report, index) => (
              <InsightCard
                key={report.id}
                id={report.id}
                title={report.title}
                category={report.category}
                timestamp={report.timestamp}
                metric={report.metric}
                trend={report.trend}
                trendValue={report.trendValue}
                chartType={report.chartType}
                chartData={report.chartData}
                recommendation={report.recommendation}
                tags={report.tags}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* ALL REPORTS SECTION */}
        <section className="reports-section">
          <h3 className="section-title">All Reports</h3>
          <div className="insight-grid">
            {allReportsList.map((report, index) => (
              <InsightCard
                key={report.id}
                id={report.id}
                title={report.title}
                category={report.category}
                timestamp={report.timestamp}
                metric={report.metric}
                trend={report.trend}
                trendValue={report.trendValue}
                chartType={report.chartType}
                chartData={report.chartData}
                recommendation={report.recommendation}
                tags={report.tags}
                index={index}
              />
            ))}
          </div>
        </section>

        <div className="load-more-container">
          <button className="load-more-btn">
            Load More Reports <ArrowDown size={14} />
          </button>
        </div>
      </main>

      <style jsx>{`
        .reports-page-wrapper {
          min-height: 100vh;
          background-color: var(--bg);
          display: flex;
          flex-direction: column;
        }

        .reports-content {
          max-width: 1280px; /* Standardized max-width */
          margin: 0 auto;
          width: 100%;
          padding: 2rem 2rem 4rem; /* Consistent padding */
          flex: 1;
        }

        .reports-section {
          margin-bottom: 2.5rem; /* Tighter section spacing */
        }

        .section-title {
          font-size: 0.8125rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          padding-left: 0.25rem;
        }

        .insight-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .insight-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1100px) {
          .insight-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .load-more-container {
          display: flex;
          justify-content: center;
          padding: 2rem 0 4rem;
        }

        .load-more-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--bg-surface);
          border: 1px solid var(--stroke);
          border-radius: 2rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--fg);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .load-more-btn:hover {
          background: var(--bg-elevated);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
