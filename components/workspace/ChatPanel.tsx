"use client";

import { motion } from "framer-motion";
import SuggestedQueryChips from "@/components/interactive/SuggestedQueryChips";
import AgentMessage from "@/components/workspace/AgentMessage";
import ChatInput from "@/components/chat/ChatInput";
import { Message } from "@/store/chatStore";
import { DataDNA } from "@/store/dataStore";
import { RefObject } from "react";

interface ChatPanelProps {
  messages: Message[];
  dataDNA: DataDNA | null;
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
  onFollowUpClick?: (question: string) => void;
}

export default function ChatPanel({
  messages,
  dataDNA,
  onSendMessage,
  isStreaming,
  scrollRef,
  onFollowUpClick
}: ChatPanelProps) {
  return (
    <main className="chat-panel">
      <div className="chat-scroll-area custom-scrollbar" ref={scrollRef}>
        <div className="chat-content-constrained">
          {messages.length === 0 ? (
            <div className="empty-state">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h1>Analyze {dataDNA?.filename ?? "Dataset"}</h1>
                <div className="suggestions-container">
                  <div className="suggestions-label">Quick Actions</div>
                  <SuggestedQueryChips
                    queries={(dataDNA?.patterns ?? []).map(p => `Analyze ${p}`)}
                    onQueryClick={(q) => onSendMessage(q)}
                  />
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="message-list">
              {messages.map((msg, index) => (
                msg.type === "user" ? (
                  <div key={msg.id} className="message-row user-row">
                    <motion.div
                      className="user-message-motion"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="user-message">
                        {msg.content}
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <motion.div
                    key={msg.id}
                    className="agent-message-wrapper"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <AgentMessage
                      message={msg}
                      onFollowUpClick={onFollowUpClick}
                      isThinkingStreaming={isStreaming && index === messages.length - 1}
                    />
                  </motion.div>
                )
              ))}
              {isStreaming && !messages.some(m => m.id?.startsWith('streaming_')) && (
                <motion.div
                  className="streaming-indicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <span>InsightX Lead is analyzing...</span>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="chat-input-fixed">
        <div className="input-container-outer">
          <ChatInput
            onSend={onSendMessage}
            onSubmit={(msg) => { if (msg.text) onSendMessage(msg.text); }}
            status={isStreaming ? "streaming" : "idle"}
            placeholder="Ask a question about your data..."
            disabled={isStreaming}
          />
        </div>
      </div>

      <style jsx>{`
        .chat-panel { 
          flex: 1; 
          display: flex; 
          flex-direction: column; 
          background: var(--bg); 
          overflow: hidden; 
        }

        .chat-scroll-area { 
          flex: 1; 
          overflow-y: auto; 
          padding: 2rem; 
          scroll-behavior: smooth;
        }

        .chat-content-constrained { 
          max-width: 850px; 
          margin: 0 auto; 
          width: 100%; 
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 12rem);
          text-align: center;
        }

        .empty-state h1 {
          font-size: 2.5rem;
          font-weight: 500;
          margin-bottom: 2rem;
          letter-spacing: -0.04em;
          color: var(--fg);
          font-family: 'PP Neue Montreal', system-ui, sans-serif;
        }

        .suggestions-container {
          background: var(--bg-surface);
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 1rem;
          padding: 2rem;
          width: 100%;
          max-width: 600px;
          transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        }

        .suggestions-container:hover {
          border-color: rgba(0, 0, 0, 0.2);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .suggestions-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: 1.25rem;
        }

        .message-list { 
          display: flex; 
          flex-direction: column; 
          gap: 2.5rem; 
          padding-bottom: 2rem; 
        }
        
        .message-row {
          display: flex;
          width: 100%;
          margin-bottom: 0.5rem;
        }

        .user-row {
          justify-content: flex-end;
        }

        .user-message-motion {
          display: flex;
          justify-content: flex-end;
          max-width: 80%;
        }

        .user-message { 
          background: var(--fg); 
          color: var(--bg); 
          padding: 1rem 1.5rem; 
          border-radius: 1.25rem 1.25rem 0.25rem 1.25rem; 
          font-size: 1rem;
          line-height: 1.5;
          font-family: 'PP Neue Montreal', system-ui, sans-serif;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          word-wrap: break-word;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.05);
          text-align: left;
        }

        .user-message:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }
        
        .agent-message-wrapper { 
          width: 100%; 
        }

        .streaming-indicator {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-style: italic;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .streaming-indicator span::after {
          content: '';
          display: inline-block;
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background: var(--text-muted);
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        .chat-input-fixed { 
          padding: 1rem 2rem 2rem; 
          border-top: none; 
          background: var(--bg);
          transition: border-color 0.3s ease;
        }

        .input-container-outer { 
          max-width: 850px; 
          margin: 0 auto; 
        }

        .custom-scrollbar::-webkit-scrollbar { 
          width: 4px; 
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(0, 0, 0, 0.12); 
          border-radius: 2px;
          transition: background 0.2s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 1000px) {
          .chat-scroll-area {
            padding: 1.5rem;
          }

          .chat-input-fixed {
            padding: 1rem 1.5rem 1.5rem;
          }

          .user-message {
            max-width: 90%;
            font-size: 0.9375rem;
            padding: 0.875rem 1.25rem;
          }

          .empty-state h1 {
            font-size: 2rem;
          }

          .suggestions-container {
            padding: 1.5rem;
          }
        }
      `}</style>
    </main>
  );
}
