"use client";

import type { MessageType } from "@/store/chatStore";

interface AgentBadgeProps {
    type: MessageType;
}

const agentConfig = {
    orchestrator: {
        label: "Orchestrator",
        icon: "🎯",
        color: "var(--accent-blue)",
    },
    sql: {
        label: "SQL Agent",
        icon: "🐘",
        color: "var(--accent-green)",
    },
    python: {
        label: "Python Agent",
        icon: "🐍",
        color: "var(--accent-amber)",
    },
    system: {
        label: "System",
        icon: "⚙️",
        color: "var(--text-muted)",
    },
    user: {
        label: "You",
        icon: "👤",
        color: "var(--text-primary)",
    },
};

export default function AgentBadge({ type }: AgentBadgeProps) {
    const config = agentConfig[type];

    return (
        <div className="agent-badge">
            <span className="icon">{config.icon}</span>
            <span className="label">{config.label}</span>

            <style jsx>{`
        .agent-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.75rem;
          background-color: var(--bg-elevated);
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: ${config.color};
        }

        .icon {
          font-size: 0.875rem;
        }

        .label {
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
        </div>
    );
}
