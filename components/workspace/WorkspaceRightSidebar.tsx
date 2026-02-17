"use client";

import { useState, useEffect } from "react";
import DataDNAPanel from "./DataDNAPanel";
import ContextPanel from "./ContextPanel";
import { DataDNA } from "@/store/dataStore";
import { Fingerprint, Database, Terminal, Info } from "lucide-react";

interface WorkspaceRightSidebarProps {
  dataDNA: DataDNA;
  sqlCode?: string;
  pythonCode?: string;
  sessionId?: string;
}

type SidebarOption = "dataDNA" | "sql" | "python" | "context";

const SIDEBAR_OPTIONS = [
  { id: "dataDNA" as SidebarOption, icon: Fingerprint, label: "Data DNA", color: "var(--accent)" },
  { id: "sql" as SidebarOption, icon: Database, label: "SQL", color: "var(--info)" },
  { id: "python" as SidebarOption, icon: Terminal, label: "Python", color: "var(--success)" },
  { id: "context" as SidebarOption, icon: Info, label: "Context", color: "var(--warning)" },
];

export default function WorkspaceRightSidebar({ dataDNA, sqlCode, pythonCode, sessionId }: WorkspaceRightSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeOption, setActiveOption] = useState<SidebarOption | null>(null);

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
    switch (activeOption) {
      case "dataDNA":
        return <DataDNAPanel dataDNA={dataDNA} />;
      case "sql":
        return (
          <div className="panel-container">
            <h3 className="panel-title" style={{ color: "var(--info)" }}>SQL Analysis</h3>
            {sqlCode ? (
              <pre className="code-block">
                <code>{sqlCode}</code>
              </pre>
            ) : (
              <p className="panel-text">SQL queries will appear here when executed.</p>
            )}
          </div>
        );
      case "python":
        return (
          <div className="panel-container">
            <h3 className="panel-title" style={{ color: "var(--success)" }}>Python Sandbox</h3>
            {pythonCode ? (
              <pre className="code-block">
                <code>{pythonCode}</code>
              </pre>
            ) : (
              <p className="panel-text">Python code will appear here when executed.</p>
            )}
          </div>
        );
      case "context":
        return sessionId ? (
          <ContextPanel dataDNA={dataDNA} sessionId={sessionId} />
        ) : (
          <div className="panel-container">
            <h3 className="panel-title" style={{ color: "var(--warning)" }}>Context & Knowledge</h3>
            <p className="panel-text">Session ID required to load context insights.</p>
          </div>
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
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.75rem;
          color: var(--text-muted);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
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
      `}</style>
    </aside>
  );
}
