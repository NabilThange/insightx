"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim() || disabled) return;
        onSend(input);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-input-container">
            <div className="input-wrapper">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a follow-up question..."
                    rows={3}
                    disabled={disabled}
                />
                <button
                    className="send-btn"
                    onClick={handleSend}
                    disabled={!input.trim() || disabled}
                >
                    <Send size={20} />
                </button>
            </div>

            <style jsx>{`
        .chat-input-container {
          padding: 1.5rem;
          border-top: 1px solid var(--border);
          background-color: var(--bg-surface);
        }

        .input-wrapper {
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
        }

        .input-wrapper textarea {
          flex: 1;
          padding: 0.75rem 1rem;
          background-color: var(--bg-base);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          font-family: inherit;
          font-size: 0.875rem;
          color: var(--text-primary);
          resize: none;
          line-height: 1.5;
          transition: all var(--transition-fast) ease;
        }

        .input-wrapper textarea:focus {
          outline: none;
          border-color: var(--accent-blue);
        }

        .input-wrapper textarea::placeholder {
          color: var(--text-muted);
        }

        .input-wrapper textarea:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-btn {
          padding: 0.75rem;
          background-color: var(--accent-blue);
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all var(--transition-fast) ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 127, 245, 0.3);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
        </div>
    );
}
