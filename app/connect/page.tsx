"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Database,
  FileSpreadsheet,
  UploadCloud,
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap
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

      // 1. Upload file to backend with progress
      const uploadResponse = await uploadFileWithProgress(file, (progress) => {
        setUploadProgress(progress);
      });

      logger.api("File uploaded successfully", uploadResponse);
      setScanStatus("processing");
      // showToast.success("File Uploaded", "Analyzing data structure now...");

      // Store session_id in localStorage
      localStorage.setItem("current_session_id", uploadResponse.session_id);

      // 2. Trigger exploration
      logger.api("Triggering data exploration", { sessionId: uploadResponse.session_id });
      await exploreSession(uploadResponse.session_id);

      // 3. Poll until ready and get Data DNA
      logger.api("Polling for ready status...");
      const session = await pollSessionUntilReady(
        uploadResponse.session_id,
        (status) => logger.api(`Polling status: ${status}`)
      );

      logger.api("Session ready", session);
      // showToast.success("Data DNA Ready", "Full analysis profile generated.");

      // Convert backend Data DNA to frontend format
      const dna = formatSessionToDataDNA(session);

      setGeneratedDNA(dna);

      // Store in Zustand for backward compatibility
      setDataDNA(dna);

      // Trigger completion sequence in animation
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
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.name.endsWith(".xlsx"))) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleScanComplete = () => {
    setUploadState("preview");
  };

  const handleContinue = async () => {
    if (!generatedDNA) return;

    try {
      // Get session_id from localStorage
      const sessionId = localStorage.getItem("current_session_id");

      if (!sessionId) {
        throw new Error("No session ID found");
      }

      // Redirect to workspace with real session ID
      router.push(`/workspace/${sessionId}`);
    } catch (error) {
      console.error("Failed to continue:", error);
      alert("Failed to continue. Please try again.");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const startAnalysis = () => {
    handleContinue();
  };

  const handleLoadSample = () => {
    const file = generateSampleFile();
    handleFileUpload(file);
  };

  return (
    <div className="connect-page">

      {/* GlobalHeader is now persistent in RootLayout */}

      <div className="connect-container">

        {/* HERO SECTION - Title + Subtitle + Actions */}
        <motion.section
          className="hero-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="hero-content">
            <h1 className="hero-title">
              <TextType
                text="The Bridge"
                typingSpeed={75}
                loop={false}
                showCursor={false}
                as="span"
              />
            </h1>
            <p className="hero-subtitle">Connect your data to begin exploratory analysis</p>
          </div>

          <div className="action-tabs">
            <div className="source-tabs">
              <button
                className={`tab ${activeSource === "upload" ? "active" : ""}`}
                onClick={() => setActiveSource("upload")}
              >
                <Upload size={18} />
                Upload CSV
              </button>
              <button
                className={`tab ${activeSource === "database" ? "active" : ""}`}
                onClick={() => setActiveSource("database")}
              >
                <Database size={18} />
                Connect Database
              </button>
              <button
                className={`tab ${activeSource === "sample" ? "active" : ""}`}
                onClick={() => setActiveSource("sample")}
              >
                <FileSpreadsheet size={18} />
                Sample Dataset
              </button>
            </div>
          </div>

          <div className="section-divider" />
        </motion.section>

        {/* ZONE 2: INTERACTION AREA */}
        <section className="interaction-zone">
          <motion.div
            className="content-wrapper"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >

            {/* STAGE CONTAINER */}
            <AnimatePresence mode="wait">
              {(uploadState === "idle" || uploadState === "scanning") && (
                <motion.div
                  key="stage-container"
                  layout
                  className={
                    uploadState === "scanning"
                      ? "upload-zone scanning-mode"
                      : activeSource === "upload"
                        ? "upload-zone"
                        : activeSource === "database"
                          ? "database-form"
                          : "upload-zone sample-option"
                  }
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <AnimatePresence mode="wait">
                    {/* Upload Content */}
                    {uploadState === "idle" && activeSource === "upload" && (
                      <motion.div
                        key="upload-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="stage-inner-content"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="upload-header">
                          <Upload size={64} className="upload-icon-large" strokeWidth={1.2} />
                          <div className="upload-prompts">
                            <p className="primary-text">Drop your CSV file here</p>
                            <p className="secondary-text">or click to browse</p>
                          </div>
                        </div>

                        <div className="upload-meta">
                          <span>Supported: csv, json, xlsx</span>
                          <span className="dot">•</span>
                          <span>Max 50MB</span>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.xlsx"
                          onChange={handleFileInputChange}
                          style={{ display: "none" }}
                        />
                      </motion.div>
                    )}

                    {/* Database Content */}
                    {uploadState === "idle" && activeSource === "database" && (
                      <motion.div
                        key="database-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="stage-inner-content db-content"
                      >
                        <Database size={40} strokeWidth={1.5} className="db-icon" />
                        <h3>Connect Database</h3>
                        <div className="form-grid">
                          <input type="text" placeholder="Host" />
                          <input type="text" placeholder="Port" />
                          <input type="text" placeholder="Database" />
                          <input type="text" placeholder="User" />
                          <input type="password" placeholder="Password" />
                        </div>
                        <button className="connect-btn secondary">Test Connection</button>
                      </motion.div>
                    )}

                    {/* Sample Content */}
                    {uploadState === "idle" && activeSource === "sample" && (
                      <motion.div
                        key="sample-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="stage-inner-content sample-content"
                      >
                        <FileSpreadsheet size={40} strokeWidth={1.5} className="sample-icon" />
                        <div className="sample-text">
                          <h3>Load Sample Dataset</h3>
                          <p>Generate a randomized Fintech dataset (Fraud, Growth, Churn scenarios).</p>
                        </div>
                        <button className="connect-btn" onClick={handleLoadSample}>
                          Generate & Load Sample
                        </button>
                      </motion.div>
                    )}

                    {/* Scanning Content */}
                    {uploadState === "scanning" && (
                      <motion.div
                        key="scanning-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="scanning-wrapper"
                        style={{ width: '100%', height: '100%' }}
                      >
                        <ScanningAnimation
                          status={scanStatus}
                          uploadProgress={uploadProgress}
                          filename={uploadedFile?.name || "data.csv"}
                          rowCount={generatedDNA?.rowCount || 0}
                          columns={generatedDNA?.columns || []}
                          patterns={generatedDNA?.patterns || []}
                          onComplete={handleScanComplete}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {uploadState === "preview" && generatedDNA && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="preview-container"
                >
                  <div className="snapshot-panel">
                    <DataDnaPreview dataDNA={generatedDNA} />

                    <div className="snapshot-status">
                      <CheckCircle2 size={18} className="success-icon" />
                      <span>Data DNA generated successfully.</span>
                    </div>

                    <div className="snapshot-actions">
                      <button className="continue-btn" onClick={startAnalysis}>
                        Continue to Workspace <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {uploadState === "redirecting" && (
                <motion.div
                  key="redirecting"
                  className="redirecting-container"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <h3>Launching workspace in {countdown}...</h3>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PROCESS STRIP - anchored below interaction zone */}
            <div className="process-strip">
              <div className="step active">
                <UploadCloud size={14} />
                <span>Upload</span>
              </div>
              <div className="step-line" />
              <div className="step">
                <ShieldCheck size={14} />
                <span>Profiling</span>
              </div>
              <div className="step-line" />
              <div className="step">
                <Zap size={14} />
                <span>Insights</span>
              </div>
            </div>

          </motion.div>
        </section>
      </div>

      <style jsx>{`
        .connect-page {
          width: 100vw;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          background-color: var(--bg);
          padding: 0;
        }

        .connect-container {
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
          margin-top: var(--space-2xl);
          padding: 0 var(--space-lg);
        }

        /* HERO SECTION */
        .hero-section {
            display: flex;
            flex-direction: column;
            gap: var(--space-lg);
            width: 100%;
            align-items: center;
        }

        .hero-content {
            display: flex;
            flex-direction: column;
            gap: var(--space-sm);
            align-items: center;
            text-align: center;
        }

        .hero-title {
            font-size: 3rem;
            font-weight: 500;
            color: var(--fg);
            letter-spacing: -0.04em;
            margin: 0;
            line-height: 1;
        }

        .hero-subtitle {
            font-size: 1.25rem;
            color: var(--text-muted);
            margin: 0;
            font-weight: 400;
            letter-spacing: -0.01em;
            line-height: 1.4;
        }

        .action-tabs {
            width: 100%;
            display: flex;
            justify-content: center;
            margin-top: var(--space-md);
        }

        .source-tabs {
            display: flex;
            gap: var(--space-sm);
            background: var(--loader-bg);
            padding: 0.25rem;
            border-radius: var(--radius-md);
        }

        .tab {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.625rem;
            padding: 0.625rem 1.25rem;
            background: transparent;
            border: 1px solid transparent;
            border-radius: calc(var(--radius-md) - 0.25rem);
            color: var(--text-muted);
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all var(--transition-medium) cubic-bezier(0.4, 0, 0.2, 1);
            white-space: nowrap;
        }

        .tab:hover {
            color: var(--fg);
        }

        .tab.active {
            background-color: var(--fg);
            color: var(--bg);
            border-color: var(--fg);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .section-divider {
            width: 100%;
            height: 1px;
            background-color: var(--stroke);
            opacity: 0.5;
            margin-top: var(--space-lg);
        }

        /* ZONE 2: INTERACTION */
        .interaction-zone {
            width: 100%;
        }

        .upload-zone {
            background-color: transparent;
            background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%231f1f1f22' stroke-width='1.5' stroke-dasharray='8%2c 8' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
            border-radius: var(--radius-lg);
            overflow: hidden;
            transition: all var(--transition-medium) cubic-bezier(0.2, 0, 0.2, 1);
            cursor: pointer;
            width: 100%;
            position: relative;
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .upload-zone:hover {
            background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%231f1f1f44' stroke-width='1.5' stroke-dasharray='8%2c 4' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
            background-color: rgba(31, 31, 31, 0.02);
        }

        .upload-zone.scanning-mode {
             background-image: none;
             border: 1px solid var(--stroke);
             cursor: default;
        }
        
        .upload-zone.scanning-mode:hover {
             background-color: transparent;
        }

        .stage-inner-content {
            padding: var(--space-xl) var(--space-lg);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--space-lg);
            width: 100%;
            min-height: 400px;
        }

        .upload-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--space-lg);
        }

        .upload-icon-large {
            color: var(--fg);
            opacity: 0.8;
        }

        .upload-prompts {
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: var(--space-xs);
        }

        .primary-text {
            font-size: 1.5rem;
            font-weight: 500;
            color: var(--fg);
            margin: 0;
            letter-spacing: -0.02em;
        }

        .secondary-text {
            font-size: 1.125rem;
            color: var(--text-muted);
            margin: 0;
        }

        .upload-meta {
            margin-top: auto;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.75rem;
            color: var(--text-muted);
            font-weight: 500;
            padding-top: 1rem;
            border-top: 1px dashed var(--stroke);
            width: 100%;
            justify-content: center;
        }

        .dot { color: var(--stroke); }

        /* Database Form */
        .database-form {
             background-color: var(--bg-surface);
             border: 1px solid var(--stroke);
             border-radius: var(--radius-md);
             padding: var(--space-xl);
             display: flex;
             flex-direction: column;
             align-items: center;
             gap: var(--space-lg);
             transition: all var(--transition-medium) ease;
             width: 100%;
        }
        
        .database-form:hover {
             box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
        }
        
        .db-content h3 { margin: 0; font-size: 1rem; font-weight: 500; }
        .db-icon { color: var(--fg); opacity: 0.8; }

        .form-grid {
             display: grid;
             grid-template-columns: 1fr 1fr;
             gap: 0.75rem;
             width: 100%;
             max-width: 400px;
        }
        .form-grid input:nth-last-child(1) { grid-column: span 2; }

        .form-grid input {
             padding: 0.625rem;
             border: 1px solid var(--stroke);
             border-radius: 0.375rem;
             background: transparent;
             font-size: 0.875rem;
             font-family: inherit;
             color: var(--fg);
             transition: all 0.2s ease;
        }
        .form-grid input:focus { 
             outline: none; 
             border-color: var(--fg);
             box-shadow: 0 0 0 3px rgba(31, 31, 31, 0.05);
        }
        .form-grid input:hover {
             border-color: rgba(31, 31, 31, 0.3);
        }

        /* Sample Content */
        .sample-content {
             text-align: center;
        }
        .sample-icon { color: var(--fg); opacity: 0.8; }
        .sample-text h3 { margin: 0 0 var(--space-xs) 0; font-size: 1.25rem; font-weight: 500; }
        .sample-text p { margin: 0; font-size: 1rem; color: var(--text-muted); max-width: 400px; line-height: 1.5; }

        /* Connect Button */
        .connect-btn {
             padding: 0.75rem 1.5rem;
             background-color: var(--fg);
             color: var(--bg);
             border: none;
             border-radius: 0.5rem;
             font-family: inherit;
             font-size: 0.9375rem;
             font-weight: 500;
             cursor: pointer;
             transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
             box-shadow: 0 2px 8px rgba(31, 31, 31, 0.15);
        }
        
        .connect-btn:hover {
             transform: translateY(-2px);
             box-shadow: 0 4px 16px rgba(31, 31, 31, 0.25);
        }
        
        .connect-btn:active {
             transform: translateY(0);
        }

        /* Process Strip */
        .process-strip {
             display: flex;
             align-items: center;
             justify-content: center;
             gap: var(--space-md);
             margin-top: var(--space-xl);
             opacity: 0.4;
             transition: opacity var(--transition-fast) ease;
        }
        
        .process-strip:hover {
             opacity: 0.8;
        }

        .step {
             display: flex;
             align-items: center;
             gap: 0.5rem;
             font-size: 0.75rem;
             font-weight: 600;
             color: var(--fg);
             text-transform: uppercase;
             letter-spacing: 0.05em;
        }

        .step-line {
             width: 32px;
             height: 1px;
             background-color: var(--stroke);
        }
        
        /* Snapshot/Preview Styles */
        .snapshot-panel {
            margin-top: var(--space-md);
            display: flex;
            flex-direction: column;
            gap: var(--space-lg);
        }
        
        .snapshot-status {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-sm);
            color: var(--success);
            font-size: 1rem;
            font-weight: 500;
        }
        
        .success-icon {
            animation: successPulse 2s ease-in-out infinite;
        }
        
        @keyframes successPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        
        .continue-btn {
            background-color: var(--fg);
            color: var(--bg);
            border: none;
            padding: 1rem 3rem;
            border-radius: var(--radius-full);
            font-size: 1.125rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            transition: all var(--transition-medium) cubic-bezier(0.4, 0, 0.2, 1);
            margin: 0 auto;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
        .continue-btn:hover { 
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
        }
        .continue-btn:active {
            transform: translateY(-1px);
        }
        
        .scanning-wrapper {
             width: 100%;
             display: flex;
             justify-content: center;
        }
        
        .redirecting-container {
             text-align: center;
             padding: 3rem 2rem;
        }
        
        .redirecting-container h3 {
             font-size: 1.5rem;
             font-weight: 500;
             color: var(--fg);
             margin: 0;
        }

        @media (max-width: 1000px) {
           .hero-title { font-size: 2.25rem; }
           .hero-subtitle { font-size: 1.125rem; }
           .connect-container { gap: var(--space-lg); margin-top: var(--space-xl); }
           .primary-text { font-size: 1.25rem; }
           .secondary-text { font-size: 1rem; }
        }
      `}</style>
    </div>
  );
}
