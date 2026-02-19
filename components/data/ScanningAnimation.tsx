"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Sparkles, ServerCog, HardDriveUpload } from "lucide-react";
import ColumnCard from "./ColumnCard";

export type AnimationStatus = "idle" | "uploading" | "processing" | "complete";

interface ScanningAnimationProps {
  status: AnimationStatus;
  uploadProgress: number;
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

type VisualStage = "idle" | "profiling" | "detecting" | "ready";

export default function ScanningAnimation({
  status,
  uploadProgress,
  filename,
  rowCount,
  columns,
  patterns,
  onComplete,
}: ScanningAnimationProps) {
  const [visualStage, setVisualStage] = useState<VisualStage>("idle");
  const [visibleColumns, setVisibleColumns] = useState(0);
  const [visiblePatterns, setVisiblePatterns] = useState(0);
  const columnsContainerRef = useRef<HTMLDivElement>(null);

  // Sync internal visual stage with external status
  useEffect(() => {
    if (status === "complete" && visualStage === "idle") {
      setVisualStage("profiling");
    }
  }, [status, visualStage]);

  // Auto-scroll effect for profiling stage
  useEffect(() => {
    if (visualStage === "profiling" && columnsContainerRef.current) {
      const container = columnsContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [visibleColumns, visualStage]);

  // Visual Animation Sequence (only runs when status is complete)
  useEffect(() => {
    if (visualStage === "profiling") {
      // Stage 1: Profiling rows - show columns one by one
      const columnInterval = setInterval(() => {
        setVisibleColumns((prev) => {
          if (prev >= columns.length) {
            clearInterval(columnInterval);
            setTimeout(() => setVisualStage("detecting"), 500);
            return prev;
          }
          return prev + 1;
        });
      }, 200); // Faster reveal

      return () => clearInterval(columnInterval);
    }
  }, [visualStage, columns.length]);

  useEffect(() => {
    if (visualStage === "detecting") {
      // Stage 2: Detecting patterns - show tags one by one
      const patternInterval = setInterval(() => {
        setVisiblePatterns((prev) => {
          if (prev >= patterns.length) {
            clearInterval(patternInterval);
            setTimeout(() => setVisualStage("ready"), 500);
            return prev;
          }
          return prev + 1;
        });
      }, 300);

      return () => clearInterval(patternInterval);
    }
  }, [visualStage, patterns.length]);

  useEffect(() => {
    if (visualStage === "ready") {
      // Stage 3: Ready - wait 1.5s then complete
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 2000);

      return () => clearTimeout(completeTimer);
    }
  }, [visualStage, onComplete]);

  return (
    <div className="scanning-wrapper" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AnimatePresence mode="wait">
        {/* Stage 1: Uploading */}
        {status === "uploading" && (
          <motion.div
            key="uploading"
            className="stage-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <HardDriveUpload size={64} className="pulse-icon" />
            <h3>Uploading Data...</h3>
            <p className="filename">{filename}</p>
            <div className="progress-container">
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: "0%" }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="progress-stats">
                <span>{uploadProgress}%</span>
                <span>Compressing & Encrypting...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stage 2: Processing (Backend Work) */}
        {status === "processing" && (
          <motion.div
            key="processing"
            className="stage-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ServerCog size={64} className="spinner" />
            <h3>Analyzing Structure...</h3>
            <p className="stage-subtitle">AI Agents are scanning for schema & patterns</p>

            <div className="processing-steps">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="step-item"
              >
                <CheckCircle2 size={16} className="text-green-500" />
                <span>Upload Complete</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 }}
                className="step-item active"
              >
                <Loader2 size={14} className="animate-spin" />
                <span>Generating Data DNA...</span>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Stage 3: Visualizing Results (Profiling) */}
        {status === "complete" && visualStage === "profiling" && (
          <motion.div
            key="profiling"
            className="stage-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Loader2 size={48} className="spinner" />
            <h3>Profiling {rowCount?.toLocaleString() || "..."} rows...</h3>
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

        {/* Stage 4: Visualizing Results (Detecting) */}
        {status === "complete" && visualStage === "detecting" && (
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

        {/* Stage 5: Ready */}
        {status === "complete" && visualStage === "ready" && (
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

        :global(.pulse-icon) {
          color: var(--fg);
          animation: pulse 2s ease-in-out infinite;
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

        .processing-steps {
           display: flex;
           flex-direction: column;
           gap: 0.5rem;
           margin-top: 1rem;
           align-items: flex-start;
           min-width: 200px;
        }

        .step-item {
           display: flex;
           align-items: center;
           gap: 0.5rem;
           font-size: 0.9rem;
           color: var(--text-muted);
        }
        
        .step-item.active {
           color: var(--fg);
           font-weight: 500;
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
