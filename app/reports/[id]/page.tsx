"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Pin, Download, Share2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import CodeBlock from "@/components/data/CodeBlock";
import InsightCard from "@/components/data/InsightCard";
import AgentBadge from "@/components/chat/AgentBadge";

export default function ReportDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const reportId = params.id;
    const [isPinned, setIsPinned] = useState(true);

    // Mock report data
    const report = {
        id: reportId,
        title: "Transaction Failure Analysis",
        date: "Today, 9:45 PM",
        tags: ["Failures", "Network"],
        query: "Why are failures high during peak hours?",
        agentType: "orchestrator" as const,
        thinking: [
            "Analyzing user query...",
            "Routing to SQL Agent...",
            "Executing query...",
            "Processing results...",
        ],
        content:
            "Based on the analysis, transaction failures are significantly higher during peak hours (8-9 PM) due to network timeouts. 4G connections show a 23% higher timeout rate compared to 5G and WiFi.",
        code: {
            sql: `SELECT 
  HOUR(timestamp) as hour,
  network_type,
  COUNT(*) as total_transactions,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failures,
  ROUND(100.0 * SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) / COUNT(*), 2) as failure_rate
FROM transactions
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY HOUR(timestamp), network_type
HAVING failure_rate > 10
ORDER BY hour, failure_rate DESC;`,
        },
        insights: [
            {
                title: "Overall Failure Rate",
                metric: "23%",
                trend: "down" as const,
                trendValue: "-5%",
            },
            {
                title: "Peak Hour Impact",
                metric: "8-9 PM",
                trend: "up" as const,
                trendValue: "+35%",
            },
            {
                title: "4G Timeout Rate",
                metric: "23%",
                trend: "up" as const,
                trendValue: "+8%",
            },
        ],
        keyFindings: [
            "Peak hours (8-9 PM) show 35% higher failure rates",
            "4G network has 23% higher timeout rate than 5G/WiFi",
            "Weekend transactions are 15% higher but maintain similar failure rates",
            "UPI payments have the lowest failure rate at 2.1%",
        ],
        recommendations: [
            "Implement retry logic for 4G connections during peak hours",
            "Consider load balancing to distribute peak hour traffic",
            "Monitor network quality metrics in real-time",
            "Optimize timeout thresholds for different network types",
        ],
    };

    const handlePin = () => {
        setIsPinned(!isPinned);
    };

    const handleExport = () => {
        // Mock export functionality
        alert("Report exported successfully!");
    };

    const handleShare = () => {
        // Mock share functionality
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this report?")) {
            router.push("/reports");
        }
    };

    return (
        <div className="report-detail-page">
            {/* Navigation */}
            <nav className="report-nav">
                <div className="nav-left">
                    <button className="back-btn" onClick={() => router.push("/reports")}>
                        <ArrowLeft size={20} />
                        <span>Back to Reports</span>
                    </button>
                </div>
                <div className="nav-right">
                    <button
                        className={`icon-btn ${isPinned ? "active" : ""}`}
                        onClick={handlePin}
                        title={isPinned ? "Unpin" : "Pin"}
                    >
                        <Pin size={18} />
                    </button>
                    <button className="icon-btn" onClick={handleShare} title="Share">
                        <Share2 size={18} />
                    </button>
                    <button className="icon-btn" onClick={handleExport} title="Export">
                        <Download size={18} />
                    </button>
                    <button className="icon-btn danger" onClick={handleDelete} title="Delete">
                        <Trash2 size={18} />
                    </button>
                </div>
                <div className="divider" />
            </nav>

            {/* Sidebar */}
            <div className="sidebar">
                <div className="divider" />
            </div>

            {/* Main Content */}
            <motion.div
                className="report-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="content-wrapper">
                    {/* Header */}
                    <div className="report-header">
                        <div className="tags">
                            {report.tags.map((tag) => (
                                <span key={tag} className="tag">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h1>{report.title}</h1>
                        <div className="meta">
                            <span className="date">{report.date}</span>
                            <span className="divider-dot">·</span>
                            <AgentBadge type={report.agentType} />
                        </div>
                    </div>

                    {/* Original Query */}
                    <div className="section">
                        <h2>Original Query</h2>
                        <div className="query-box">
                            <p>{report.query}</p>
                        </div>
                    </div>

                    {/* Insights */}
                    <div className="section">
                        <h2>Key Metrics</h2>
                        <div className="insights-grid">
                            {report.insights.map((insight, index) => (
                                <InsightCard key={insight.title} {...insight} index={index} id={insight.title} />
                            ))}
                        </div>
                    </div>

                    {/* Analysis */}
                    <div className="section">
                        <h2>Analysis</h2>
                        <p className="analysis-text">{report.content}</p>
                    </div>

                    {/* SQL Query */}
                    {report.code.sql && (
                        <div className="section">
                            <h2>SQL Query</h2>
                            <CodeBlock code={report.code.sql} language="sql" />
                        </div>
                    )}

                    {/* Key Findings */}
                    <div className="section">
                        <h2>Key Findings</h2>
                        <ul className="findings-list">
                            {report.keyFindings.map((finding, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    {finding}
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    {/* Recommendations */}
                    <div className="section">
                        <h2>Recommendations</h2>
                        <ul className="recommendations-list">
                            {report.recommendations.map((rec, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    {rec}
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </div>
            </motion.div>

            <style jsx>{`
        .report-detail-page {
          position: relative;
          width: 100vw;
          min-height: 100vh;
          background-color: var(--bg-base);
          color: var(--text-primary);
        }

        .report-nav {
          position: relative;
          width: 100vw;
          height: 5rem;
          padding: 1.5rem 1.5rem 1.5rem 7.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--bg-surface);
        }

        .nav-left {
          display: flex;
          align-items: center;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: none;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast) ease;
        }

        .back-btn:hover {
          border-color: var(--accent-blue);
          background-color: var(--bg-elevated);
        }

        .nav-right {
          display: flex;
          gap: 0.5rem;
        }

        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          background: none;
          border: 1px solid var(--border);
          border-radius: 0.375rem;
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast) ease;
        }

        .icon-btn:hover {
          border-color: var(--accent-blue);
          color: var(--text-primary);
        }

        .icon-btn.active {
          background-color: var(--accent-purple);
          border-color: var(--accent-purple);
          color: white;
        }

        .icon-btn.danger:hover {
          border-color: var(--accent-red);
          color: var(--accent-red);
        }

        .report-nav .divider {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 1px;
          background-color: var(--border);
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
          background-color: var(--border);
        }

        .report-content {
          padding: 3rem 3rem 3rem 7.5rem;
          min-height: calc(100vh - 5rem);
        }

        .content-wrapper {
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .report-header {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          padding: 0.25rem 0.75rem;
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .report-header h1 {
          font-size: 2.5rem;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .divider-dot {
          color: var(--border);
        }

        .section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          color: var(--text-primary);
        }

        .query-box {
          padding: 1.5rem;
          background-color: var(--bg-surface);
          border-left: 3px solid var(--accent-blue);
          border-radius: 0.5rem;
        }

        .query-box p {
          margin: 0;
          font-size: 1rem;
          line-height: 1.6;
          color: var(--text-primary);
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .analysis-text {
          font-size: 1rem;
          line-height: 1.8;
          color: var(--text-primary);
          margin: 0;
        }

        .findings-list,
        .recommendations-list {
          margin: 0;
          padding-left: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .findings-list li,
        .recommendations-list li {
          font-size: 0.875rem;
          line-height: 1.6;
          color: var(--text-primary);
        }

        .findings-list li::marker {
          color: var(--accent-green);
        }

        .recommendations-list li::marker {
          color: var(--accent-blue);
        }

        @media (max-width: 1000px) {
          .report-content {
            padding: 2rem 1.5rem 2rem 7.5rem;
          }

          .report-header h1 {
            font-size: 2rem;
          }

          .insights-grid {
            grid-template-columns: 1fr;
          }

          .nav-right {
            gap: 0.25rem;
          }

          .icon-btn {
            padding: 0.375rem;
          }
        }
      `}</style>
        </div>
    );
}
