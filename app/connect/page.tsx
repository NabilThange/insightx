"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Database, FileSpreadsheet } from "lucide-react";
import ScanningAnimation from "@/components/data/ScanningAnimation";
import DataDnaPreview from "@/components/data/DataDnaPreview";
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

  const handleLoadSample = () => {
    const sampleDNA = generateMockDNA("sample_transactions.csv");
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
                    ? "drop-zone scanning-mode"
                    : activeSource === "upload"
                      ? "drop-zone"
                      : activeSource === "database"
                        ? "database-form"
                        : "sample-option"
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
                      style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}
                    >
                      <Upload size={64} strokeWidth={1.5} />
                      <h3>Drop your CSV file here</h3>
                      <p>or click to browse</p>
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
                      style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}
                    >
                      <FileSpreadsheet size={48} strokeWidth={1.5} />
                      <h3>Try with Sample Data</h3>
                      <p>250K transaction records with payment failures</p>
                      <button className="connect-btn" onClick={handleLoadSample}>
                        Load Sample Dataset
                      </button>
                    </motion.div>
                  )}

                  {/* Scanning Content - Renders INSIDE the box */}
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
                className="preview-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
              >
                <DataDnaPreview dataDNA={generatedDNA} />
                <button className="continue-btn" onClick={handleContinue}>
                  Continue to Workspace →
                </button>
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
        </motion.div>
      </div>

      <style jsx>{`
        .connect-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background-color: var(--bg);
          color: var(--fg);
          overflow-x: hidden;
        }

        .connect-nav {
          position: relative;
          width: 100%;
          height: 5rem;
          padding: 1.5rem 1.5rem 1.5rem 7.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-name a {
          font-size: 1.5rem;
          color: var(--fg);
          text-decoration: none;
          font-weight: 600;
        }

        .connect-nav .divider {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 1px;
          background-color: var(--stroke);
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 5rem;
          height: 100vh;
        }

        .sidebar .divider {
          position: absolute;
          right: 0;
          top: 0;
          width: 1px;
          height: 100vh;
          background-color: var(--stroke);
        }

        .connect-content {
          padding: 2rem 7.5rem;
          min-height: calc(100vh - 5rem);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-x: hidden;
        }

        .content-wrapper {
          width: 100%;
          max-width: 1200px;
        }

        .connect-header {
          text-align: center;
          margin-bottom: 2rem;
          max-width: 600px;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 500;
          margin-bottom: 0.75rem;
          color: var(--fg);
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          color: rgba(31, 31, 31, 0.6);
          font-weight: 400;
          font-size: 1.125rem;
          margin: 0;
        }

        .upload-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .source-tabs {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background-color: transparent;
          border: 1px solid var(--stroke);
          border-radius: 0.375rem;
          color: rgba(31, 31, 31, 0.7);
          font-family: inherit;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast) ease;
        }

        .tab:hover {
          border-color: var(--fg);
          color: var(--fg);
        }

        .tab.active {
          background-color: var(--fg);
          border-color: var(--fg);
          color: var(--bg);
        }

        .drop-zone {
          border: 2px dashed var(--stroke);
          border-radius: 0.75rem;
          padding: 3rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-medium) ease;
          min-height: 300px;
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
        }

        .drop-zone:hover {
          border-color: var(--fg);
          background-color: var(--loader-bg);
        }

        .drop-zone h3 {
          margin-top: 1rem;
          color: var(--fg);
        }

        .drop-zone p {
          color: rgba(31, 31, 31, 0.7);
        }

        .database-form,
        .sample-option {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 3rem 2rem;
          background-color: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 0.75rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .database-form h3,
        .sample-option h3 {
          margin-top: 1rem;
          color: var(--fg);
        }

        .database-form p,
        .sample-option p {
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

        .preview-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .continue-btn {
          padding: 1rem 3rem;
          background-color: var(--fg);
          color: var(--bg);
          border: none;
          border-radius: 999px;
          font-family: inherit;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .continue-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

        .redirecting-container {
          text-align: center;
          padding: 4rem 2rem;
        }

        .redirecting-container h3 {
          font-size: 1.75rem;
          color: var(--accent);
        }

        @media (max-width: 1000px) {
          .connect-content {
            padding: 2rem 1.5rem 2rem 7.5rem;
          }

          .connect-header h1 {
            font-size: 2rem;
          }

          .source-tabs {
            flex-direction: column;
          }

          .drop-zone {
            padding: 2rem 1.5rem;
            min-height: 250px;
          }
        }
      `}</style>
    </div >
  );
}
