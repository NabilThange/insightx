"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Database,
  FileSpreadsheet,
  ArrowRight,
  Command,
  LayoutGrid,
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

  const handleLoadSample = () => {
    const file = generateSampleFile();
    handleFileUpload(file);
  };

  return (
    <div className="min-h-screen bg-[#f1efe7] flex items-center justify-center p-4 md:p-6 font-sans">

      {/* ELEVATED CONTAINER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl bg-white rounded-[2rem] shadow-xl shadow-black/5 overflow-hidden min-h-[600px] flex flex-col relative z-10"
      >

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 relative overflow-hidden">

          {/* HERO SECTION */}
          <AnimatePresence mode="wait">
            {uploadState === "idle" && (
              <motion.div
                key="hero"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-2xl flex flex-col items-center text-center z-10"
              >
                <motion.h1
                  className="text-5xl md:text-6xl font-serif text-[#1f1f1f] mb-3 tracking-tight"
                  style={{ fontFamily: '"PP Neue Montreal", sans-serif', fontWeight: 500 }}
                >
                  The Bridge
                </motion.h1>
                <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                  Connect your data sources to begin exploratory analysis. Secure, fast, and intelligent.
                </p>

                {/* SEGMENTED CONTROL */}
                <div className="bg-gray-100 p-1 rounded-full flex items-center gap-1 mb-10 shadow-inner">
                  <button
                    onClick={() => setActiveSource("upload")}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${activeSource === "upload"
                      ? "text-black shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    {activeSource === "upload" && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-white rounded-full shadow-sm z-0"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Upload size={15} /> Upload CSV
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveSource("database")}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${activeSource === "database"
                      ? "text-black shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    {activeSource === "database" && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-white rounded-full shadow-sm z-0"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Database size={15} /> Database
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveSource("sample")}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${activeSource === "sample"
                      ? "text-black shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    {activeSource === "sample" && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-white rounded-full shadow-sm z-0"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <FileSpreadsheet size={15} /> Sample Data
                    </span>
                  </button>
                </div>

                {/* ACTIVE SOURCE CONTENT */}
                <motion.div
                  layout
                  className="w-full max-w-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeSource === "upload" && (
                    <div
                      className={`
                             group relative border-2 border-dashed rounded-[1.5rem] p-8 md:p-10 
                             flex flex-col items-center justify-center text-center
                             transition-all duration-200 cursor-pointer overflow-hidden
                             bg-white
                             ${dragActive
                          ? "border-blue-500 bg-blue-50/10 scale-[1.01]"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/30 hover:shadow-sm"
                        }
                           `}
                      onDragEnter={handleDragOver}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                        <Upload size={28} className="text-gray-400 group-hover:text-black transition-colors" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        Drop your CSV file here
                      </h3>
                      <p className="text-sm text-gray-400 mb-6">
                        or click to browse from your computer
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-300 uppercase tracking-wider font-semibold">
                        <span>CSV</span>
                        <span>•</span>
                        <span>XLSX</span>
                        <span>•</span>
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

                  {activeSource === "database" && (
                    <div className="bg-white border border-gray-200 rounded-[1.5rem] p-8 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                          <Database size={20} className="text-gray-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-gray-900">PostgreSQL Connection</h3>
                          <p className="text-xs text-gray-500">Read-only access required</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <input className="col-span-2 p-3 bg-gray-50 rounded-xl border-none text-sm outline-none focus:ring-1 focus:ring-black/10 transition-all" placeholder="Host (e.g. aws.amazon.com)" />
                        <input className="p-3 bg-gray-50 rounded-xl border-none text-sm outline-none focus:ring-1 focus:ring-black/10 transition-all" placeholder="Port" />
                        <input className="p-3 bg-gray-50 rounded-xl border-none text-sm outline-none focus:ring-1 focus:ring-black/10 transition-all" placeholder="Database" />
                        <input className="col-span-2 p-3 bg-gray-50 rounded-xl border-none text-sm outline-none focus:ring-1 focus:ring-black/10 transition-all" placeholder="Username" />
                        <input className="col-span-2 p-3 bg-gray-50 rounded-xl border-none text-sm outline-none focus:ring-1 focus:ring-black/10 transition-all" type="password" placeholder="Password" />
                      </div>
                      <button className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-colors">
                        Test Connection
                      </button>
                    </div>
                  )}

                  {activeSource === "sample" && (
                    <div className="bg-white border border-gray-200 rounded-[1.5rem] p-8 shadow-sm text-center">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                        <FileSpreadsheet size={32} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Fintech Growth Dataset</h3>
                      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        A generated dataset containing 250k rows of transaction data, including fraud patterns and user churn signals.
                      </p>
                      <button
                        onClick={handleLoadSample}
                        className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 group"
                      >
                        Generate & Load <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
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
                className="w-full h-full flex flex-col items-center justify-center"
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center w-full max-w-4xl"
                  >
                    <div className="w-full mb-8">
                      {generatedDNA && <DataDnaPreview dataDNA={generatedDNA} />}
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setUploadState("idle")}
                        className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Upload Another
                      </button>
                      <button
                        onClick={handleContinue}
                        className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-colors flex items-center gap-2 shadow-lg shadow-black/20"
                      >
                        Enter Workspace <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* BACKGROUND DECORATION */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] z-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-black rounded-full blur-3xl translate-y-[-50%]"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-black rounded-full blur-3xl translate-y-[50%]"></div>
          </div>

        </main>
      </motion.div>
    </div>

  );
}
