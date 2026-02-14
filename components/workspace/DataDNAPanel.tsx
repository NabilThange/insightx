"use client";

import { motion } from "framer-motion";
import { Database, BarChart3, Grip, ArrowUpRight } from "lucide-react";
import type { DataDNA } from "@/store/dataStore";

interface DataDNAPanelProps {
    dataDNA: DataDNA;
}

export default function DataDNAPanel({ dataDNA }: DataDNAPanelProps) {
    return (
        <div className="dna-panel">
            <div className="panel-header">
                <div className="header-title">
                    <Database size={16} />
                    <h3>Data DNA</h3>
                </div>
                <span className="badge">Verified</span>
            </div>

            <div className="panel-content custom-scrollbar">
                {/* Dataset Stats */}
                <section className="panel-section">
                    <div className="stat-row">
                        <div className="stat">
                            <span className="label">Rows</span>
                            <span className="value">{dataDNA.rowCount.toLocaleString()}</span>
                        </div>
                        <div className="stat">
                            <span className="label">Cols</span>
                            <span className="value">{dataDNA.columnCount}</span>
                        </div>
                    </div>
                    <div className="date-range">
                        <span className="label">Range</span>
                        <span className="value">{dataDNA.baselines.dateRange}</span>
                    </div>
                </section>

                <div className="divider" />

                {/* Columns */}
                <section className="panel-section">
                    <h4>Columns</h4>
                    <div className="columns-list">
                        {dataDNA.columns.map((col) => (
                            <div key={col.name} className="column-item">
                                <div className="col-info">
                                    <span className={`col-type ${col.type}`} />
                                    <span className="col-name">{col.name}</span>
                                </div>
                                <span className="col-meta">{col.nullPercentage > 0 ? `${col.nullPercentage}% null` : "100%"}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="divider" />

                {/* Patterns */}
                <section className="panel-section">
                    <h4>
                        <ArrowUpRight size={14} />
                        Patterns Detected
                    </h4>
                    <div className="patterns-list">
                        {dataDNA.patterns.map(pattern => (
                            <div key={pattern} className="pattern-item">
                                {pattern}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <style jsx>{`
        .dna-panel {
          width: 300px;
          height: 100%;
          border-left: 1px solid var(--stroke);
          background-color: var(--bg);
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--stroke);
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 3.5rem;
        }

        .header-title {
           display: flex;
           align-items: center;
           gap: 0.5rem;
           color: var(--fg);
        }

        .header-title h3 {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .badge {
          font-size: 0.75rem;
          padding: 0.125rem 0.5rem;
          background: var(--bg-surface);
          border: 1px solid var(--stroke);
          border-radius: 999px;
          color: var(--accent-green);
        }

        .panel-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .panel-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stat-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .label {
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
        }

        .value {
            font-size: 1rem;
            font-weight: 500;
            font-family: "Geist Mono", monospace;
        }
        
        .date-range {
             display: flex;
             flex-direction: column;
             gap: 0.25rem;
             margin-top: 0.5rem;
        }

        .divider {
          height: 1px;
          background-color: var(--stroke);
          opacity: 0.5;
        }

        h4 {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .columns-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .column-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem;
            border-radius: 0.25rem;
            transition: background-color 0.2s;
        }

        .column-item:hover {
            background-color: var(--bg-surface);
        }

        .col-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .col-type {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }

        .col-type.numeric { background-color: var(--accent-blue); }
        .col-type.text { background-color: var(--text-muted); }
        .col-type.datetime { background-color: var(--accent-amber); }
        .col-type.categorical { background-color: var(--accent-purple); }

        .col-name {
            font-size: 0.875rem;
            font-family: "Geist Mono", monospace;
        }

        .col-meta {
            font-size: 0.75rem;
            color: var(--text-muted);
        }

        .patterns-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .pattern-item {
            padding: 0.5rem 0.75rem;
            background-color: var(--bg-surface);
            border: 1px solid var(--stroke);
            border-radius: 0.375rem;
            font-size: 0.875rem;
            color: var(--fg);
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--stroke);
          border-radius: 2px;
        }
      `}</style>
        </div>
    );
}
