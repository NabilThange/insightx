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
import TextType from "@/components/interactive/TextType";
import GlobalHeader from "@/components/layout/GlobalHeader";
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

      <GlobalHeader />

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
                text="Ingest Your Data"
                typingSpeed={75}
                loop={false}
                showCursor={false}
                as="span"
              />
            </h1>
            <p className="hero-subtitle">Upload your transaction logs to begin exploratory analysis</p>
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
                Database
              </button>
              <button
                className={`tab ${activeSource === "sample" ? "active" : ""}`}
                onClick={() => setActiveSource("sample")}
              >
                <FileSpreadsheet size={18} />
                Sample
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
                          <div className="icon-badge">
                            <UploadCloud size={24} />
                          </div>
                          <div className="upload-prompts">
                            <p className="primary-text">Drop your CSV file here</p>
                            <p className="secondary-text">or <span className="browse-link">click to browse</span></p>
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
                    {uploadState === "scanning" && generatedDNA && (
                      <motion.div
                        key="scanning-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="scanning-wrapper"
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
          max-width: 600px;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-top: 2rem;
        }



        /* HERO SECTION */
        .hero-section {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            width: 100%;
        }

        .hero-content {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .hero-title {
            font-size: 2rem;
            font-weight: 500;
            color: var(--fg);
            letter-spacing: -0.02em;
            margin: 0;
            line-height: 1.1;
        }

        .hero-subtitle {
            font-size: 1rem;
            color: rgba(31, 31, 31, 0.6);
            margin: 0;
            font-weight: 400;
            line-height: 1.5;
        }

        .action-tabs {
            width: 100%;
        }

        .source-tabs {
            display: flex;
            gap: 0.5rem;
            width: 100%;
        }

        .tab {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 0.625rem;
            background: transparent;
            border: 1px solid var(--stroke);
            border-radius: 0.5rem;
            color: rgba(31,31,31,0.6);
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
        }

        .tab:hover {
            border-color: var(--fg);
            color: var(--fg);
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(31, 31, 31, 0.08);
        }

        .tab.active {
            background-color: var(--fg);
            color: var(--bg);
            border-color: var(--fg);
            box-shadow: 0 2px 12px rgba(31, 31, 31, 0.15);
        }
        
        .tab.active:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(31, 31, 31, 0.2);
        }

        .section-divider {
            width: 100%;
            height: 1px;
            background-color: var(--stroke-subtle);
        }

        /* ZONE 2: INTERACTION */
        .interaction-zone {
            width: 100%;
        }

        .upload-zone {
            background-color: var(--bg-surface);
            border: 1px dashed var(--stroke);
            border-radius: 0.75rem;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            width: 100%;
            position: relative;
        }
        
        .upload-zone:hover {
            border-color: var(--fg);
            box-shadow: 0 4px 16px rgba(31, 31, 31, 0.06);
            transform: translateY(-2px);
        }

        .upload-zone.scanning-mode {
             border-style: solid;
             cursor: default;
             border-color: var(--stroke);
             box-shadow: 0 2px 12px rgba(31, 31, 31, 0.04);
        }
        
        .upload-zone.scanning-mode:hover {
             transform: none;
        }

        .stage-inner-content {
            padding: 2.5rem 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            width: 100%;
            min-height: 220px;
        }

        /* Upload Specifics */
        .upload-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }

        .icon-badge {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background-color: var(--bg);
            border: 1px solid var(--stroke);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--fg);
            transition: all 0.3s ease;
        }
        
        .upload-zone:hover .icon-badge {
            border-color: var(--fg);
            box-shadow: 0 4px 12px rgba(31, 31, 31, 0.08);
        }

        .upload-prompts {
            text-align: center;
        }

        .primary-text {
            font-size: 0.9375rem;
            font-weight: 500;
            color: var(--fg);
            margin: 0 0 0.25rem 0;
        }

        .secondary-text {
            font-size: 0.875rem;
            color: rgba(31,31,31,0.5);
            margin: 0;
        }

        .browse-link {
            text-decoration: underline;
            color: var(--fg);
            cursor: pointer;
            transition: opacity 0.2s ease;
        }
        
        .browse-link:hover {
            opacity: 0.7;
        }

        .upload-meta {
            margin-top: auto;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.75rem;
            color: rgba(31,31,31,0.4);
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
             border-radius: 0.75rem;
             padding: 2rem;
             display: flex;
             flex-direction: column;
             align-items: center;
             gap: 1.5rem;
             transition: all 0.3s ease;
        }
        
        .database-form:hover {
             box-shadow: 0 4px 16px rgba(31, 31, 31, 0.06);
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
        .sample-text h3 { margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 500; }
        .sample-text p { margin: 0; font-size: 0.875rem; color: rgba(31,31,31,0.6); max-width: 300px; line-height: 1.5; }

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
             gap: 0.75rem;
             margin-top: 2rem;
             opacity: 0.5;
             transition: opacity 0.3s ease;
        }
        
        .process-strip:hover {
             opacity: 0.7;
        }

        .step {
             display: flex;
             align-items: center;
             gap: 0.375rem;
             font-size: 0.75rem;
             font-weight: 500;
             color: var(--fg);
             text-transform: uppercase;
             letter-spacing: 0.05em;
        }

        .step-line {
             width: 24px;
             height: 1px;
             background-color: var(--stroke);
        }
        
        /* Snapshot/Preview Styles */
        .snapshot-panel {
            margin-top: 1rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        
        .snapshot-status {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            color: var(--success);
            font-size: 0.875rem;
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
            padding: 1rem 2.5rem;
            border-radius: 99px;
            font-size: 1rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            margin: 0 auto;
            box-shadow: 0 4px 16px rgba(31, 31, 31, 0.15);
        }
        .continue-btn:hover { 
            transform: translateY(-3px);
            box-shadow: 0 8px 24px rgba(31, 31, 31, 0.25);
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

        @media (max-width: 640px) {
           .source-tabs { flex-direction: column; }
           .form-grid { grid-template-columns: 1fr; }
           .form-grid input:nth-last-child(1) { grid-column: auto; }
           .hero-title { font-size: 1.75rem; }
           .connect-container { gap: 1.5rem; }
           .page-header { 
             flex-direction: column; 
             align-items: flex-start; 
             gap: 0.5rem;
           }
           .context-label { font-size: 0.6875rem; }
        }
      `}</style>
    </div>
  );
}
