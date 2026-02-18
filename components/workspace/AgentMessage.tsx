"use client";

import React from "react";

import { motion } from "framer-motion";
import { Sparkles, Terminal, Database, Shield, CheckIcon, Loader2, Fingerprint, ChevronRight } from "lucide-react";
import CodeBlock from "../data/CodeBlock";
import InsightCard from "../data/InsightCard";
import { MessageResponse } from "@/components/ai-elements/message";
import {
    ChainOfThought,
    ChainOfThoughtHeader,
    ChainOfThoughtContent,
    ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import type { Message } from "@/store/chatStore";
import ComposerResponseRenderer from "../chat/ComposerResponseRenderer";
import { parseComposerResponse, isComposerResponse } from "@/lib/utils/response-parser";

interface AgentMessageProps {
    message: Message;
    onFollowUpClick?: (question: string) => void;
    /** True when this is the last message and thinking is actively streaming */
    isThinkingStreaming?: boolean;
}

export default function AgentMessage({ message, onFollowUpClick, isThinkingStreaming = false }: AgentMessageProps) {
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
                {/* Thinking Process — ChainOfThought collapsible block */}
                {thinking && thinking.length > 0 && (() => {
                    // A LucideIcon-compatible spinning loader for the active step
                    const SpinningLoader = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
                        <Loader2 className={`${className ?? ""} animate-spin`} {...props as any} />
                    );

                    return (
                        <ChainOfThought defaultOpen={isThinkingStreaming}>
                            <ChainOfThoughtHeader>
                                {isThinkingStreaming
                                    ? "Thinking…"
                                    : `Reasoned through ${thinking.length} step${thinking.length !== 1 ? "s" : ""}`
                                }
                            </ChainOfThoughtHeader>
                            <ChainOfThoughtContent>
                                {thinking.map((step, i) => {
                                    const isLast = i === thinking.length - 1;
                                    const status = isThinkingStreaming && isLast ? "active" : "complete";
                                    const Icon = isThinkingStreaming && isLast ? SpinningLoader : CheckIcon;
                                    return (
                                        <ChainOfThoughtStep
                                            key={i}
                                            icon={Icon as any}
                                            label={step}
                                            status={status}
                                        />
                                    );
                                })}
                            </ChainOfThoughtContent>
                        </ChainOfThought>
                    );
                })()}

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
                        <MessageResponse
                            parseIncompleteMarkdown={true}
                            components={{
                                p: ({ children, ...props }: any) => (
                                    <p className="md-p" {...props}>{children}</p>
                                ),
                                strong: ({ children }: any) => (
                                    <strong className="md-strong">{children}</strong>
                                ),
                                h1: ({ children }: any) => (
                                    <h1 className="md-h1">{children}</h1>
                                ),
                                h2: ({ children }: any) => (
                                    <h2 className="md-h2">{children}</h2>
                                ),
                                h3: ({ children }: any) => (
                                    <h3 className="md-h3">{children}</h3>
                                ),
                                h4: ({ children }: any) => (
                                    <h4 className="md-h4">{children}</h4>
                                ),
                                li: ({ children }: any) => (
                                    <li className="md-li">{children}</li>
                                ),
                                a: ({ href, children }: any) => (
                                    <a href={href} className="md-a" target="_blank" rel="noopener noreferrer">{children}</a>
                                ),
                            }}
                        >
                            {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                        </MessageResponse>
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

        /* Reasoning block styles are in reasoning.tsx global styles */

        /* ── MessageResponse (streamdown) overrides ── */
        .direct-answer {
            font-size: 0.9375rem;
            line-height: 1.65;
            font-weight: 400;
            color: var(--fg);
        }

        /* Headings */
        .direct-answer :global(.md-h1),
        .direct-answer h1 {
            font-size: 1.5rem;
            font-weight: 600;
            letter-spacing: -0.025em;
            color: var(--fg);
            margin: 1.25rem 0 0.5rem;
            line-height: 1.2;
            border-bottom: 1px solid var(--stroke);
            padding-bottom: 0.5rem;
        }
        .direct-answer :global(.md-h2),
        .direct-answer h2 {
            font-size: 1.125rem;
            font-weight: 600;
            letter-spacing: -0.015em;
            color: var(--fg);
            margin: 1rem 0 0.375rem;
            line-height: 1.3;
        }
        .direct-answer :global(.md-h3),
        .direct-answer h3 {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--fg);
            margin: 0.875rem 0 0.25rem;
        }
        .direct-answer :global(.md-h4),
        .direct-answer h4 {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 0.75rem 0 0.25rem;
        }

        /* Paragraphs */
        .direct-answer :global(.md-p),
        .direct-answer p {
            margin-bottom: 0.75rem;
            color: var(--fg);
        }
        .direct-answer p:last-child { margin-bottom: 0; }

        /* Bold */
        .direct-answer :global(.md-strong),
        .direct-answer strong {
            font-weight: 650;
            color: var(--fg);
        }

        /* Lists */
        .direct-answer ul, .direct-answer ol {
            margin: 0.375rem 0 0.75rem;
            padding-left: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        .direct-answer :global(.md-li),
        .direct-answer li {
            color: var(--fg);
            margin-bottom: 0;
        }

        /* Blockquote */
        .direct-answer blockquote {
            border-left: 2px solid var(--stroke);
            padding: 0.5rem 0 0.5rem 1rem;
            margin: 0.75rem 0;
            color: var(--text-muted);
            font-style: italic;
        }

        /* Links */
        .direct-answer :global(.md-a),
        .direct-answer a {
            color: var(--accent);
            text-decoration: underline;
            text-underline-offset: 2px;
        }

        /* HR */
        .direct-answer hr {
            border: none;
            border-top: 1px solid var(--stroke);
            margin: 1rem 0;
        }

        /* Inline code */
        .direct-answer code:not(pre code) {
            background: var(--bg-elevated);
            color: var(--accent);
            padding: 0.15em 0.4em;
            border-radius: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8em;
            border: 1px solid var(--stroke);
        }

        /* Tables */
        .direct-answer table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.8125rem;
            margin: 0.75rem 0;
            border: 1px solid var(--stroke);
            border-radius: 10px;
            overflow: hidden;
        }
        .direct-answer thead {
            background: var(--bg-elevated);
        }
        .direct-answer th {
            padding: 0.625rem 1rem;
            text-align: left;
            font-weight: 600;
            color: var(--fg);
            border-bottom: 1px solid var(--stroke);
            white-space: nowrap;
        }
        .direct-answer tr {
            border-bottom: 1px solid var(--stroke);
        }
        .direct-answer tr:last-child { border-bottom: none; }
        .direct-answer td {
            padding: 0.5rem 1rem;
            color: var(--fg);
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
