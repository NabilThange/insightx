"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface ThinkingProcessProps {
    steps: string[];
    currentStep?: number;
    isComplete?: boolean; // New prop to indicate if thinking is done
}

export default function ThinkingProcess({
    steps,
    currentStep = steps.length - 1,
    isComplete = false,
}: ThinkingProcessProps) {
    const [isExpanded, setIsExpanded] = useState(!isComplete); // Auto-collapse when complete

    const completedSteps = isComplete ? steps.length : currentStep;

    return (
        <div className="thinking-process-wrapper">
            {/* Header - Always visible */}
            <button
                className="thinking-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="header-left">
                    {isComplete ? (
                        <CheckCircle2 size={16} className="header-icon complete" />
                    ) : (
                        <Loader2 size={16} className="header-icon spinner" />
                    )}
                    <span className="header-text">
                        {isComplete
                            ? `Completed ${steps.length} steps`
                            : `Thinking... (${completedSteps}/${steps.length})`}
                    </span>
                </div>
                <div className="header-right">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </button>

            {/* Expandable content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="thinking-content"
                    >
                        <div className="steps-list">
                            {steps.map((step, index) => {
                                const isStepComplete = isComplete || index < currentStep;
                                const isCurrent = !isComplete && index === currentStep;

                                return (
                                    <motion.div
                                        key={index}
                                        className={`step ${isStepComplete ? "complete" : ""} ${isCurrent ? "current" : ""}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="step-icon">
                                            {isStepComplete && <CheckCircle2 size={14} />}
                                            {isCurrent && <Loader2 size={14} className="spinner" />}
                                            {!isStepComplete && !isCurrent && <div className="dot" />}
                                        </div>
                                        <span className="step-text">{step}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
        .thinking-process-wrapper {
          background-color: var(--bg-elevated);
          border: 1px solid var(--stroke);
          border-radius: 8px;
          margin: 0.75rem 0;
          overflow: hidden;
        }

        .thinking-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s ease;
          font-family: inherit;
        }

        .thinking-header:hover {
          background-color: var(--bg-surface);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .header-icon {
          flex-shrink: 0;
        }

        .header-icon.complete {
          color: var(--accent-green);
        }

        .header-icon.spinner {
          color: var(--accent);
        }

        .header-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--fg);
        }

        .header-right {
          color: var(--text-muted);
        }

        .thinking-content {
          overflow: hidden;
        }

        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0 1rem 1rem 1rem;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .step.complete {
          color: var(--accent-green);
        }

        .step.current {
          color: var(--accent);
        }

        .step-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--stroke);
        }

        .step-text {
          flex: 1;
          line-height: 1.4;
        }

        :global(.spinner) {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
        </div>
    );
}
