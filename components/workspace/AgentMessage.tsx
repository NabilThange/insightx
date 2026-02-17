"use client";

import { motion } from "framer-motion";
import { Sparkles, Terminal, Database, Shield, Layout, Fingerprint, Info, ChevronRight } from "lucide-react";
import CodeBlock from "../data/CodeBlock";
import InsightCard from "../data/InsightCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "@/store/chatStore";
import ComposerResponseRenderer from "../chat/ComposerResponseRenderer";
import { parseComposerResponse, isComposerResponse } from "@/lib/utils/response-parser";

interface AgentMessageProps {
    message: Message;
    onFollowUpClick?: (question: string) => void;
}

export default function AgentMessage({ message, onFollowUpClick }: AgentMessageProps) {
    const { type, content, thinking, code, insight } = message;

    const openDrawer = (drawer: string) => {
        window.dispatchEvent(new CustomEvent('open-drawer', { detail: { drawer } }));
    };

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

    // Check if content is a Composer response (structured JSON)
    const isStructuredResponse = typeof content === 'object' && content !== null && 'text' in content;
    const composerResponse = isStructuredResponse ? content : null;

    // If it's a string, check if it's a Composer response wrapped in markdown
    const parsedComposerResponse = typeof content === 'string' && isComposerResponse(content) 
        ? parseComposerResponse(content) 
        : null;

    const finalComposerResponse = composerResponse || parsedComposerResponse;

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

                {/* Direct Answer with Markdown Support or Composer Response */}
                {finalComposerResponse ? (
                    <div className="composer-response">
                        <ComposerResponseRenderer 
                            response={finalComposerResponse} 
                            onFollowUpClick={onFollowUpClick}
                        />
                    </div>
                ) : (
                    <div className="direct-answer">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || "");
                                    return !inline && match ? (
                                        <CodeBlock
                                            code={String(children).replace(/\n$/, "")}
                                            language={match[1]}
                                        />
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                            }}
                        >
                            {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                        </ReactMarkdown>
                    </div>
                )}

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

                {/* Artifact Drawer Links */}
                {(code || insight) && (
                    <div className="artifact-links">
                        <span className="section-label">Available Artifacts</span>
                        <div className="links-row">
                            {code?.sql && (
                                <button className="artifact-btn sql" onClick={() => openDrawer("sql")}>
                                    <Database size={12} />
                                    <span>Open SQL View</span>
                                    <ChevronRight size={12} className="ml-auto" />
                                </button>
                            )}
                            {code?.python && (
                                <button className="artifact-btn python" onClick={() => openDrawer("python")}>
                                    <Terminal size={12} />
                                    <span>Open Python Sandbox</span>
                                    <ChevronRight size={12} className="ml-auto" />
                                </button>
                            )}
                            <button className="artifact-btn dna" onClick={() => openDrawer("dataDNA")}>
                                <Fingerprint size={12} />
                                <span>View Data DNA</span>
                                <ChevronRight size={12} className="ml-auto" />
                            </button>
                        </div>
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

        .direct-answer h1, .direct-answer h2, .direct-answer h3 {
            margin: 1.5rem 0 1rem 0;
            color: var(--fg);
            line-height: 1.3;
        }

        .direct-answer h1 { font-size: 1.5rem; border-bottom: 1px solid var(--stroke); padding-bottom: 0.5rem; }
        .direct-answer h2 { font-size: 1.25rem; }
        .direct-answer h3 { font-size: 1.1rem; }

        .direct-answer p {
            margin-bottom: 1rem;
        }

        .direct-answer ul, .direct-answer ol {
            margin-bottom: 1rem;
            padding-left: 1.5rem;
        }

        .direct-answer li {
            margin-bottom: 0.5rem;
        }

        .direct-answer strong {
            font-weight: 700;
            color: var(--fg);
        }

        .direct-answer blockquote {
            border-left: 4px solid var(--stroke);
            padding-left: 1rem;
            font-style: italic;
            color: var(--text-muted);
            margin: 1rem 0;
        }

        .direct-answer code:not(pre code) {
            background: var(--bg-surface);
            padding: 0.2rem 0.4rem;
            border-radius: 0.3rem;
            font-family: var(--font-mono);
            font-size: 0.9em;
            border: 1px solid var(--stroke);
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

        .artifact-links {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px dashed var(--stroke);
        }

        .links-row {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .artifact-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0.75rem;
            background: var(--bg-surface);
            border: 1px solid var(--stroke);
            border-radius: 0.5rem;
            font-size: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            color: var(--text-muted);
            min-width: 160px;
        }

        .artifact-btn:hover {
            border-color: var(--fg);
            color: var(--fg);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .artifact-btn.sql:hover { border-color: var(--accent-blue); color: var(--accent-blue); }
        .artifact-btn.python:hover { border-color: var(--accent-green); color: var(--accent-green); }
        .artifact-btn.dna:hover { border-color: var(--accent-purple); color: var(--accent-purple); }

        .ml-auto { margin-left: auto; }
      `}</style>
        </motion.div>
    );
}
