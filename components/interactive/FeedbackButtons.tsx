"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface FeedbackButtonsProps {
    messageId: string;
    onFeedback?: (messageId: string, feedback: "up" | "down") => void;
}

export default function FeedbackButtons({
    messageId,
    onFeedback,
}: FeedbackButtonsProps) {
    const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

    const handleFeedback = (type: "up" | "down") => {
        setFeedback(type);
        onFeedback?.(messageId, type);
    };

    return (
        <div className="feedback-buttons">
            <button
                className={`feedback-btn ${feedback === "up" ? "active" : ""}`}
                onClick={() => handleFeedback("up")}
                disabled={feedback !== null}
            >
                <ThumbsUp size={14} />
            </button>
            <button
                className={`feedback-btn ${feedback === "down" ? "active" : ""}`}
                onClick={() => handleFeedback("down")}
                disabled={feedback !== null}
            >
                <ThumbsDown size={14} />
            </button>

            <style jsx>{`
        .feedback-buttons {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .feedback-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.375rem;
          background: none;
          border: 1px solid var(--border);
          border-radius: 0.25rem;
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast) ease;
        }

        .feedback-btn:hover:not(:disabled) {
          border-color: var(--accent-blue);
          color: var(--text-primary);
        }

        .feedback-btn.active {
          background-color: var(--accent-blue);
          border-color: var(--accent-blue);
          color: white;
        }

        .feedback-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      `}</style>
        </div>
    );
}
