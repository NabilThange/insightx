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

// Animation constants following design system
const ANIMATION_DURATIONS = {
  micro: 0.3,
  standard: 1,
  complex: 2,
  stagger: 0.1,
};

const EASING = {
  smooth: [0.23, 1, 0.32, 1] as const, // power3.inOut equivalent
  reveal: [0.16, 1, 0.3, 1] as const,  // power4.out equivalent
};

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
    <div className="scanning-wrapper">
      <AnimatePresence mode="wait">
        {/* Stage 1: Uploading */}
        {status === "uploading" && (
          <motion.div
            key="uploading"
            className="stage-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: ANIMATION_DURATIONS.micro, ease: EASING.reveal }}
          >
            <motion.div
              className="icon-container"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: ANIMATION_DURATIONS.standard, ease: EASING.smooth }}
            >
              <HardDriveUpload size={56} className="pulse-icon" strokeWidth={1.5} />
            </motion.div>
            
            <div className="text-content">
              <h3 className="stage-title">Uploading Data</h3>
              <p className="filename">{filename}</p>
            </div>

            <div className="progress-container">
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: "0%" }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                />
              </div>
              <div className="progress-stats">
                <span className="progress-percent">{uploadProgress}%</span>
                <span className="progress-label">Securing your data</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stage 2: Processing (Backend Work) */}
        {status === "processing" && (
          <motion.div
            key="processing"
            className="stage-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: ANIMATION_DURATIONS.micro, ease: EASING.reveal }}
          >
            <motion.div
              className="icon-container"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <ServerCog size={56} strokeWidth={1.5} />
            </motion.div>
            
            <div className="text-content">
              <h3 className="stage-title">Analyzing Structure</h3>
              <p className="stage-subtitle">AI agents scanning for patterns</p>
            </div>

            <div className="processing-steps">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: ANIMATION_DURATIONS.micro }}
                className="step-item step-complete"
              >
                <CheckCircle2 size={18} strokeWidth={2} />
                <span>Upload complete</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: ANIMATION_DURATIONS.micro }}
                className="step-item step-active"
              >
                <Loader2 size={16} className="animate-spin" strokeWidth={2} />
                <span>Generating Data DNA</span>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Stage 3: Visualizing Results (Profiling) */}
        {status === "complete" && visualStage === "profiling" && (
          <motion.div
            key="profiling"
            className="stage-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: ANIMATION_DURATIONS.micro, ease: EASING.reveal }}
          >
            <motion.div
              className="icon-container"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 size={48} strokeWidth={1.5} />
            </motion.div>
            
            <div className="text-content">
              <h3 className="stage-title">Profiling {rowCount?.toLocaleString() || "..."} rows</h3>
              <p className="stage-subtitle">Analyzing column types and distributions</p>
            </div>

            <div className="columns-container" ref={columnsContainerRef}>
              <div className="columns-grid">
                {columns.slice(0, visibleColumns).map((col, index) => (
                  <motion.div
                    key={col.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: index * ANIMATION_DURATIONS.stagger,
                      duration: ANIMATION_DURATIONS.micro,
                      ease: EASING.smooth
                    }}
                  >
                    <ColumnCard {...col} index={index} />
                  </motion.div>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: ANIMATION_DURATIONS.micro, ease: EASING.reveal }}
          >
            <motion.div
              className="icon-container"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles size={48} strokeWidth={1.5} />
            </motion.div>
            
            <div className="text-content">
              <h3 className="stage-title">Detecting patterns</h3>
              <p className="stage-subtitle">Identifying insights and anomalies</p>
            </div>

            <div className="patterns-container">
              {patterns.slice(0, visiblePatterns).map((pattern, index) => (
                <motion.div
                  key={pattern}
                  className="pattern-tag"
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.15,
                    duration: ANIMATION_DURATIONS.micro,
                    ease: EASING.smooth
                  }}
                >
                  <CheckCircle2 size={14} strokeWidth={2} />
                  <span>{pattern}</span>
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: EASING.smooth }}
          >
            <motion.div
              className="icon-container success"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 15
              }}
            >
              <CheckCircle2 size={64} strokeWidth={1.5} />
            </motion.div>
            
            <div className="text-content">
              <h3 className="stage-title">Data DNA Generated</h3>
              <p className="stage-subtitle">Ready to explore your insights</p>
            </div>

            <motion.div 
              className="trust-indicators"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: ANIMATION_DURATIONS.micro }}
            >
              <div className="trust-item">
                <CheckCircle2 size={16} strokeWidth={2} />
                <span>File validation passed</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={16} strokeWidth={2} />
                <span>Schema detected ({columns.length} columns)</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={16} strokeWidth={2} />
                <span>{patterns.length} patterns identified</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        /* Container - Full responsive layout */
        .scanning-wrapper {
          width: 100%;
          height: 100%;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          font-family: 'PP Neue Montreal', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Stage content - Centered with generous whitespace */
        .stage-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          width: 100%;
          max-width: 56rem;
          text-align: center;
        }

        /* Icon container - Consistent sizing */
        .icon-container {
          width: 5rem;
          height: 5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--fg);
          flex-shrink: 0;
        }

        .icon-container.success {
          color: var(--success, #2d5016);
        }

        /* Text content - Hierarchical typography */
        .text-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-width: 32rem;
        }

        .stage-title {
          font-size: 1.75rem;
          font-weight: 500;
          color: var(--fg);
          letter-spacing: -0.02rem;
          line-height: 1.2;
          margin: 0;
        }

        .stage-subtitle {
          font-size: 1rem;
          font-weight: 400;
          color: var(--fg);
          opacity: 0.6;
          line-height: 1.5;
          margin: 0;
        }

        .filename {
          font-family: 'Geist Mono', 'JetBrains Mono', monospace;
          font-size: 0.875rem;
          color: var(--fg);
          opacity: 0.5;
          margin: 0;
        }

        /* Progress bar - Clean and minimal */
        .progress-container {
          width: 100%;
          max-width: 24rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .progress-bar {
          width: 100%;
          height: 0.375rem;
          background-color: var(--loader-bg, #e0e0d8);
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--fg);
          border-radius: 9999px;
          transition: width 0.15s ease-out;
        }

        .progress-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          font-family: 'Geist Mono', monospace;
        }

        .progress-percent {
          color: var(--fg);
          font-weight: 500;
        }

        .progress-label {
          color: var(--fg);
          opacity: 0.5;
        }

        /* Processing steps - Clear hierarchy */
        .processing-steps {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: flex-start;
          min-width: 16rem;
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9375rem;
          color: var(--fg);
          opacity: 0.5;
          transition: opacity 0.3s;
        }

        .step-item.step-complete {
          opacity: 0.7;
          color: var(--success, #2d5016);
        }

        .step-item.step-active {
          opacity: 1;
          font-weight: 500;
        }

        /* Columns container - Scrollable grid */
        .columns-container {
          width: 100%;
          max-height: 20rem;
          overflow-y: auto;
          padding: 0.5rem;
          scroll-behavior: smooth;
          scrollbar-width: thin;
          scrollbar-color: var(--stroke, rgba(0,0,0,0.2)) transparent;
        }

        .columns-container::-webkit-scrollbar {
          width: 0.375rem;
        }

        .columns-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .columns-container::-webkit-scrollbar-thumb {
          background-color: var(--stroke, rgba(0,0,0,0.2));
          border-radius: 9999px;
        }

        .columns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
          gap: 1rem;
          width: 100%;
        }

        /* Patterns container - Flexible wrap */
        .patterns-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
          max-width: 40rem;
        }

        .pattern-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background-color: var(--bg, #f1efe7);
          border: 1px solid var(--stroke, rgba(0,0,0,0.2));
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--fg);
          transition: transform 0.2s;
        }

        .pattern-tag:hover {
          transform: translateY(-2px);
        }

        .pattern-tag :global(svg) {
          color: var(--success, #2d5016);
          flex-shrink: 0;
        }

        /* Trust indicators - Professional validation */
        .trust-indicators {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: var(--bg, #f1efe7);
          padding: 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid var(--stroke, rgba(0,0,0,0.2));
          width: 100%;
          max-width: 24rem;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9375rem;
          color: var(--fg);
        }

        .trust-item :global(svg) {
          color: var(--success, #2d5016);
          flex-shrink: 0;
        }

        /* Animations */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        :global(.pulse-icon) {
          animation: pulse 2s ease-in-out infinite;
        }

        :global(.animate-spin) {
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

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .scanning-wrapper {
            padding: 1rem;
          }

          .stage-title {
            font-size: 1.5rem;
          }

          .stage-subtitle {
            font-size: 0.9375rem;
          }

          .icon-container {
            width: 4rem;
            height: 4rem;
          }

          .icon-container :global(svg) {
            width: 48px;
            height: 48px;
          }

          .columns-grid {
            grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
            gap: 0.75rem;
          }

          .progress-container {
            max-width: 100%;
          }

          .trust-indicators {
            max-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .stage-title {
            font-size: 1.25rem;
          }

          .columns-grid {
            grid-template-columns: 1fr;
          }

          .patterns-container {
            gap: 0.5rem;
          }

          .pattern-tag {
            font-size: 0.8125rem;
            padding: 0.5rem 0.875rem;
          }
        }
      `}</style>
    </div>
  );
}
