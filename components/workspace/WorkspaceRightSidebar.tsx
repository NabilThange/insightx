"use client";

import { useState, useEffect } from "react";
import DataDNAPanel from "./DataDNAPanel";
import ContextPanel from "./ContextPanel";
import { WorkspaceSidebarService, type WorkspaceSidebar } from "@/lib/db/sidebar";
import { Fingerprint, Database, Terminal, Info, Loader2 } from "lucide-react";

interface WorkspaceRightSidebarProps {
  sessionId: string;
}

type SidebarOption = "dataDNA" | "sql" | "python" | "context";

const SIDEBAR_OPTIONS = [
  { id: "dataDNA" as SidebarOption, icon: Fingerprint, label: "Data DNA", color: "var(--accent)" },
  { id: "sql" as SidebarOption, icon: Database, label: "SQL", color: "var(--info)" },
  { id: "python" as SidebarOption, icon: Terminal, label: "Python", color: "var(--success)" },
  { id: "context" as SidebarOption, icon: Info, label: "Context", color: "var(--warning)" },
];

export default function WorkspaceRightSidebar({ sessionId }: WorkspaceRightSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeOption, setActiveOption] = useState<SidebarOption | null>(null);
  const [sidebarData, setSidebarData] = useState<WorkspaceSidebar | null>(null);
  const [loading, setLoading] = useState(true);

  // Load sidebar data from database
  useEffect(() => {
    const loadSidebarData = async () => {
      try {
        setLoading(true);
        console.log("🔄 [WorkspaceRightSidebar] Loading sidebar data for session:", sessionId);
        const data = await WorkspaceSidebarService.getSidebar(sessionId);
        console.log("✅ [WorkspaceRightSidebar] Sidebar data loaded:", data ? "Yes" : "No");

        if (data) {
          // Defensive parsing: handle both string and object data_dna
          let parsedDataDNA = data.data_dna;
          if (typeof parsedDataDNA === 'string') {
            try {
              parsedDataDNA = JSON.parse(parsedDataDNA);
              console.log("🔧 [WorkspaceRightSidebar] Parsed data_dna from string to object");
            } catch (e) {
              console.error("❌ [WorkspaceRightSidebar] Failed to parse data_dna string:", e);
              parsedDataDNA = null;
            }
          }

          // Normalize snake_case to camelCase for frontend compatibility
          if (parsedDataDNA && typeof parsedDataDNA === 'object') {
            // Basic counts
            if ('row_count' in parsedDataDNA && !('rowCount' in parsedDataDNA)) {
              parsedDataDNA.rowCount = parsedDataDNA.row_count;
              console.log("🔧 [WorkspaceRightSidebar] Normalized row_count to rowCount:", parsedDataDNA.rowCount);
            }
            if ('col_count' in parsedDataDNA && !('columnCount' in parsedDataDNA)) {
              parsedDataDNA.columnCount = parsedDataDNA.col_count;
              console.log("🔧 [WorkspaceRightSidebar] Normalized col_count to columnCount:", parsedDataDNA.columnCount);
            }

            // Patterns and insights
            if ('detected_patterns' in parsedDataDNA && !('patterns' in parsedDataDNA)) {
              parsedDataDNA.patterns = parsedDataDNA.detected_patterns;
              console.log("🔧 [WorkspaceRightSidebar] Normalized detected_patterns to patterns:", parsedDataDNA.patterns?.length);
            }
            if ('suggested_queries' in parsedDataDNA && !('insights' in parsedDataDNA)) {
              parsedDataDNA.insights = parsedDataDNA.suggested_queries;
              console.log("🔧 [WorkspaceRightSidebar] Normalized suggested_queries to insights:", parsedDataDNA.insights?.length);
            }
            if ('accumulated_insights' in parsedDataDNA && !('accumulatedInsights' in parsedDataDNA)) {
              parsedDataDNA.accumulatedInsights = parsedDataDNA.accumulated_insights;
              console.log("🔧 [WorkspaceRightSidebar] Normalized accumulated_insights to accumulatedInsights:", parsedDataDNA.accumulatedInsights?.length);
            }

            // Segment breakdown
            if ('segment_breakdown' in parsedDataDNA && !('segmentBreakdown' in parsedDataDNA)) {
              parsedDataDNA.segmentBreakdown = parsedDataDNA.segment_breakdown;
              console.log("🔧 [WorkspaceRightSidebar] Normalized segment_breakdown to segmentBreakdown:", parsedDataDNA.segmentBreakdown?.length);
            }

            // Outlier summary
            if ('outlier_summary' in parsedDataDNA && !('outlierSummary' in parsedDataDNA)) {
              parsedDataDNA.outlierSummary = parsedDataDNA.outlier_summary;
              console.log("🔧 [WorkspaceRightSidebar] Normalized outlier_summary to outlierSummary:", parsedDataDNA.outlierSummary?.length);
            }

            // Missing summary
            if ('missing_summary' in parsedDataDNA && !('missingSummary' in parsedDataDNA)) {
              parsedDataDNA.missingSummary = parsedDataDNA.missing_summary;
              console.log("🔧 [WorkspaceRightSidebar] Normalized missing_summary to missingSummary");
            }

            // Datetime info
            if ('datetime_info' in parsedDataDNA && !('datetimeInfo' in parsedDataDNA)) {
              parsedDataDNA.datetimeInfo = parsedDataDNA.datetime_info;
              console.log("🔧 [WorkspaceRightSidebar] Normalized datetime_info to datetimeInfo");
            }

            // Ensure arrays exist with defaults
            if (!parsedDataDNA.patterns) parsedDataDNA.patterns = [];
            if (!parsedDataDNA.insights) parsedDataDNA.insights = [];
            if (!parsedDataDNA.accumulatedInsights) parsedDataDNA.accumulatedInsights = [];
            if (!parsedDataDNA.columns) parsedDataDNA.columns = [];
            if (!parsedDataDNA.baselines) parsedDataDNA.baselines = {};
          }

          // Update the data with normalized data_dna
          const normalizedData = { ...data, data_dna: parsedDataDNA };

          console.log("📊 [WorkspaceRightSidebar] Data DNA exists:", normalizedData.data_dna ? "Yes" : "No");
          if (normalizedData.data_dna) {
            console.log("📊 [WorkspaceRightSidebar] Rows:", normalizedData.data_dna.rowCount || normalizedData.data_dna.row_count || 0);
            console.log("📊 [WorkspaceRightSidebar] Columns:", normalizedData.data_dna.columnCount || normalizedData.data_dna.col_count || 0);
          }
          console.log("🔍 [WorkspaceRightSidebar] SQL code exists:", normalizedData.current_sql_code ? "Yes" : "No");
          console.log("🐍 [WorkspaceRightSidebar] Python code exists:", normalizedData.current_python_code ? "Yes" : "No");
          console.log("🧠 [WorkspaceRightSidebar] Context exists:", normalizedData.context_analysis ? "Yes" : "No");

          setSidebarData(normalizedData);
        } else {
          setSidebarData(null);
        }
      } catch (error) {
        console.error("❌ [WorkspaceRightSidebar] Failed to load sidebar data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      loadSidebarData();
    }
  }, [sessionId]);

  // Refresh sidebar data
  const refreshSidebarData = async () => {
    try {
      const data = await WorkspaceSidebarService.getSidebar(sessionId);
      setSidebarData(data);
    } catch (error) {
      console.error("Failed to refresh sidebar data:", error);
    }
  };

  const handleOptionClick = (option: SidebarOption) => {
    if (activeOption === option && isExpanded) {
      setIsExpanded(false);
      setActiveOption(null);
    } else {
      setActiveOption(option);
      setIsExpanded(true);
    }
  };

  // Agent Drawer Listener
  useEffect(() => {
    const handleOpenDrawer = (event: any) => {
      const { drawer } = event.detail;
      if (drawer) {
        setActiveOption(drawer as SidebarOption);
        setIsExpanded(true);
      }
    };
    window.addEventListener('open-drawer', handleOpenDrawer);
    return () => window.removeEventListener('open-drawer', handleOpenDrawer);
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="panel-container">
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 size={16} className="animate-spin" />
            <p className="panel-text">Loading...</p>
          </div>
        </div>
      );
    }

    // Don't show "No data available" for the whole sidebar
    // Each panel will handle its own empty state

    switch (activeOption) {
      case "dataDNA":
        if (!sidebarData || !sidebarData.data_dna) {
          return (
            <div className="panel-container">
              <h3 className="panel-title" style={{ color: "var(--accent)" }}>Data DNA</h3>
              <p className="panel-text">No Data DNA available yet. Upload a dataset to see its profile.</p>
            </div>
          );
        }
        return <DataDNAPanel dataDNA={sidebarData.data_dna} />;

      case "sql":
        return (
          <div className="panel-container">
            <h3 className="panel-title" style={{ color: "var(--info)" }}>
              SQL Executions ({sidebarData?.sql_code_history?.length || 0})
            </h3>

            {sidebarData?.sql_code_history && sidebarData.sql_code_history.length > 0 ? (
              <div className="execution-log">
                {sidebarData.sql_code_history.slice().reverse().map((entry, idx) => (
                  <div key={idx} className="execution-card">
                    {/* Header */}
                    <div className="execution-header">
                      <span className="execution-time">
                        {new Date(entry.executed_at).toLocaleTimeString()}
                      </span>
                      {entry.status === 'success' ? (
                        <span className="status-badge success">✓ Success</span>
                      ) : entry.status === 'error' ? (
                        <span className="status-badge error">✗ Error</span>
                      ) : null}
                    </div>

                    {/* Description */}
                    {entry.description && (
                      <p className="execution-description">{entry.description}</p>
                    )}

                    {/* Metrics */}
                    {(entry.row_count !== undefined || entry.execution_time_ms !== undefined) && (
                      <div className="execution-metrics">
                        {entry.row_count !== undefined && (
                          <span className="metric">{entry.row_count.toLocaleString()} rows</span>
                        )}
                        {entry.execution_time_ms !== undefined && (
                          <span className="metric">{entry.execution_time_ms}ms</span>
                        )}
                      </div>
                    )}

                    {/* Code (collapsible) */}
                    <details className="code-details">
                      <summary>View SQL</summary>
                      <pre className="code-block">
                        <code>{entry.code}</code>
                      </pre>
                    </details>

                    {/* Result Preview */}
                    {entry.result && Array.isArray(entry.result) && entry.result.length > 0 && (
                      <details className="result-details">
                        <summary>View Results ({entry.result.length} rows)</summary>
                        <pre className="result-block">
                          {JSON.stringify(entry.result.slice(0, 5), null, 2)}
                          {entry.result.length > 5 && `\n... ${entry.result.length - 5} more rows`}
                        </pre>
                      </details>
                    )}

                    {/* Error Message */}
                    {entry.error_message && (
                      <div className="error-message">
                        <strong>Error:</strong> {entry.error_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="panel-text">SQL queries will appear here when executed.</p>
            )}
          </div>
        );

      case "python":
        return (
          <div className="panel-container">
            <h3 className="panel-title" style={{ color: "var(--success)" }}>
              Python Executions ({sidebarData?.python_code_history?.length || 0})
            </h3>

            {sidebarData?.python_code_history && sidebarData.python_code_history.length > 0 ? (
              <div className="execution-log">
                {sidebarData.python_code_history.slice().reverse().map((entry, idx) => (
                  <div key={idx} className="execution-card">
                    {/* Header */}
                    <div className="execution-header">
                      <span className="execution-time">
                        {new Date(entry.executed_at).toLocaleTimeString()}
                      </span>
                      {entry.status === 'success' ? (
                        <span className="status-badge success">✓ Success</span>
                      ) : entry.status === 'error' ? (
                        <span className="status-badge error">✗ Error</span>
                      ) : null}
                    </div>

                    {/* Description */}
                    {entry.description && (
                      <p className="execution-description">{entry.description}</p>
                    )}

                    {/* Metrics */}
                    {(entry.row_count !== undefined || entry.execution_time_ms !== undefined) && (
                      <div className="execution-metrics">
                        {entry.row_count !== undefined && (
                          <span className="metric">{entry.row_count.toLocaleString()} rows</span>
                        )}
                        {entry.execution_time_ms !== undefined && (
                          <span className="metric">{entry.execution_time_ms}ms</span>
                        )}
                      </div>
                    )}

                    {/* Code (collapsible) */}
                    <details className="code-details">
                      <summary>View Python Code</summary>
                      <pre className="code-block">
                        <code>{entry.code}</code>
                      </pre>
                    </details>

                    {/* Result Preview */}
                    {entry.result && (
                      <details className="result-details">
                        <summary>View Output</summary>
                        <pre className="result-block">
                          {typeof entry.result === 'string'
                            ? entry.result
                            : JSON.stringify(entry.result, null, 2)}
                        </pre>
                      </details>
                    )}

                    {/* Error Message */}
                    {entry.error_message && (
                      <div className="error-message">
                        <strong>Error:</strong> {entry.error_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="panel-text">Python code will appear here when executed.</p>
            )}
          </div>
        );

      case "context":
        return (
          <ContextPanel
            contextData={sidebarData?.context_analysis || null}
            sessionId={sessionId}
            onRefresh={refreshSidebarData}
          />
        );

      default:
        return null;
    }
  };

  return (
    <aside className={`right-sidebar ${isExpanded ? 'expanded' : ''}`}>
      {/* Icon Rail */}
      <div className="sidebar-rail">
        {SIDEBAR_OPTIONS.map((option) => {
          const isActive = activeOption === option.id;
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className={`rail-btn ${isActive ? 'active' : ''}`}
              title={option.label}
            >
              <Icon size={20} />
              {isActive && <span className="active-dot" style={{ background: option.color }} />}
            </button>
          );
        })}
      </div>

      {/* Expanded Content */}
      <div className="sidebar-content">
        {isExpanded && activeOption && renderContent()}
      </div>

      <style jsx>{`
        .right-sidebar {
          width: 60px;
          height: 100%;
          background: var(--bg);
          border-left: 1px solid var(--stroke);
          display: flex;
          transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          z-index: 20;
        }

        .right-sidebar.expanded {
          width: 420px;
          background: var(--bg-surface);
        }

        .sidebar-rail {
          width: 60px;
          flex-shrink: 0;
          height: 100%;
          padding: 1rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          border-right: 1px solid transparent;
          transition: border-color 0.3s ease;
        }

        .expanded .sidebar-rail {
          border-right-color: var(--stroke);
          background: var(--bg);
        }

        .rail-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: var(--text-muted);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, transform 0.2s;
          position: relative;
          outline: none;
        }

        .rail-btn:focus-visible {
          box-shadow: 0 0 0 3px rgba(31,31,31,0.5);
        }

        .rail-btn:hover {
          background: var(--loader-bg);
          color: var(--fg);
          transform: scale(1.05);
        }

        .rail-btn.active {
          background: var(--fg);
          color: var(--bg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .active-dot {
          position: absolute;
          right: 4px;
          top: 4px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: 1px solid var(--bg);
        }

        .sidebar-content {
          flex: 1;
          height: 100%;
          overflow: hidden;
          background: var(--bg-surface);
        }

        .panel-container {
          padding: 1.5rem;
          height: 100%;
          overflow-y: auto;
        }

        .panel-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }

        .panel-text {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* Custom scrollbar for the expanded content */
        .sidebar-content::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-content::-webkit-scrollbar-thumb {
          background: var(--stroke);
          border-radius: 2px;
        }

        .code-block {
          background: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 0.5rem;
          padding: 1rem;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.75rem;
          line-height: 1.5;
          overflow-x: auto;
          color: var(--fg);
        }

        .code-block code {
          white-space: pre;
        }

        .history-section {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--stroke);
        }

        .history-title {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .history-item {
          background: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 0.375rem;
          padding: 0.75rem;
        }

        .history-time {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .history-code {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.7rem;
          color: var(--fg);
          white-space: pre-wrap;
          word-break: break-all;
        }

        /* Execution Log Styles */
        .execution-log {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .execution-card {
          background: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 0.5rem;
          padding: 1rem;
          transition: border-color 0.2s ease;
        }

        .execution-card:hover {
          border-color: var(--info);
        }

        .execution-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .execution-time {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .status-badge {
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-weight: 600;
        }

        .status-badge.success {
          background: rgba(34, 197, 94, 0.1);
          color: rgb(34, 197, 94);
        }

        .status-badge.error {
          background: rgba(239, 68, 68, 0.1);
          color: rgb(239, 68, 68);
        }

        .execution-description {
          font-size: 0.875rem;
          color: var(--fg);
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .execution-metrics {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .metric {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
        }

        .code-details, .result-details {
          margin-top: 0.75rem;
        }

        .code-details summary, .result-details summary {
          font-size: 0.75rem;
          color: var(--info);
          cursor: pointer;
          user-select: none;
          font-weight: 600;
          padding: 0.5rem;
          background: var(--bg-surface);
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }

        .code-details summary:hover, .result-details summary:hover {
          color: var(--accent);
          background: var(--loader-bg);
        }

        .code-details[open] summary, .result-details[open] summary {
          margin-bottom: 0.5rem;
        }

        .result-block {
          margin-top: 0.5rem;
          background: var(--bg-surface);
          border: 1px solid var(--stroke);
          border-radius: 0.375rem;
          padding: 0.75rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          overflow-x: auto;
          max-height: 300px;
          overflow-y: auto;
          color: var(--fg);
        }

        .error-message {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 0.375rem;
          font-size: 0.75rem;
          color: rgb(239, 68, 68);
        }

        .error-message strong {
          font-weight: 600;
        }
      `}</style>
    </aside>
  );
}
