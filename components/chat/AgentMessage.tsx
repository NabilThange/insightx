"use client";

import { motion } from "framer-motion";
import AgentBadge from "./AgentBadge";
import ThinkingProcess from "./ThinkingProcess";
import CodeBlock from "../data/CodeBlock";
import InsightCard from "../data/InsightCard";
import type { Message } from "@/store/chatStore";

interface AgentMessageProps {
    message: Message;
}

export default function AgentMessage({ message }: AgentMessageProps) {
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

                {/* Main Content */}
                {message.content && <p className="content">{message.content}</p>}

                {/* Code Blocks */}
                {message.code?.sql && <CodeBlock code={message.code.sql} language="sql" />}
                {message.code?.python && <CodeBlock code={message.code.python} language="python" />}

                {/* Insight Card */}
                {message.insight && (
                    <div className="insights-row">
                        <InsightCard
                            title={message.insight.title}
                            metric={message.insight.metric}
                            trend={message.insight.trend}
                            trendValue={message.insight.trendValue}
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

        .content {
          font-size: 0.875rem;
          line-height: 1.6;
          color: var(--text-primary);
          margin: 0;
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
