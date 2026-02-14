"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Database, Code, FileCode, Activity } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useDataStore } from "@/store/dataStore";

export default function ArtifactPanel() {
    const { isRightPanelOpen, toggleRightPanel, rightPanelTab, setRightPanelTab } =
        useWorkspaceStore();
    const { dataDNA } = useDataStore();

    const tabs = [
        { id: "dna" as const, label: "Data DNA", icon: Database },
        { id: "sql" as const, label: "SQL Output", icon: Code },
        { id: "python" as const, label: "Python Output", icon: FileCode },
        { id: "context" as const, label: "Context Log", icon: Activity },
    ];

    return (
        <AnimatePresence>
            {isRightPanelOpen && (
                <motion.div
                    className="artifact-panel"
                    initial={{ x: 320, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 320, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                >
                    {/* Header */}
                    <div className="panel-header">
                        <h3>Artifact Panel</h3>
                        <button className="toggle-btn" onClick={toggleRightPanel}>
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="divider-horizontal" />

                    {/* Tabs */}
                    <div className="tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    className={`tab ${rightPanelTab === tab.id ? "active" : ""}`}
                                    onClick={() => setRightPanelTab(tab.id)}
                                >
                                    <Icon size={16} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="divider-horizontal" />

                    {/* Content */}
                    <div className="panel-content">
                        {rightPanelTab === "dna" && dataDNA && (
                            <div className="dna-content">
                                <div className="dna-section">
                                    <h4>Dataset Overview</h4>
                                    <div className="dna-item">
                                        <span className="dna-label">Rows</span>
                                        <span className="dna-value">{dataDNA.rowCount.toLocaleString()}</span>
                                    </div>
                                    <div className="dna-item">
                                        <span className="dna-label">Columns</span>
                                        <span className="dna-value">{dataDNA.columnCount}</span>
                                    </div>
                                    <div className="dna-item">
                                        <span className="dna-label">Date Range</span>
                                        <span className="dna-value">{dataDNA.baselines.dateRange}</span>
                                    </div>
                                </div>

                                <div className="divider-horizontal" />

                                <div className="dna-section">
                                    <h4>Baselines</h4>
                                    {Object.entries(dataDNA.baselines).map(([key, value]) => (
                                        <div key={key} className="dna-item">
                                            <span className="dna-label">
                                                {key.replace(/([A-Z])/g, " $1").trim()}
                                            </span>
                                            <span className="dna-value">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="divider-horizontal" />

                                <div className="dna-section">
                                    <h4>Detected Patterns</h4>
                                    <div className="pattern-tags">
                                        {dataDNA.patterns.map((pattern) => (
                                            <div key={pattern} className="pattern-tag">
                                                {pattern}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {rightPanelTab === "sql" && (
                            <div className="output-content">
                                <p className="empty-state">No SQL output yet</p>
                            </div>
                        )}

                        {rightPanelTab === "python" && (
                            <div className="output-content">
                                <p className="empty-state">No Python output yet</p>
                            </div>
                        )}

                        {rightPanelTab === "context" && (
                            <div className="output-content">
                                <p className="empty-state">No context log yet</p>
                            </div>
                        )}
                    </div>

                    <style jsx>{`
            .artifact-panel {
              width: 320px;
              height: 100%;
              background-color: var(--bg-surface);
              border-left: 1px solid var(--border);
              display: flex;
              flex-direction: column;
              overflow-y: auto;
            }

            .panel-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 1.5rem;
            }

            .panel-header h3 {
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

            .tabs {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 0.5rem;
              padding: 1rem;
            }

            .tab {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.375rem;
              padding: 0.5rem 0.75rem;
              background-color: transparent;
              border: 1px solid var(--border);
              border-radius: 0.375rem;
              color: var(--text-muted);
              font-family: inherit;
              font-size: 0.75rem;
              font-weight: 500;
              cursor: pointer;
              transition: all var(--transition-fast) ease;
            }

            .tab:hover {
              border-color: var(--accent-blue);
              color: var(--text-primary);
            }

            .tab.active {
              background-color: var(--accent-blue);
              border-color: var(--accent-blue);
              color: white;
            }

            .panel-content {
              flex: 1;
              padding: 1.5rem;
              overflow-y: auto;
            }

            .dna-section {
              margin-bottom: 1.5rem;
            }

            .dna-section h4 {
              font-size: 0.75rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: var(--text-muted);
              margin: 0 0 0.75rem 0;
            }

            .dna-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.5rem 0;
              font-size: 0.875rem;
            }

            .dna-label {
              color: var(--text-muted);
              text-transform: capitalize;
            }

            .dna-value {
              color: var(--text-primary);
              font-weight: 500;
              font-family: "Geist Mono", "JetBrains Mono", monospace;
            }

            .pattern-tags {
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;
            }

            .pattern-tag {
              padding: 0.375rem 0.75rem;
              background-color: var(--bg-base);
              border: 1px solid var(--border);
              border-radius: 9999px;
              font-size: 0.75rem;
              font-weight: 500;
              color: var(--text-primary);
            }

            .output-content {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 200px;
            }

            .empty-state {
              color: var(--text-muted);
              font-size: 0.875rem;
              text-align: center;
            }
          `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
