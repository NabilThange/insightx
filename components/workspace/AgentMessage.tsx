"use client";

import { motion } from "framer-motion";
import { Sparkles, Terminal, Database, Shield } from "lucide-react";
import CodeBlock from "../data/CodeBlock";
import InsightCard from "../data/InsightCard";
import type { Message } from "@/store/chatStore";

interface AgentMessageProps {
    message: Message;
}

export default function AgentMessage({ message }: AgentMessageProps) {
    const { type, content, thinking, code, insight } = message;

    const getBadge = () => {
        switch (type) {
            case "orchestrator":
                return { icon: <Sparkles size={14} />, text: "InsightX Lead", color: "var(--accent-purple)" };
            case "sql":
                return { icon: <Database size={14} />, text: "SQL Analyst", color: "var(--accent-blue)" };
            case "python":
                return { icon: <Terminal size={14} />, text: "Data Scientist", color: "var(--accent-green)" };
            case "system":
                return { icon: <Shield size={14} />, text: "System", color: "var(--fg)" };
            default:
                return { icon: <Sparkles size={14} />, text: "Agent", color: "var(--accent-purple)" };
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
                {/* Thinking Process */}
                {thinking && thinking.length > 0 && (
                    <div className="thinking-process">
                        {thinking.map((step, i) => (
                            <div key={i} className="thinking-step">
                                <span className="dot" />
                                {step}
                            </div>
                        ))}
                    </div>
                )}

                {/* Direct Answer */}
                <div className="direct-answer">
                    {content}
                </div>

                {/* Code Blocks */}
                {code?.sql && (
                    <div className="message-section code-section">
                        <span className="section-label">SQL Query</span>
                        <CodeBlock code={code.sql} language="sql" />
                    </div>
                )}

                {code?.python && (
                    <div className="message-section code-section">
                        <span className="section-label">Python Script</span>
                        <CodeBlock code={code.python} language="python" />
                    </div>
                )}

                {/* Insight Card */}
                {insight && (
                    <div className="message-section insight-section">
                        <span className="section-label">
                            <Sparkles size={12} />
                            Key Insight
                        </span>
                        <InsightCard
                            id="insight-latest"
                            title={insight.title}
                            category="AI Analysis"
                            timestamp="Just now"
                            metric={insight.metric}
                            trend={insight.trend || "neutral"}
                            trendValue={insight.trendValue || "—"}
                            chartType="line"
                            chartData={[]}
                            tags={["ai", "analysis"]}
                        />
                    </div>
                )}
            </div>

            <style jsx>{`
        .agent-message-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1rem 0;
            background-color: transparent;
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

        .thinking-process {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            padding: 0.75rem;
            background: var(--bg-surface);
            border-radius: 0.5rem;
            border: 1px solid var(--stroke);
            opacity: 0.7;
        }

        .thinking-step {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.8125rem;
            color: var(--text-muted);
        }

        .thinking-step .dot {
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: var(--stroke);
        }

        .direct-answer {
            font-weight: 400;
        }

        .message-section {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
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

        .insight-section {
            background: linear-gradient(to right, rgba(79, 70, 229, 0.05), transparent);
            padding: 1rem;
            border-left: 3px solid var(--accent-purple);
            border-radius: 0 0.5rem 0.5rem 0;
        }
      `}</style>
        </motion.div>
    );
}
