"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Database,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";
import ScanningAnimation from "@/components/data/ScanningAnimation";
import DataDnaPreview from "@/components/data/DataDnaPreview";
import { generateSampleFile } from "@/components/data/DataGenerator";
import TextType from "@/components/interactive/TextType";
import { showToast } from "@/lib/utils/toast";
import { logger } from "@/lib/utils/logger";

import { useDataStore } from "@/store/dataStore";
import type { DataDNA } from "@/store/dataStore";
import {
  uploadFileWithProgress,
  exploreSession,
  pollSessionUntilReady,
  formatSessionToDataDNA,
} from "@/lib/api/backend";
import type { AnimationStatus } from "@/components/data/ScanningAnimation";

type UploadState = "idle" | "scanning" | "preview" | "redirecting";
type DataSource = "upload" | "database" | "sample";

export default function ConnectPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [activeSource, setActiveSource] = useState<DataSource>("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generatedDNA, setGeneratedDNA] = useState<DataDNA | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [dragActive, setDragActive] = useState(false);

  // Animation State
  const [scanStatus, setScanStatus] = useState<AnimationStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);

  const { setDataDNA } = useDataStore();

  // Handle redirection after countdown
  useEffect(() => {
    if (uploadState === "redirecting") {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        router.push("/workspace/insight-alpha-101");
      }
    }
  }, [uploadState, countdown, router]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploadedFile(file);
    setUploadState("scanning");
    setScanStatus("uploading");
    setUploadProgress(0);

    try {
      logger.api("Starting file upload", { filename: file.name, size: file.size });

      const uploadResponse = await uploadFileWithProgress(file, (progress) => {
        setUploadProgress(progress);
      });

      logger.api("File uploaded successfully", uploadResponse);
      setScanStatus("processing");

      localStorage.setItem("current_session_id", uploadResponse.session_id);

      logger.api("Triggering data exploration", { sessionId: uploadResponse.session_id });
      await exploreSession(uploadResponse.session_id);

      logger.api("Polling for ready status...");
      const session = await pollSessionUntilReady(
        uploadResponse.session_id,
        (status) => logger.api(`Polling status: ${status}`)
      );

      logger.api("Session ready", session);

      const dna = formatSessionToDataDNA(session);
      setGeneratedDNA(dna);
      setDataDNA(dna);
      setScanStatus("complete");

    } catch (error) {
      logger.error("API", "Upload or analysis failed", error);
      showToast.error("Analysis Failed", error instanceof Error ? error.message : "Unknown error");
      setUploadState("idle");
      setScanStatus("idle");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.name.endsWith(".xlsx"))) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleScanComplete = () => {
    setUploadState("preview");
  };

  const handleContinue = async () => {
    if (!generatedDNA) return;

    try {
      const sessionId = localStorage.getItem("current_session_id");
      if (!sessionId) throw new Error("No session ID found");
      router.push(`/workspace/${sessionId}`);
    } catch (error) {
      console.error("Failed to continue:", error);
      alert("Failed to continue. Please try again.");
    }
  };

  const handleLoadSample = () => {
    const file = generateSampleFile();
    handleFileUpload(file);
  };

  return (
    <div className="connect-page-wrapper">
      {/* ELEVATED CONTAINER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="connect-card"
      >
        {/* MAIN CONTENT AREA */}
        <main className="connect-main">
          <AnimatePresence mode="wait">
            {uploadState === "idle" && (
              <motion.div
                key="hero"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="connect-hero"
              >
                {/* HEADING */}
                <h1 className="connect-title">The Bridge</h1>
                <p className="connect-subtitle">
                  Connect your data sources to begin exploratory analysis. Secure, fast, and intelligent.
                </p>

                {/* SEGMENTED CONTROL */}
                <div className="source-pills">
                  {(["upload", "database", "sample"] as DataSource[]).map((src) => (
                    <button
                      key={src}
                      onClick={() => setActiveSource(src)}
                      className={`source-pill ${activeSource === src ? "source-pill-active" : ""}`}
                    >
                      {activeSource === src && (
                        <motion.div
                          layoutId="active-pill"
                          className="source-pill-bg"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="source-pill-label">
                        {src === "upload" && <><Upload size={14} /> Upload CSV</>}
                        {src === "database" && <><Database size={14} /> Database</>}
                        {src === "sample" && <><FileSpreadsheet size={14} /> Sample Data</>}
                      </span>
                    </button>
                  ))}
                </div>

                {/* ACTIVE SOURCE CONTENT */}
                <motion.div
                  layout
                  className="source-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* UPLOAD */}
                  {activeSource === "upload" && (
                    <div
                      className={`upload-zone ${dragActive ? "upload-zone-active" : ""}`}
                      onDragEnter={handleDragOver}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="upload-icon-wrap">
                        <Upload size={26} className="upload-icon" strokeWidth={1.5} />
                      </div>
                      <h3 className="upload-title">Drop your CSV file here</h3>
                      <p className="upload-hint">or click to browse from your computer</p>
                      <div className="upload-formats">
                        <span>CSV</span>
                        <span className="upload-formats-dot">·</span>
                        <span>XLSX</span>
                        <span className="upload-formats-dot">·</span>
                        <span>JSON</span>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={handleFileInputChange}
                        style={{ display: "none" }}
                      />
                    </div>
                  )}

                  {/* DATABASE */}
                  {activeSource === "database" && (
                    <div className="db-panel">
                      <div className="db-header">
                        <div className="db-icon-wrap">
                          <Database size={18} />
                        </div>
                        <div>
                          <h3 className="db-title">PostgreSQL Connection</h3>
                          <p className="db-hint">Read-only access required</p>
                        </div>
                      </div>
                      <div className="db-fields">
                        <input className="ds-input col-2" placeholder="Host (e.g. aws.amazon.com)" />
                        <input className="ds-input" placeholder="Port" />
                        <input className="ds-input" placeholder="Database" />
                        <input className="ds-input col-2" placeholder="Username" />
                        <input className="ds-input col-2" type="password" placeholder="Password" />
                      </div>
                      <button className="ds-btn-primary w-full">
                        Test Connection
                      </button>
                    </div>
                  )}

                  {/* SAMPLE */}
                  {activeSource === "sample" && (
                    <div className="sample-panel">
                      <div className="sample-icon-wrap">
                        <FileSpreadsheet size={28} strokeWidth={1.5} />
                      </div>
                      <h3 className="sample-title">Fintech Growth Dataset</h3>
                      <p className="sample-desc">
                        A generated dataset containing 250k rows of transaction data, including fraud patterns and user churn signals.
                      </p>
                      <button
                        onClick={handleLoadSample}
                        className="ds-btn-primary w-full"
                      >
                        Generate &amp; Load <ArrowRight size={15} />
                      </button>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {(uploadState === "scanning" || uploadState === "preview") && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="connect-scanning"
              >
                {uploadState === "scanning" ? (
                  <ScanningAnimation
                    status={scanStatus}
                    uploadProgress={uploadProgress}
                    filename={uploadedFile?.name || "data.csv"}
                    rowCount={generatedDNA?.rowCount || 0}
                    columns={generatedDNA?.columns || []}
                    patterns={generatedDNA?.patterns || []}
                    onComplete={handleScanComplete}
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="preview-wrap"
                  >
                    <div className="preview-dna">
                      {generatedDNA && <DataDnaPreview dataDNA={generatedDNA} />}
                    </div>
                    <div className="preview-actions">
                      <button
                        onClick={() => setUploadState("idle")}
                        className="ds-btn-secondary"
                      >
                        Upload Another
                      </button>
                      <button
                        onClick={handleContinue}
                        className="ds-btn-primary"
                      >
                        Enter Workspace <ArrowRight size={15} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </motion.div>

      <style jsx>{`
        /* ─── Page wrapper ────────────────────────────────────────── */
        .connect-page-wrapper {
          height: calc(100vh - 5rem);
          overflow: hidden;
          background-color: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          font-family: 'PP Neue Montreal', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* ─── Main card ───────────────────────────────────────────── */
        .connect-card {
          width: 100%;
          max-width: 48rem;
          background: var(--bg-elevated);
          border: 1px solid var(--stroke);
          border-radius: 1.5rem;
          overflow: hidden;
          min-height: 0;
          max-height: calc(100vh - 7rem);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        /* ─── Main content ────────────────────────────────────────── */
        .connect-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 3rem;
          position: relative;
          overflow: hidden;
        }

        /* ─── Hero ────────────────────────────────────────────────── */
        .connect-hero {
          width: 100%;
          max-width: 36rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .connect-title {
          font-size: 3rem;
          font-weight: 500;
          color: var(--fg);
          letter-spacing: -0.08rem;
          line-height: 1.05;
          margin: 0 0 0.5rem;
        }

        .connect-subtitle {
          font-size: 0.9375rem;
          color: var(--text-muted);
          margin: 0 0 1.75rem;
          max-width: 28rem;
          line-height: 1.6;
          font-weight: 400;
        }

        /* ─── Source pills ────────────────────────────────────────── */
        .source-pills {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem;
          background: var(--loader-bg);
          border-radius: 9999px;
          margin-bottom: 1.5rem;
          border: 1px solid var(--stroke);
        }

        .source-pill {
          position: relative;
          padding: 0.5rem 1.125rem;
          border-radius: 9999px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          font-family: inherit;
          color: var(--text-muted);
          transition: color 0.2s;
        }

        .source-pill-active {
          color: var(--fg);
        }

        .source-pill-bg {
          position: absolute;
          inset: 0;
          background: var(--bg);
          border-radius: 9999px;
          border: 1px solid var(--stroke);
          z-index: 0;
        }

        .source-pill-label {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        /* ─── Source content area ─────────────────────────────────── */
        .source-content {
          width: 100%;
          max-width: 28rem;
        }

        /* ─── Upload zone ─────────────────────────────────────────── */
        .upload-zone {
          border: 1.5px dashed var(--stroke);
          border-radius: 1rem;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          background: var(--bg);
          transition: border-color 0.2s, background 0.2s;
        }

        .upload-zone:hover {
          border-color: var(--fg);
          background: var(--bg-elevated);
        }

        .upload-zone-active {
          border-color: var(--accent);
          background: var(--bg-elevated);
          transform: scale(1.01);
        }

        .upload-icon-wrap {
          width: 3.5rem;
          height: 3.5rem;
          background: var(--loader-bg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          transition: background 0.2s;
        }

        .upload-zone:hover .upload-icon-wrap {
          background: var(--bg);
        }

        .upload-icon {
          color: var(--text-muted);
          transition: color 0.2s;
        }

        .upload-zone:hover .upload-icon {
          color: var(--fg);
        }

        .upload-title {
          font-size: 1rem;
          font-weight: 500;
          color: var(--fg);
          margin: 0 0 0.25rem;
        }

        .upload-hint {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin: 0 0 1.25rem;
          font-weight: 400;
        }

        .upload-formats {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted);
          opacity: 0.6;
        }

        .upload-formats-dot {
          opacity: 0.4;
        }

        /* ─── Database panel ──────────────────────────────────────── */
        .db-panel {
          background: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 1rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .db-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .db-icon-wrap {
          width: 2.5rem;
          height: 2.5rem;
          background: var(--loader-bg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--fg);
          flex-shrink: 0;
        }

        .db-title {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--fg);
          margin: 0;
        }

        .db-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0.1rem 0 0;
          font-weight: 400;
        }

        .db-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.625rem;
        }

        /* ─── Sample panel ────────────────────────────────────────── */
        .sample-panel {
          background: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 1rem;
          padding: 2rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .sample-icon-wrap {
          width: 3.5rem;
          height: 3.5rem;
          background: var(--loader-bg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
        }

        .sample-title {
          font-size: 1rem;
          font-weight: 500;
          color: var(--fg);
          margin: 0;
        }

        .sample-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.6;
          font-weight: 400;
          max-width: 22rem;
        }

        /* ─── Scanning / Preview ──────────────────────────────────── */
        .connect-scanning {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .preview-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          max-width: 56rem;
        }

        .preview-dna {
          width: 100%;
          margin-bottom: 2rem;
        }

        .preview-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        /* ─── Design System Primitives ────────────────────────────── */

        /* Primary button */
        .ds-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          height: 44px;
          padding: 0 20px;
          background: var(--fg);
          color: var(--bg);
          border: 1px solid var(--fg);
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s, opacity 0.2s, transform 0.2s;
          outline: none;
        }

        .ds-btn-primary:focus-visible {
          box-shadow: 0 0 0 3px rgba(31,31,31,0.5);
        }

        .ds-btn-primary:hover {
          opacity: 0.9;
        }

        .ds-btn-primary:active {
          transform: scale(0.98);
        }

        /* Secondary button */
        .ds-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          height: 44px;
          padding: 0 20px;
          background: transparent;
          color: var(--fg);
          border: 1px solid var(--stroke);
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          outline: none;
        }

        .ds-btn-secondary:focus-visible {
          box-shadow: 0 0 0 3px rgba(31,31,31,0.5);
        }

        .ds-btn-secondary:hover {
          background: var(--loader-bg);
          border-color: var(--fg);
        }

        /* Input */
        .ds-input {
          background: var(--bg-elevated);
          border: 1px solid var(--stroke);
          border-radius: 0.375rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-family: inherit;
          color: var(--fg);
          outline: none;
          width: 100%;
          transition: border-color 0.2s;
        }

        .ds-input::placeholder {
          color: var(--text-muted);
        }

        .ds-input:focus {
          border-color: var(--accent);
        }

        .ds-input.col-2 {
          grid-column: span 2;
        }

        .w-full {
          width: 100%;
        }

        /* ─── Responsive ──────────────────────────────────────────── */
        @media (max-width: 640px) {
          .connect-main {
            padding: 2rem 1.5rem;
          }

          .connect-title {
            font-size: 2.5rem;
          }

          .source-pills {
            gap: 0;
          }

          .source-pill {
            padding: 0.5rem 0.875rem;
            font-size: 0.8125rem;
          }

          .preview-actions {
            flex-direction: column;
            width: 100%;
          }

          .ds-btn-primary,
          .ds-btn-secondary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
