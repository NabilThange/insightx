"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

interface ThinkingProcessProps {
    steps: string[];
    currentStep?: number;
}

export default function ThinkingProcess({
    steps,
    currentStep = steps.length - 1,
}: ThinkingProcessProps) {
    return (
        <div className="thinking-process">
            {steps.map((step, index) => {
                const isComplete = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                    <motion.div
                        key={index}
                        className={`step ${isComplete ? "complete" : ""} ${isCurrent ? "current" : ""}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="step-icon">
                            {isComplete && <CheckCircle2 size={16} />}
                            {isCurrent && <Loader2 size={16} className="spinner" />}
                            {!isComplete && !isCurrent && <div className="dot" />}
                        </div>
                        <span className="step-text">{step}</span>
                    </motion.div>
                );
            })}

            <style jsx>{`
        .thinking-process {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background-color: var(--bg-base);
          border-left: 2px solid var(--accent-blue);
          border-radius: 0.5rem;
          margin: 0.75rem 0;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .step.complete {
          color: var(--accent-green);
        }

        .step.current {
          color: var(--accent-blue);
        }

        .step-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--border);
        }

        .step-text {
          flex: 1;
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
