"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Send, Plus } from "lucide-react";
import SuggestedQueryChips from "@/components/interactive/SuggestedQueryChips";
import DatasetBadge from "@/components/interactive/DatasetBadge";
import { useDataStore } from "@/store/dataStore";
import { useChatStore } from "@/store/chatStore";

export default function WorkspacePage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const { dataDNA } = useDataStore();
  const { createSession } = useChatStore();

  // Redirect to /connect if no dataset loaded
  useEffect(() => {
    if (!dataDNA) {
      router.push("/connect");
    }
  }, [dataDNA, router]);

  // Generate suggested queries based on Data DNA
  const suggestedQueries = dataDNA
    ? [
      `Why are failures high?`,
      `Show ${dataDNA.patterns[0] || "transaction"} trends`,
      `Analyze ${dataDNA.baselines.peakHours || "peak hours"}`,
      `Compare payment methods`,
    ]
    : [];

  const handleSend = () => {
    if (!input.trim() || !dataDNA) return;

    // Create new session
    const sessionId = createSession(dataDNA.filename);

    // Redirect to active session
    router.push(`/workspace/${sessionId}`);
  };

  const handleQueryClick = (query: string) => {
    setInput(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!dataDNA) {
    return null; // Will redirect
  }

  return (
    <div className="workspace-page">
      {/* Navigation */}
      <nav className="workspace-nav">
        <div className="logo-name">
          <a href="/">InsightX</a>
        </div>
        <div className="nav-items">
          <a href="/workspace" className="active">
            Workspace
          </a>
          <a href="/reports">Reports</a>
          <a href="/connect">Settings</a>
        </div>
        <div className="divider" />
      </nav>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="divider" />
      </div>

      {/* Centered Content */}
      <motion.div
        className="centered-stage"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Dataset Badge - Top Right */}
        <div className="dataset-badge-container">
          <DatasetBadge filename={dataDNA.filename} rowCount={dataDNA.rowCount} />
        </div>

        {/* Main Content - Centered */}
        <div className="content-wrapper">
          <motion.div
            className="header-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1>What do you want to explore?</h1>
            <p className="subtitle">
              Ask questions about your data. I'll analyze it using SQL and Python.
            </p>
          </motion.div>

          <motion.div
            className="input-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="input-container">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your data..."
                rows={4}
                autoFocus
              />
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={!input.trim()}
              >
                <Send size={20} />
              </button>
            </div>
            <p className="hint">
              Press <kbd>Enter</kbd> to send · <kbd>Shift + Enter</kbd> for new line
            </p>
          </motion.div>

          <motion.div
            className="suggestions-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <p className="suggestions-label">Suggested queries:</p>
            <SuggestedQueryChips
              queries={suggestedQueries}
              onQueryClick={handleQueryClick}
            />
          </motion.div>
        </div>

        {/* New Chat Button - Bottom Left */}
        <motion.button
          className="new-chat-btn"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          onClick={() => router.push("/connect")}
        >
          <Plus size={20} />
          <span>New Dataset</span>
        </motion.button>
      </motion.div>

      <style jsx>{`
        .workspace-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background-color: var(--bg);
          color: var(--fg);
        }

        .workspace-nav {
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

        .nav-items {
          display: flex;
          gap: 2rem;
        }

        .nav-items a {
          color: rgba(31, 31, 31, 0.7);
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          transition: color var(--transition-fast) ease;
        }

        .nav-items a:hover,
        .nav-items a.active {
          color: var(--fg);
        }

        .workspace-nav .divider {
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
          z-index: 10;
        }

        .sidebar .divider {
          position: absolute;
          right: 0;
          top: 0;
          width: 1px;
          height: 100vh;
          background-color: var(--stroke);
        }

        .centered-stage {
          position: relative;
          min-height: calc(100vh - 5rem);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 7.5rem 3rem 7.5rem;
        }

        .dataset-badge-container {
          position: absolute;
          top: 2rem;
          right: 2rem;
        }

        .content-wrapper {
          width: 100%;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .header-section {
          text-align: center;
        }

        .header-section h1 {
          font-size: 3rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--fg);
          line-height: 1.2;
        }

        .subtitle {
          font-size: 1.125rem;
          color: rgba(31, 31, 31, 0.7);
          line-height: 1.5;
        }

        .input-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .input-container {
          position: relative;
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
        }

        .input-container textarea {
          flex: 1;
          padding: 1rem 1.25rem;
          background-color: transparent;
          border: 1px solid var(--stroke);
          border-radius: 0.75rem;
          font-family: inherit;
          font-size: 1rem;
          color: var(--fg);
          resize: none;
          line-height: 1.5;
          transition: all var(--transition-fast) ease;
        }

        .input-container textarea:focus {
          outline: none;
          border-color: var(--accent);
          background-color: var(--loader-bg);
        }

        .input-container textarea::placeholder {
          color: rgba(31, 31, 31, 0.5);
        }

        .send-btn {
          padding: 1rem;
          background-color: var(--fg);
          color: var(--bg);
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all var(--transition-fast) ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-btn:hover:not(:disabled) {
          transform: scale(1.02);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .hint {
          text-align: center;
          font-size: 0.875rem;
          color: rgba(31, 31, 31, 0.7);
        }

        .hint kbd {
          padding: 0.125rem 0.375rem;
          background-color: var(--loader-bg);
          border: 1px solid var(--stroke);
          border-radius: 0.25rem;
          font-family: "Geist Mono", "JetBrains Mono", monospace;
          font-size: 0.75rem;
        }

        .suggestions-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
        }

        .suggestions-label {
          font-size: 0.875rem;
          color: rgba(31, 31, 31, 0.7);
          font-weight: 500;
        }

        .new-chat-btn {
          position: absolute;
          bottom: 2rem;
          left: 7.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background-color: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 0.375rem;
          color: var(--fg);
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast) ease;
        }

        .new-chat-btn:hover {
          border-color: var(--success);
          background-color: var(--loader-bg);
        }

        @media (max-width: 1000px) {
          .centered-stage {
            padding: 2rem 1.5rem 2rem 7.5rem;
          }

          .header-section h1 {
            font-size: 2rem;
          }

          .subtitle {
            font-size: 1rem;
          }

          .dataset-badge-container {
            position: static;
            margin-bottom: 2rem;
            display: flex;
            justify-content: center;
          }

          .new-chat-btn {
            left: 1.5rem;
            bottom: 1.5rem;
          }

          .nav-items {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
