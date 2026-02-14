"use client";

import { motion } from "framer-motion";
import { Sparkles, Terminal, Database, Check } from "lucide-react";

export type AgentType = "orchestrator" | "sql" | "python";

interface AgentMessageProps {
    agentType: AgentType;
    content: string;
    insight?: string;
    recommendation?: string;
    context?: string;
}

export default function AgentMessage({ agentType, content, insight, recommendation, context }: AgentMessageProps) {

    const getBadge = () => {
        switch (agentType) {
            case "orchestrator":
                return { icon: <Sparkles size={14} />, text: "InsightX Lead", color: "var(--accent-purple)" };
            case "sql":
                return { icon: <Database size={14} />, text: "SQL Analyst", color: "var(--accent-blue)" };
            case "python":
                return { icon: <Terminal size={14} />, text: "Data Scientist", color: "var(--accent-green)" };
        }
    };

    const badge = getBadge();

    return (
        <motion.div
            className="agent-message-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="message-header">
                <div className="agent-badge" style={{ borderColor: badge.color, color: badge.color }}>
                    {badge.icon}
                    {badge.text}
                </div>
            </div>

            <div className="message-body">
                {/* Direct Answer */}
                <div className="direct-answer">
                    {content}
                </div>

                {/* Structured Sections */}
                {context && (
                    <div className="message-section context">
                        <span className="section-label">Context</span>
                        <p>{context}</p>
                    </div>
                )}

                {insight && (
                    <div className="message-section insight">
                        <span className="section-label">
                            <Sparkles size={12} />
                            Key Insight
                        </span>
                        <p>{insight}</p>
                    </div>
                )}

                {recommendation && (
                    <div className="message-section recommendation">
                        <span className="section-label">Recommendation</span>
                        <p>{recommendation}</p>
                    </div>
                )}
            </div>

            <style jsx>{`
        .agent-message-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1.5rem;
            background-color: transparent; /* Seamless blend */
        }

        .message-header {
            display: flex;
            align-items: center;
        }

        .agent-badge {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 0.25rem 0.75rem;
            border: 1px solid currentColor;
            border-radius: 999px;
            background-color: var(--bg);
        }

        .message-body {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            font-size: 1rem;
            line-height: 1.6;
            color: var(--fg);
        }

        .direct-answer {
            font-weight: 400;
        }

        .message-section {
            padding-left: 1rem;
            border-left: 2px solid var(--stroke);
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .message-section.insight {
            border-left-color: var(--accent-amber);
            background: linear-gradient(to right, rgba(245, 158, 11, 0.05), transparent);
            padding: 0.75rem 1rem;
            border-radius: 0 0.5rem 0.5rem 0;
            border-left-width: 3px;
        }

        .section-label {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .message-section.insight .section-label {
            color: var(--accent-amber);
        }
      `}</style>
        </motion.div>
    );
}
