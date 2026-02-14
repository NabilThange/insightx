"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";

interface ContextSidebarProps {
    sessionId: string;
}

export default function ContextSidebar({ sessionId }: ContextSidebarProps) {
    const { isLeftSidebarOpen, toggleLeftSidebar } = useWorkspaceStore();

    // Mock data - in real app, this would come from stores
    const chatHistory = [
        { id: sessionId, title: "Transaction Analysis", date: "Today, 9:45 PM", active: true },
        { id: "2", title: "Payment Failures", date: "Yesterday", active: false },
        { id: "3", title: "Peak Hour Trends", date: "2 days ago", active: false },
    ];

    const accumulatedInsights = [
        { id: "1", badge: "Peak Hours", text: "8-9 PM shows highest activity" },
        { id: "2", badge: "Network", text: "4G has 23% higher timeout rate" },
        { id: "3", badge: "Trend", text: "Weekend transactions 15% higher" },
    ];

    return (
        <AnimatePresence>
            {isLeftSidebarOpen && (
                <motion.div
                    className="context-sidebar"
                    initial={{ x: -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                >
                    {/* Header */}
                    <div className="sidebar-header">
                        <h3>Workspace</h3>
                        <button className="toggle-btn" onClick={toggleLeftSidebar}>
                            <ChevronLeft size={20} />
                        </button>
                    </div>

                    <div className="divider-horizontal" />

                    {/* Chat History */}
                    <div className="section">
                        <h4>Conversation History</h4>
                        <div className="history-list">
                            {chatHistory.map((chat) => (
                                <div
                                    key={chat.id}
                                    className={`history-item ${chat.active ? "active" : ""}`}
                                >
                                    <div className="history-title">{chat.title}</div>
                                    <div className="history-date">{chat.date}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="divider-horizontal" />

                    {/* Accumulated Insights */}
                    <div className="section">
                        <h4>Accumulated Insights</h4>
                        <div className="insights-list">
                            {accumulatedInsights.map((insight) => (
                                <div key={insight.id} className="insight-item">
                                    <div className="insight-badge">{insight.badge}</div>
                                    <p>{insight.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <style jsx>{`
            .context-sidebar {
              width: 300px;
              height: 100%;
              background-color: var(--bg-surface);
              border-right: 1px solid var(--border);
              display: flex;
              flex-direction: column;
              overflow-y: auto;
            }

            .sidebar-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 1.5rem;
            }

            .sidebar-header h3 {
              font-size: 1rem;
              font-weight: 600;
              color: var(--text-primary);
              margin: 0;
            }

            .toggle-btn {
              background: none;
              border: none;
              color: var(--text-muted);
              cursor: pointer;
              padding: 0.25rem;
              display: flex;
              align-items: center;
              transition: color var(--transition-fast) ease;
            }

            .toggle-btn:hover {
              color: var(--text-primary);
            }

            .divider-horizontal {
              width: 100%;
              height: 1px;
              background-color: var(--border);
            }

            .section {
              padding: 1.5rem;
            }

            .section h4 {
              font-size: 0.75rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: var(--text-muted);
              margin: 0 0 1rem 0;
            }

            .history-list {
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
            }

            .history-item {
              padding: 0.75rem;
              border-radius: 0.5rem;
              cursor: pointer;
              transition: background-color var(--transition-fast) ease;
            }

            .history-item:hover {
              background-color: var(--bg-elevated);
            }

            .history-item.active {
              background-color: var(--bg-elevated);
              border-left: 2px solid var(--accent-blue);
            }

            .history-title {
              font-size: 0.875rem;
              font-weight: 500;
              color: var(--text-primary);
              margin-bottom: 0.25rem;
            }

            .history-date {
              font-size: 0.75rem;
              color: var(--text-muted);
            }

            .insights-list {
              display: flex;
              flex-direction: column;
              gap: 0.75rem;
            }

            .insight-item {
              padding: 0.75rem;
              background-color: var(--bg-base);
              border-radius: 0.5rem;
              border-left: 2px solid var(--accent-purple);
            }

            .insight-badge {
              display: inline-block;
              padding: 0.125rem 0.5rem;
              background-color: var(--bg-elevated);
              border-radius: 0.25rem;
              font-size: 0.625rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: var(--accent-purple);
              margin-bottom: 0.5rem;
            }

            .insight-item p {
              font-size: 0.875rem;
              color: var(--text-primary);
              margin: 0;
              line-height: 1.4;
            }
          `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
