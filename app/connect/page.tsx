"use client";

import { useState, useRef } from "react";
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
import { generateFintechData } from "@/components/data/DataGenerator";
import { useDataStore } from "@/store/dataStore";
import type { DataDNA } from "@/store/dataStore";

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

  const { setDataDNA } = useDataStore();

  // Mock data generation (in real app, this would be backend processing)
  const generateMockDNA = (filename: string): DataDNA => {
    return {
      filename,
      rowCount: 250000,
      columnCount: 12,
      uploadDate: new Date(),
      columns: [
        {
          name: "transaction_id",
          type: "text",
          nullPercentage: 0,
          sampleValues: ["TXN_001", "TXN_002", "TXN_003"],
        },
        {
          name: "amount",
          type: "numeric",
          nullPercentage: 0,
          sampleValues: ["1245.50", "890.00", "2340.75"],
        },
        {
          name: "timestamp",
          type: "datetime",
          nullPercentage: 0,
          sampleValues: ["2024-01-15 20:30", "2024-01-15 20:45", "2024-01-15 21:00"],
        },
        {
          name: "status",
          type: "categorical",
          nullPercentage: 5.8,
          sampleValues: ["success", "failed", "pending"],
        },
        {
          name: "network_type",
          type: "categorical",
          nullPercentage: 0,
          sampleValues: ["4G", "5G", "WiFi"],
        },
        {
          name: "merchant_id",
          type: "text",
          nullPercentage: 0,
          sampleValues: ["MERCH_A", "MERCH_B", "MERCH_C"],
        },
        {
          name: "user_id",
          type: "text",
          nullPercentage: 0,
          sampleValues: ["USER_123", "USER_456", "USER_789"],
        },
        {
          name: "payment_method",
          type: "categorical",
          nullPercentage: 0,
          sampleValues: ["UPI", "Card", "Wallet"],
        },
      ],
      baselines: {
        avgTransaction: "₹1,245",
        successRate: 94.2,
        peakHours: "8-9 PM",
        dateRange: "Jan 2024 - Feb 2024",
      },
      patterns: [
        "P2P Transfers",
        "Mobile Payments",
        "Weekend Spikes",
        "4G Timeout Pattern",
      ],
      insights: [
        "High activity during 8-9 PM",
        "4G has 23% higher timeout rate",
        "Weekend transactions 15% higher",
      ],
    };
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;

    setUploadedFile(file);
    setUploadState("scanning");

    // Generate mock DNA
    const dna = generateMockDNA(file.name);
    setGeneratedDNA(dna);
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

  const handleContinue = () => {
    if (!generatedDNA) return;

    // Save to store
    setDataDNA(generatedDNA);

    // Start countdown
    setUploadState("redirecting");
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          router.push("/workspace");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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
    const sampleDNA = generateFintechData();
    setGeneratedDNA(sampleDNA);
    setUploadState("scanning");
  };

  return (
    <div className="connect-page">
      {/* Navigation */}
      <nav className="connect-nav">
        <div className="logo-name">
          <a href="/">InsightX</a>
        </div>
        <div className="divider" />
      </nav>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="divider" />
      </div>

      {/* Main Content */}
      <div className="connect-content">
        <motion.div
          className="content-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {uploadState === "idle" && (
              <motion.div
                key="header-tabs"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="connect-header">
                  <h1 className="hero-title">Ingest Your Data</h1>
                  <p className="hero-subtitle">Upload your transaction logs to begin exploratory analysis</p>
                </div>

                {/* Data Source Tabs */}
                <div className="source-tabs">
                  <button
                    className={`tab ${activeSource === "upload" ? "active" : ""}`}
                    onClick={() => setActiveSource("upload")}
                  >
                    <Upload size={20} />
                    Upload CSV
                  </button>
                  <button
                    className={`tab ${activeSource === "database" ? "active" : ""}`}
                    onClick={() => setActiveSource("database")}
                  >
                    <Database size={18} />
                    Database
                  </button>
                  <button
                    className={`tab ${activeSource === "sample" ? "active" : ""}`}
                    onClick={() => setActiveSource("sample")}
                  >
                    <FileSpreadsheet size={20} />
                    Sample Dataset
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Persistent Stage Container */}
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  width: "100%",
                  maxWidth: "800px",
                  marginLeft: "auto",
                  marginRight: "auto"
                }}
              >
                <AnimatePresence mode="wait">
                  {/* Upload Content */}
                  {uploadState === "idle" && activeSource === "upload" && (
                    <motion.div
                      key="upload-content"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="stage-inner-content"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => fileInputRef.current?.click()}
                      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", cursor: "pointer" }}
                    >
                      <div className="upload-label">File Upload</div>
                      <div className="upload-content">
                        <div className="icon-wrapper">
                          <UploadCloud size={32} />
                        </div>
                        <div className="upload-text">
                          <p className="primary-text">Drop your CSV file here</p>
                          <p className="secondary-text">or <span className="browse-link">click to browse</span></p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.xlsx"
                          onChange={handleFileInputChange}
                          style={{ display: "none" }}
                        />
                      </div>
                      <div className="upload-footer">
                        <span>Supported: .csv, .json, .xlsx</span>
                        <span className="dot">•</span>
                        <span>Max 50MB</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Database Content */}
                  {uploadState === "idle" && activeSource === "database" && (
                    <motion.div
                      key="database-content"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="stage-inner-content"
                      style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}
                    >
                      <Database size={48} strokeWidth={1.5} />
                      <h3>Connect Database</h3>
                      <p>PostgreSQL, MySQL, MongoDB</p>
                      <div className="form-fields">
                        <input type="text" placeholder="Host" />
                        <input type="text" placeholder="Port" />
                        <input type="text" placeholder="Database Name" />
                        <input type="text" placeholder="Username" />
                        <input type="password" placeholder="Password" />
                      </div>
                      <button className="connect-btn">Test Connection</button>
                    </motion.div>
                  )}

                  {/* Sample Content */}
                  {uploadState === "idle" && activeSource === "sample" && (
                    <motion.div
                      key="sample-content"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="stage-inner-content"
                      style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", padding: "2rem" }}
                    >
                      <FileSpreadsheet size={48} strokeWidth={1.5} />
                      <div style={{ textAlign: "center" }}>
                        <h3>Load Sample Dataset</h3>
                        <p style={{ color: "rgba(31, 31, 31, 0.6)", marginTop: "0.5rem" }}>
                          Generate a randomized Fintech dataset to explore specific scenarios like fraud detection or high-volume traffic.
                        </p>
                      </div>
                      <button className="connect-btn" onClick={handleLoadSample}>
                        Generate & Load Sample
                      </button>
                    </motion.div>
                  )}

                  {/* Scanning Content */}
                  {uploadState === "scanning" && generatedDNA && (
                    <motion.div
                      key="scanning-content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <ScanningAnimation
                        filename={generatedDNA.filename}
                        rowCount={generatedDNA.rowCount}
                        columns={generatedDNA.columns}
                        patterns={generatedDNA.patterns}
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <h3>Launching workspace in {countdown}...</h3>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 5. How It Works Strip */}
          <div className="how-it-works">
            <div className="step">
              <UploadCloud size={14} />
              <span>Upload Dataset</span>
            </div>
            <div className="step-divider" />
            <div className="step">
              <ShieldCheck size={14} />
              <span>Automatic Profiling</span>
            </div>
            <div className="step-divider" />
            <div className="step">
              <Zap size={14} />
              <span>Conversational Insights</span>
            </div>
          </div>

        </motion.div>

      </div>

      <style jsx>{`
        .connect-page {
          width: 100vw;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--bg);
          padding: 2rem;
        }

        .connect-container {
          width: 100%;
          max-width: 640px; /* Constrained width */
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* 1. Header Section */
        .header-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          text-align: left; /* Strict left align */
        }

        .header-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .hero-title {
          font-size: 2.5rem; /* Adjusted opacity/scale for enterprise feel */
          font-weight: 500;
          color: var(--fg);
          letter-spacing: -0.02em;
          margin: 0;
          line-height: 1.1;
        }

        .hero-subtitle {
          color: rgba(31, 31, 31, 0.6);
          font-weight: 400;
          font-size: 1.125rem;
          margin: 0;
        }

        .header-divider {
            width: 100%;
            height: 1px;
            background-color: var(--stroke);
            opacity: 0.6;
        }

        .action-area {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        /* 2. Button Group */
        .source-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr; /* Maintain rhythm */
          gap: 0.75rem;
        }

        .tab {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1rem; /* Equal height */
          background-color: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 0.5rem;
          color: rgba(31, 31, 31, 0.7);
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab:hover {
          border-color: var(--fg);
          color: var(--fg);
        }

        .tab.active {
          background-color: var(--fg);
          color: var(--bg); /* Primary action logic */
          border-color: var(--fg);
        }

        /* Database Form */
        .database-form {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 3rem 2rem;
          background-color: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 0.75rem;
        }

        .database-form h3 {
          margin-top: 1rem;
          color: var(--fg);
        }

        .database-form p {
          color: rgba(31, 31, 31, 0.7);
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
          max-width: 400px;
        }

        .form-fields input {
          padding: 0.75rem 1rem;
          background-color: transparent;
          border: 1px solid var(--stroke);
          border-radius: 0.375rem;
          color: var(--fg);
          font-family: inherit;
          font-size: 1rem;
        }

        .form-fields input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .form-fields input::placeholder {
          color: rgba(31, 31, 31, 0.5);
        }

        .connect-btn {
          padding: 0.75rem 1.5rem;
          background-color: var(--fg);
          color: var(--bg);
          border: none;
          border-radius: 0.375rem;
          font-family: inherit;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast) ease;
        }

        .connect-btn:hover {
          transform: scale(1.02);
        }

        /* 3. Dropzone */
        .upload-zone {
            display: flex;
            flex-direction: column;
            border: 1px dashed var(--stroke);
            border-radius: 0.75rem;
            background-color: var(--bg-surface);
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
            cursor: pointer;
        }

        .upload-zone.drag-active {
            border-color: var(--accent-blue);
            background-color: var(--loader-bg);
        }

        .upload-label {
            padding: 0.75rem 1rem;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: rgba(31, 31, 31, 0.5);
            border-bottom: 1px dashed var(--stroke);
        }

        .upload-content {
            padding: 2.5rem 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            text-align: center;
        }

        .icon-wrapper {
            padding: 1rem;
            background-color: var(--bg);
            border: 1px solid var(--stroke);
            border-radius: 50%;
            color: var(--fg);
            margin-bottom: 0.5rem;
        }

        .primary-text {
            font-size: 1rem;
            font-weight: 500;
            color: var(--fg);
            margin: 0;
        }

        .secondary-text {
            font-size: 0.875rem;
            color: rgba(31, 31, 31, 0.6);
            margin: 0;
        }

        .browse-link {
            color: var(--fg);
            text-decoration: underline;
            cursor: pointer;
            font-weight: 500;
            font-weight: 500;
        }
        
        .browse-link:hover {
            color: var(--accent);
        }

        .upload-footer {
            padding: 0.75rem;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
            background-color: var(--bg); /* Subtle separation */
            border-top: 1px dashed var(--stroke);
            font-size: 0.75rem;
            color: rgba(31, 31, 31, 0.5);
        }
        
        .dot {
            color: var(--stroke);
        }

        .file-input {
            display: none;
        }

        .scanning-container {
            width: 100%;
        }

        /* 4. Snapshot Panel */
        .preview-container {
            width: 100%;
        }

        .snapshot-panel {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            padding: 1rem 0;
        }

        .snapshot-status {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            color: var(--success);
            font-size: 0.9375rem;
            font-weight: 500;
        }
        
        .success-icon {
            color: var(--success);
        }

        .snapshot-actions {
            display: flex;
            justify-content: center;
            margin-top: 1rem;
        }

        .continue-btn {
          padding: 0.875rem 2rem;
          background-color: var(--fg);
          color: var(--bg);
          border: none;
          border-radius: 999px; /* Pill shape */
          font-family: inherit;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .continue-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          background-color: var(--fg); /* Ensure contrast stays high */
        }

        .redirecting-container {
          text-align: center;
          padding: 4rem 2rem;
        }

        .redirecting-container h3 {
          font-size: 1.75rem;
          color: var(--fg);
          font-weight: 500;
        }

        /* 5. How It Works */
        .how-it-works {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid var(--stroke-subtle);
            width: 100%;
            opacity: 0.7;
        }
        
        .step {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.75rem;
            font-weight: 500;
            color: var(--fg-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .step-divider {
            width: 20px;
            height: 1px;
            background-color: var(--stroke);
        }

        @media (max-width: 640px) {
          .connect-header h1 {
            font-size: 2rem;
          }

          .source-tabs {
            grid-template-columns: 1fr; /* Stack on mobile */
          }

          .drop-zone {
            padding: 2rem 1.5rem;
            min-height: 250px;
          }
          
          .how-it-works {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .step-divider {
            width: 1px;
            height: 10px;
            display: none; /* Hide dividers on mobile stack */
          }
        }
      `}</style>
    </div>
  );
}
