"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import AgentBadge from "./AgentBadge";
import ThinkingProcess from "./ThinkingProcess";
import CodeBlock from "../data/CodeBlock";
import InsightCard from "../data/InsightCard";
import ComposerResponseRenderer from "./ComposerResponseRenderer";
import { parseComposerResponse, isComposerResponse } from "@/lib/utils/response-parser";
import type { Message } from "@/store/chatStore";

interface AgentMessageProps {
  message: Message;
  onFollowUpClick?: (question: string) => void;
}

export default function AgentMessage({ message, onFollowUpClick }: AgentMessageProps) {
  // Check if this is a structured Composer response
  const isStructuredResponse = message.content && isComposerResponse(message.content);
  const parsedResponse = isStructuredResponse ? parseComposerResponse(message.content) : null;

  return (
    <motion.div
      className="agent-message"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="message-header">
        <AgentBadge type={message.type} />
      </div>

      <div className="message-body">
        {/* Thinking Process */}
        {message.thinking && message.thinking.length > 0 && (
          <ThinkingProcess steps={message.thinking} />
        )}

        {/* Structured Composer Response */}
        {parsedResponse ? (
          <ComposerResponseRenderer
            response={parsedResponse}
            onFollowUpClick={onFollowUpClick}
          />
        ) : (
          /* Fallback: Regular Markdown Content */
          message.content && (
            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre: ({ children }) => <>{children}</>,
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeContent = String(children).replace(/\n$/, "");

                    if (!inline) {
                      return (
                        <CodeBlock
                          language={match ? match[1] : "text"}
                          code={codeContent}
                        />
                      );
                    }
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  table: ({ children }) => (
                    <div className="table-wrapper">
                      <table>{children}</table>
                    </div>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )
        )}

        {/* Code Blocks */}
        {message.code?.sql && <CodeBlock code={message.code.sql} language="sql" />}
        {message.code?.python && <CodeBlock code={message.code.python} language="python" />}

        {/* Insight Card */}
        {message.insight && (
          <div className="insights-row">
            <InsightCard
              id={message.insight.title}
              title={message.insight.title}
              metric={message.insight.metric}
              trend={message.insight.trend ?? "neutral"}
              trendValue={message.insight.trendValue ?? "—"}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .agent-message {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-width: 85%;
        }

        .message-header {
          display: flex;
          align-items: center;
        }

        .message-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        /* Markdown Styles */
        .markdown-content {
          font-size: 0.875rem;
          line-height: 1.6;
          color: var(--fg);
        }

        .markdown-content :global(p) {
          margin-bottom: 0.75rem;
        }

        .markdown-content :global(p:last-child) {
          margin-bottom: 0;
        }

        .markdown-content :global(a) {
          color: var(--accent);
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .markdown-content :global(ul), .markdown-content :global(ol) {
          margin-left: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .markdown-content :global(li) {
          margin-bottom: 0.25rem;
        }

        .markdown-content :global(h1), 
        .markdown-content :global(h2), 
        .markdown-content :global(h3), 
        .markdown-content :global(h4) {
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: var(--fg);
        }

        .markdown-content :global(h1) { font-size: 1.5rem; }
        .markdown-content :global(h2) { font-size: 1.25rem; }
        .markdown-content :global(h3) { font-size: 1.125rem; }

        .markdown-content :global(blockquote) {
          border-left: 3px solid var(--stroke);
          padding-left: 1rem;
          margin-left: 0;
          margin-bottom: 0.75rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .markdown-content :global(code) {
          background-color: var(--bg-surface);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.8em;
          color: var(--accent);
        }

        .markdown-content :global(.table-wrapper) {
          overflow-x: auto;
          margin-bottom: 1rem;
          border: 1px solid var(--stroke);
          border-radius: 0.5rem;
        }

        .markdown-content :global(table) {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .markdown-content :global(th) {
          background-color: var(--bg-surface);
          text-align: left;
          padding: 0.75rem.1rem;
          border-bottom: 1px solid var(--stroke);
          font-weight: 600;
        }

        .markdown-content :global(td) {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--stroke);
        }

        .markdown-content :global(tr:last-child td) {
          border-bottom: none;
        }

        .insights-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
      `}</style>
    </motion.div>
  );
}
