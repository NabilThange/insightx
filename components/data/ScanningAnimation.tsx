"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  CheckCircle2, 
  Database, 
  BarChart3, 
  AlertTriangle,
  TrendingUp,
  ArrowRight
} from "lucide-react";

export type AnimationStatus = "idle" | "uploading" | "processing" | "complete";

interface ExplorerData {
  row_count?: number;
  col_count?: number;
  columns?: Array<{
    name: string;
    type: string;
    dtype: string;
    null_pct?: number;
    unique_count?: number;
  }>;
  health?: {
    score?: number;
    grade?: string;
    completeness?: number;
    duplicate_rows?: number;
  };
  baselines?: Record<string, any>;
  correlations?: Array<{
    col_a: string;
    col_b: string;
    pearson_r: number;
    strength: string;
  }>;
  detected_patterns?: string[];
}

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
  explorerData?: ExplorerData | null;
  onComplete: () => void;
}

type SlideStage = "structure" | "columns" | "quality" | "statistics" | "patterns" | "ready";

// Animation constants
const SLIDE_DURATION = 2500; // ms per slide
const EASING = {
  smooth: [0.23, 1, 0.32, 1] as const,
  reveal: [0.16, 1, 0.3, 1] as const,
};

export default function ScanningAnimation({
  status,
  uploadProgress,
  filename,
  rowCount,
  columns,
  patterns,
  explorerData,
  onComplete,
}: ScanningAnimationProps) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState<SlideStage>("structure");
  const [completedSlides, setCompletedSlides] = useState<Set<SlideStage>>(new Set());
  const [finalProgress, setFinalProgress] = useState(0);

  const slides: SlideStage[] = ["structure", "columns", "quality", "statistics", "patterns", "ready"];

  // Auto-advance slides when status is complete
  useEffect(() => {
    if (status !== "complete" || !explorerData) return;

    const currentIndex = slides.indexOf(currentSlide);
    
    if (currentIndex < slides.length - 1) {
      const timer = setTimeout(() => {
        setCompletedSlides(prev => new Set([...prev, currentSlide]));
        setCurrentSlide(slides[currentIndex + 1]);
      }, SLIDE_DURATION);

      return () => clearTimeout(timer);
    } else if (currentSlide === "ready") {
      // Final slide - fill progress bar
      const progressTimer = setInterval(() => {
        setFinalProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressTimer);
            setTimeout(() => onComplete(), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 30);

      return () => clearInterval(progressTimer);
    }
  }, [status, currentSlide, explorerData, onComplete]);

  const handleEnterWorkspace = () => {
    const sessionId = localStorage.getItem("current_session_id");
    if (sessionId) {
      router.push(`/workspace/${sessionId}`);
    }
  };

  return (
    <div className="scanning-wrapper">
      <AnimatePresence mode="wait">
        {/* Uploading Stage */}
        {status === "uploading" && (
          <motion.div
            key="uploading"
            className="stage-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: EASING.reveal }}
          >
            <div className="stage-icon">
              <Database size={48} strokeWidth={1.5} className="pulse-icon" />
            </div>
            
            <div className="stage-header">
              <h3 className="stage-title">Uploading Dataset</h3>
              <p className="stage-subtitle">{filename}</p>
            </div>

            <div className="progress-bar-container">
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: "0%" }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                />
              </div>
              <div className="progress-label">
                <span className="progress-percent">{uploadProgress}%</span>
                <span className="progress-text">Securing your data</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Processing Stage */}
        {status === "processing" && (
          <motion.div
            key="processing"
            className="stage-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: EASING.reveal }}
          >
            <div className="stage-icon">
              <Loader2 size={48} strokeWidth={1.5} className="spin-icon" />
            </div>
            
            <div className="stage-header">
              <h3 className="stage-title">Analyzing Structure</h3>
              <p className="stage-subtitle">AI agents scanning for patterns</p>
            </div>

            <div className="step-list">
              <motion.div
                className="step-item step-complete"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CheckCircle2 size={16} strokeWidth={2} />
                <span>Upload complete</span>
              </motion.div>
              <motion.div
                className="step-item step-active"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Loader2 size={14} className="spin-icon" strokeWidth={2} />
                <span>Generating Data DNA</span>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Analysis Slides */}
        {status === "complete" && explorerData && (
          <motion.div
            key={`slide-${currentSlide}`}
            className="slide-container"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: EASING.smooth }}
          >
            {/* Slide Progress Indicators */}
            <div className="slide-indicators">
              {slides.map((slide, index) => (
                <div
                  key={slide}
                  className={`slide-indicator ${
                    completedSlides.has(slide) ? "completed" : 
                    slide === currentSlide ? "active" : "pending"
                  }`}
                />
              ))}
            </div>

            {/* Slide Content */}
            <div className="slide-content">
              {currentSlide === "structure" && (
                <StructureSlide data={explorerData} />
              )}
              {currentSlide === "columns" && (
                <ColumnsSlide data={explorerData} />
              )}
              {currentSlide === "quality" && (
                <QualitySlide data={explorerData} />
              )}
              {currentSlide === "statistics" && (
                <StatisticsSlide data={explorerData} />
              )}
              {currentSlide === "patterns" && (
                <PatternsSlide data={explorerData} patterns={patterns} />
              )}
              {currentSlide === "ready" && (
                <ReadySlide 
                  data={explorerData} 
                  progress={finalProgress}
                  onEnterWorkspace={handleEnterWorkspace}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .scanning-wrapper {
          width: 100%;
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          font-family: 'PP Neue Montreal', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .stage-container,
        .slide-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          width: 100%;
          max-width: 48rem;
          text-align: center;
        }

        .stage-icon {
          width: 5rem;
          height: 5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--fg);
        }

        .stage-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
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

        .progress-bar-container {
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
        }

        .progress-label {
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

        .progress-text {
          color: var(--fg);
          opacity: 0.5;
        }

        .step-list {
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
        }

        .step-item.step-complete {
          opacity: 0.7;
          color: var(--success, #2d5016);
        }

        .step-item.step-active {
          opacity: 1;
          font-weight: 500;
        }

        .slide-indicators {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .slide-indicator {
          width: 2.5rem;
          height: 0.25rem;
          background: var(--loader-bg, #e0e0d8);
          border-radius: 9999px;
          transition: all 0.3s;
        }

        .slide-indicator.completed {
          background: var(--success, #2d5016);
        }

        .slide-indicator.active {
          background: var(--fg);
          width: 3.5rem;
        }

        .slide-content {
          width: 100%;
        }

        .slide-card {
          background: var(--bg, #f1efe7);
          border: 1px solid var(--stroke, rgba(0,0,0,0.2));
          border-radius: 0.75rem;
          padding: 1.5rem;
          text-align: left;
        }

        .slide-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .slide-card-icon {
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--loader-bg, #e0e0d8);
          border-radius: 0.5rem;
          color: var(--fg);
        }

        .slide-card-title {
          font-size: 1.125rem;
          font-weight: 500;
          color: var(--fg);
          margin: 0;
        }

        .data-grid {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.75rem 1.5rem;
          font-family: 'Geist Mono', monospace;
          font-size: 0.875rem;
        }

        .data-key {
          color: var(--fg);
          opacity: 0.6;
          font-weight: 500;
        }

        .data-value {
          color: var(--fg);
          font-weight: 500;
        }

        .data-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 12rem;
          overflow-y: auto;
        }

        .data-list-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          background: var(--loader-bg, #e0e0d8);
          border-radius: 0.375rem;
          font-family: 'Geist Mono', monospace;
          font-size: 0.8125rem;
        }

        .pattern-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .pattern-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--loader-bg, #e0e0d8);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .pattern-item :global(svg) {
          flex-shrink: 0;
          margin-top: 0.125rem;
          color: var(--success, #2d5016);
        }

        .ready-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
        }

        .ready-icon {
          width: 4rem;
          height: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--success, #2d5016);
        }

        .ready-title {
          font-size: 1.5rem;
          font-weight: 500;
          color: var(--fg);
          margin: 0;
        }

        .ready-stats {
          display: flex;
          gap: 2rem;
          font-family: 'Geist Mono', monospace;
        }

        .ready-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .ready-stat-value {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--fg);
        }

        .ready-stat-label {
          font-size: 0.75rem;
          color: var(--fg);
          opacity: 0.6;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .workspace-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          height: 44px;
          padding: 0 1.5rem;
          background: var(--fg);
          color: var(--bg);
          border: 1px solid var(--fg);
          border-radius: 0.625rem;
          font-size: 0.9375rem;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
        }

        .workspace-button:hover {
          opacity: 0.9;
        }

        .workspace-button:active {
          transform: scale(0.98);
        }

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

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        :global(.pulse-icon) {
          animation: pulse 2s ease-in-out infinite;
        }

        :global(.spin-icon) {
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .scanning-wrapper {
            padding: 1rem;
          }

          .stage-title {
            font-size: 1.5rem;
          }

          .ready-stats {
            gap: 1rem;
          }

          .data-grid {
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </div>
  );
}

// Slide Components
function StructureSlide({ data }: { data: ExplorerData }) {
  return (
    <motion.div
      className="slide-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="slide-card-header">
        <div className="slide-card-icon">
          <Database size={20} strokeWidth={1.5} />
        </div>
        <h4 className="slide-card-title">Dataset Structure</h4>
      </div>
      <div className="data-grid">
        <span className="data-key">Rows</span>
        <span className="data-value">{data.row_count?.toLocaleString() || "—"}</span>
        
        <span className="data-key">Columns</span>
        <span className="data-value">{data.col_count || "—"}</span>
        
        <span className="data-key">Total Cells</span>
        <span className="data-value">
          {data.row_count && data.col_count 
            ? (data.row_count * data.col_count).toLocaleString() 
            : "—"}
        </span>
      </div>
    </motion.div>
  );
}

function ColumnsSlide({ data }: { data: ExplorerData }) {
  const columns = data.columns?.slice(0, 8) || [];
  
  return (
    <motion.div
      className="slide-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="slide-card-header">
        <div className="slide-card-icon">
          <BarChart3 size={20} strokeWidth={1.5} />
        </div>
        <h4 className="slide-card-title">Column Types</h4>
      </div>
      <div className="data-list">
        {columns.map((col, index) => (
          <motion.div
            key={col.name}
            className="data-list-item"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <span>{col.name}</span>
            <span style={{ opacity: 0.6 }}>{col.type}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function QualitySlide({ data }: { data: ExplorerData }) {
  const health = data.health || {};
  
  return (
    <motion.div
      className="slide-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="slide-card-header">
        <div className="slide-card-icon">
          <AlertTriangle size={20} strokeWidth={1.5} />
        </div>
        <h4 className="slide-card-title">Data Quality</h4>
      </div>
      <div className="data-grid">
        <span className="data-key">Health Score</span>
        <span className="data-value">{health.score?.toFixed(1) || "—"} / 100</span>
        
        <span className="data-key">Grade</span>
        <span className="data-value">{health.grade || "—"}</span>
        
        <span className="data-key">Completeness</span>
        <span className="data-value">{health.completeness?.toFixed(1) || "—"}%</span>
        
        <span className="data-key">Duplicates</span>
        <span className="data-value">{health.duplicate_rows?.toLocaleString() || "0"}</span>
      </div>
    </motion.div>
  );
}

function StatisticsSlide({ data }: { data: ExplorerData }) {
  const baselines = data.baselines || {};
  const entries = Object.entries(baselines).slice(0, 6);
  
  return (
    <motion.div
      className="slide-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="slide-card-header">
        <div className="slide-card-icon">
          <TrendingUp size={20} strokeWidth={1.5} />
        </div>
        <h4 className="slide-card-title">Key Statistics</h4>
      </div>
      <div className="data-grid">
        {entries.map(([key, value], index) => (
          <motion.div
            key={key}
            style={{ display: "contents" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <span className="data-key">{key.replace(/_/g, " ")}</span>
            <span className="data-value">
              {typeof value === "object" && value !== null
                ? JSON.stringify(value)
                : typeof value === "number"
                ? value.toLocaleString()
                : value}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function PatternsSlide({ data, patterns }: { data: ExplorerData; patterns: string[] }) {
  const detectedPatterns = data.detected_patterns?.slice(0, 5) || patterns.slice(0, 5);
  
  return (
    <motion.div
      className="slide-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="slide-card-header">
        <div className="slide-card-icon">
          <CheckCircle2 size={20} strokeWidth={1.5} />
        </div>
        <h4 className="slide-card-title">Detected Patterns</h4>
      </div>
      <div className="pattern-list">
        {detectedPatterns.map((pattern, index) => (
          <motion.div
            key={index}
            className="pattern-item"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <CheckCircle2 size={16} strokeWidth={2} />
            <span>{pattern}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ReadySlide({ 
  data, 
  progress,
  onEnterWorkspace 
}: { 
  data: ExplorerData; 
  progress: number;
  onEnterWorkspace: () => void;
}) {
  return (
    <motion.div
      className="slide-card ready-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="ready-icon"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <CheckCircle2 size={64} strokeWidth={1.5} />
      </motion.div>
      
      <h3 className="ready-title">Analysis Complete</h3>
      
      <div className="ready-stats">
        <div className="ready-stat">
          <div className="ready-stat-value">{data.row_count?.toLocaleString() || "—"}</div>
          <div className="ready-stat-label">Rows</div>
        </div>
        <div className="ready-stat">
          <div className="ready-stat-value">{data.col_count || "—"}</div>
          <div className="ready-stat-label">Columns</div>
        </div>
        <div className="ready-stat">
          <div className="ready-stat-value">{data.health?.grade || "—"}</div>
          <div className="ready-stat-label">Grade</div>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {progress >= 100 && (
        <motion.button
          className="workspace-button"
          onClick={onEnterWorkspace}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Enter Workspace
          <ArrowRight size={16} strokeWidth={2} />
        </motion.button>
      )}
    </motion.div>
  );
}
