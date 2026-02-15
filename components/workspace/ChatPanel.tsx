"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
import SuggestedQueryChips from "@/components/interactive/SuggestedQueryChips";
import AgentMessage from "@/components/workspace/AgentMessage";
import { Message } from "@/store/chatStore";
import { DataDNA } from "@/store/dataStore";
import { RefObject } from "react";

interface ChatPanelProps {
  messages: Message[];
  dataDNA: DataDNA | null;
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isStreaming: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
}

export default function ChatPanel({
  messages,
  dataDNA,
  input,
  setInput,
  handleSend,
  handleKeyDown,
  isStreaming,
  scrollRef
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
                    onQueryClick={(q) => setInput(q)}
                  />
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="message-list">
              {messages.map((msg) => (
                msg.type === "user" ? (
                  <div key={msg.id} className="user-message">{msg.content}</div>
                ) : (
                  <div key={msg.id} className="agent-message-wrapper">
                    <AgentMessage message={msg} />
                  </div>
                )
              ))}
              {isStreaming && (
                <div className="streaming-indicator animate-pulse">
                  <span>InsightX Lead is analyzing...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="chat-input-fixed">
        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your data..."
            rows={1}
          />
          <button className="send-btn" onClick={handleSend} disabled={!input.trim() || isStreaming}>
            <Send size={18} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .chat-panel { flex: 1; display: flex; flex-direction: column; background: var(--bg); overflow: hidden; }
        .chat-scroll-area { flex: 1; overflow-y: auto; padding: 2rem; }
        .chat-content-constrained { max-width: 850px; margin: 0 auto; width: 100%; }

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
        }

        .suggestions-container {
          background: var(--bg-surface);
          border: 1px solid var(--stroke);
          border-radius: 1rem;
          padding: 2rem;
          width: 100%;
          max-width: 600px;
        }

        .suggestions-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: 1.25rem;
        }

        .message-list { display: flex; flex-direction: column; gap: 2.5rem; padding-bottom: 2rem; }
        
        .user-message { 
          align-self: flex-end; 
          background: var(--fg); 
          color: var(--bg); 
          padding: 1rem 1.5rem; 
          border-radius: 1.25rem 1.25rem 0.25rem 1.25rem; 
          max-width: 75%; 
          font-size: 1rem;
          line-height: 1.5;
        }
        
        .agent-message-wrapper { width: 100%; }

        .streaming-indicator {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-style: italic;
          padding: 1rem;
        }

        .chat-input-fixed { padding: 2rem; border-top: 1px solid var(--stroke); background: var(--bg); }
        
        .input-container { 
          max-width: 850px; 
          margin: 0 auto; 
          background: var(--bg-surface); 
          border: 1px solid var(--stroke); 
          border-radius: 1rem; 
          padding: 0.75rem; 
          display: flex; 
          align-items: flex-end; 
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .input-container:focus-within {
          border-color: var(--fg);
          box-shadow: 0 8px 32px rgba(0,0,0,0.05);
        }

        .input-container textarea { 
          flex: 1; 
          background: transparent; 
          border: none; 
          outline: none; 
          padding: 0.75rem; 
          font-size: 1.125rem; 
          resize: none; 
          max-height: 200px; 
          color: var(--fg);
          font-family: inherit;
        }
        
        .send-btn { 
          background: var(--fg); 
          color: var(--bg); 
          width: 3rem; 
          height: 3rem; 
          border-radius: 0.75rem; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          cursor: pointer; 
          border: none;
          transition: transform 0.2s;
        }
        
        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .send-btn:disabled { opacity: 0.2; cursor: not-allowed; }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--stroke); border-radius: 2px; }
      `}</style>
    </main>
  );
}
