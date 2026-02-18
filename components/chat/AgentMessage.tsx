"use client";

import { motion } from "framer-motion";
import AgentBadge from "./AgentBadge";
import ThinkingProcess from "./ThinkingProcess";
import CodeBlock from "../data/CodeBlock";
import InsightCard from "../data/InsightCard";
import ComposerResponseRenderer from "./ComposerResponseRenderer";
import { MessageResponse } from "@/components/ai-elements/message";
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
          /* Fallback: MessageResponse (streamdown — GFM, math, code, streaming) */
          message.content && (
            <MessageResponse
              parseIncompleteMarkdown={true}
              components={{
                p: ({ children, ...props }: any) => (
                  <p style={{ marginBottom: '0.75rem', color: 'var(--fg)', lineHeight: 1.65 }} {...props}>{children}</p>
                ),
                strong: ({ children }: any) => (
                  <strong style={{ fontWeight: 650, color: 'var(--fg)' }}>{children}</strong>
                ),
                h1: ({ children }: any) => (
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--fg)', margin: '1.25rem 0 0.5rem', borderBottom: '1px solid var(--stroke)', paddingBottom: '0.5rem' }}>{children}</h1>
                ),
                h2: ({ children }: any) => (
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--fg)', margin: '1rem 0 0.375rem' }}>{children}</h2>
                ),
                h3: ({ children }: any) => (
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--fg)', margin: '0.875rem 0 0.25rem' }}>{children}</h3>
                ),
                a: ({ href, children }: any) => (
                  <a href={href} style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: '2px' }} target="_blank" rel="noopener noreferrer">{children}</a>
                ),
              }}
            >
              {message.content}
            </MessageResponse>
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

        .insights-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
      `}</style>
    </motion.div>
  );
}
