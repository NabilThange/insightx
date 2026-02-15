"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Sparkles } from "lucide-react";
import ColumnCard from "./ColumnCard";

type ScanStage = "reading" | "profiling" | "detecting" | "ready";

interface ScanningAnimationProps {
  filename: string;
  rowCount: number;
  columns: {
    name: string;
    type: "numeric" | "categorical" | "datetime" | "text" | "boolean" | "categorical_numeric";
    nullPercentage: number;
    sampleValues: string[];
  }[];
  patterns: string[];
  onComplete: () => void;
}

export default function ScanningAnimation({
  filename,
  rowCount,
  columns,
  patterns,
  onComplete,
}: ScanningAnimationProps) {
  const [stage, setStage] = useState<ScanStage>("reading");
  const [progress, setProgress] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState(0);
  const [visiblePatterns, setVisiblePatterns] = useState(0);
  const columnsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect for profiling stage
  useEffect(() => {
    if (stage === "profiling" && columnsContainerRef.current) {
      const container = columnsContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [visibleColumns, stage]);

  useEffect(() => {
    // Stage 1: Reading file (0-2s)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    const stage1Timer = setTimeout(() => {
      setStage("profiling");
      clearInterval(progressInterval);
    }, 2000);

    return () => {
      clearTimeout(stage1Timer);
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    if (stage === "profiling") {
      // Stage 2: Profiling rows - show columns one by one (2-5s)
      const columnInterval = setInterval(() => {
        setVisibleColumns((prev) => {
          if (prev >= columns.length) {
            clearInterval(columnInterval);
            setTimeout(() => setStage("detecting"), 500);
            return prev;
          }
          return prev + 1;
        });
      }, 300);

      return () => clearInterval(columnInterval);
    }
  }, [stage, columns.length]);

  useEffect(() => {
    if (stage === "detecting") {
      // Stage 3: Detecting patterns - show tags one by one (5-7s)
      const patternInterval = setInterval(() => {
        setVisiblePatterns((prev) => {
          if (prev >= patterns.length) {
            clearInterval(patternInterval);
            setTimeout(() => setStage("ready"), 500);
            return prev;
          }
          return prev + 1;
        });
      }, 400);

      return () => clearInterval(patternInterval);
    }
  }, [stage, patterns.length]);

  useEffect(() => {
    if (stage === "ready") {
      // Stage 4: Ready - wait 1.5s then complete
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 3000);

      return () => clearTimeout(completeTimer);
    }
  }, [stage, onComplete]);

  return (
    <div className="scanning-wrapper" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatePresence mode="wait">
        {/* Stage 1: Reading File */}
        {stage === "reading" && (
          <motion.div
            key="reading"
            className="stage-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Loader2 size={64} className="spinner" />
            <h3>Reading file...</h3>
            <p className="filename">{filename}</p>
            <div className="progress-container">
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="progress-stats">
                <span>{progress}%</span>
                <span>{(250000 * (progress / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })} rows processed</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stage 2: Profiling Rows */}
        {stage === "profiling" && (
          <motion.div
            key="profiling"
            className="stage-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Loader2 size={48} className="spinner" />
            <h3>Profiling {rowCount.toLocaleString()} rows...</h3>
            <p className="stage-subtitle">Analyzing column types and distributions</p>

            <div className="columns-container" ref={columnsContainerRef}>
              <div className="columns-grid">
                {columns.slice(0, visibleColumns).map((col, index) => (
                  <ColumnCard key={col.name} {...col} index={index} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Stage 3: Detecting Patterns */}
        {stage === "detecting" && (
          <motion.div
            key="detecting"
            className="stage-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Sparkles size={48} className="sparkle-icon" />
            <h3>Detecting patterns...</h3>
            <p className="stage-subtitle">Identifying insights and anomalies</p>

            <div className="patterns-container">
              {patterns.slice(0, visiblePatterns).map((pattern, index) => (
                <motion.div
                  key={pattern}
                  className="pattern-tag"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  {pattern}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stage 4: Ready */}
        {stage === "ready" && (
          <motion.div
            key="ready"
            className="stage-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 size={64} className="success-icon" />
            </motion.div>
            <h3>Data DNA Generated Successfully</h3>

            <div className="trust-indicators">
              <div className="trust-item">
                <CheckCircle2 size={16} className="trust-icon" />
                <span>File validation passed</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={16} className="trust-icon" />
                <span>Schema detected ({columns.length} cols)</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={16} className="trust-icon" />
                <span>{patterns.length} patterns identified</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={16} className="trust-icon" />
                <span>Statistical baselines calculated</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        /* No internal container styling - inherits from parent */
        
        .stage-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          width: 100%;
          max-width: 900px;
        }

        :global(.spinner) {
          color: var(--accent-blue);
          animation: spin 1s linear infinite;
        }

        :global(.sparkle-icon) {
          color: var(--accent-amber);
          animation: pulse 1.5s ease-in-out infinite;
        }

        :global(.success-icon) {
          color: var(--accent-green);
        }

        h3 {
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .filename {
          font-family: "Geist Mono", "JetBrains Mono", monospace;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .stage-subtitle {
          color: var(--text-muted);
          font-size: 1rem;
          margin-top: -0.75rem;
        }

        .success-message {
          color: var(--accent-green);
          font-weight: 500;
          font-size: 1rem;
        }

        .progress-container {
            width: 100%;
            max-width: 400px;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .progress-bar {
          width: 100%;
          height: 6px;
          background-color: var(--stroke);
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--fg);
          border-radius: 999px;
        }

        .progress-stats {
            display: flex;
            justify-content: space-between;
            font-size: 0.75rem;
            color: var(--text-muted);
            font-family: "Geist Mono", monospace;
        }

        .columns-container {
          width: 100%;
          max-height: 280px;
          overflow-y: auto;
          margin-top: 1rem;
          padding: 0.25rem;
          scroll-behavior: smooth;
          /* Custom scrollbar for webkit browsers */
          scrollbar-width: thin;
          scrollbar-color: var(--stroke) transparent;
        }

        .columns-container::-webkit-scrollbar {
          width: 6px;
        }

        .columns-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .columns-container::-webkit-scrollbar-thumb {
          background-color: var(--stroke);
          border-radius: 3px;
        }

        .columns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
          width: 100%;
          /* margin-top removed as handled by container */
        }

        .patterns-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
          margin-top: 1rem;
        }

        .pattern-tag {
          padding: 0.5rem 1rem;
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pattern-tag::before {
          content: "✓";
          color: var(--accent-green);
          font-weight: 700;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }

        .trust-indicators {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-top: 1rem;
            background: var(--bg-surface);
            padding: 1.5rem;
            border-radius: 0.5rem;
            border: 1px solid var(--stroke);
            width: 100%;
            max-width: 400px;
        }

        .trust-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 0.875rem;
            color: var(--fg);
        }

        .trust-icon {
            color: var(--accent-green);
        }
      `}</style>
    </div>
  );
}
