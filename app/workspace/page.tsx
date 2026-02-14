"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Plus, MessageSquare, History, Search } from "lucide-react";
import SuggestedQueryChips from "@/components/interactive/SuggestedQueryChips";
import DataDNAPanel from "@/components/workspace/DataDNAPanel";
import AgentMessage, { AgentType } from "@/components/workspace/AgentMessage";
import { useDataStore } from "@/store/dataStore";
import { useChatStore } from "@/store/chatStore";

export default function WorkspacePage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const { dataDNA } = useDataStore();
  const { createSession } = useChatStore();
  const [messages, setMessages] = useState<any[]>([]); // Mock state for demo
  const scrollRef = useRef<HTMLDivElement>(null);

  // Redirect to /connect if no dataset loaded
  useEffect(() => {
    if (!dataDNA) {
      router.push("/connect");
    }
  }, [dataDNA, router]);

  const handleSend = () => {
    if (!input.trim() || !dataDNA) return;

    // Add user message
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate AI response after delay
    setTimeout(() => {
      const aiMsg = {
        role: "agent",
        agentType: "orchestrator",
        content: "I've analyzed the transaction failures. It appears to be network-related.",
        insight: "Failed transactions are 45% more likely on 4G networks during peak hours (8-9 PM).",
        recommendation: "Investigate the 4G gateway latency logs for that specific time window.",
        context: "Filtered for 'failed' status and grouped by network_type."
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    <div className="workspace-root">

      {/* TOP NAVIGATION BAR */}
      <nav className="top-nav-bar">
        <div className="nav-left">
          <span className="logo-text" onClick={() => router.push('/')}>InsightX</span>
          <div className="nav-links">
            <span className="nav-link active">Workspace</span>
            <span className="nav-link" onClick={() => router.push('/reports')}>Reports</span>
          </div>
        </div>
        <div className="nav-center">
          <span className="dataset-badge">{dataDNA.filename}</span>
        </div>
        <div className="nav-right">
          <button className="share-btn">Share War Room</button>
          <div className="user-avatar">U</div>
        </div>
      </nav>

      {/* WORKSPACE BODY - 3 COLUMN LAYOUT */}
      <div className="workspace-body">

        {/* LEFT SIDEBAR */}
        <aside className="left-sidebar">
          <button className="new-analysis-btn" onClick={() => router.push('/connect')}>
            <Plus size={16} />
            New Analysis
          </button>

          <section className="sidebar-section">
            <h4 className="section-title">Recent Threads</h4>
            <div className="thread-list custom-scrollbar">
              <div className="thread-item active">
                <MessageSquare size={14} />
                <div className="thread-info">
                  <span className="thread-title">Transaction Failures</span>
                  <span className="thread-time">Just now</span>
                </div>
              </div>
              <div className="thread-item">
                <MessageSquare size={14} />
                <div className="thread-info">
                  <span className="thread-title">User Retention Analysis</span>
                  <span className="thread-time">2h ago</span>
                </div>
              </div>
              <div className="thread-item">
                <MessageSquare size={14} />
                <div className="thread-info">
                  <span className="thread-title">Payment Gateway Latency</span>
                  <span className="thread-time">5h ago</span>
                </div>
              </div>
            </div>
          </section>

          <section className="sidebar-section">
            <h4 className="section-title">Pinned Insights</h4>
            <div className="pinned-list">
              <div className="pinned-item">
                <History size={14} />
                <span>4G Timeout Pattern</span>
              </div>
              <div className="pinned-item">
                <History size={14} />
                <span>Weekend Spike Analysis</span>
              </div>
            </div>
          </section>

          <div className="sidebar-search">
            <Search size={14} />
            <input type="text" placeholder="Search..." />
          </div>
        </aside>

        {/* MAIN CHAT PANEL */}
        <main className="chat-panel">
          <div className="chat-scroll-area custom-scrollbar" ref={scrollRef}>
            <div className="chat-content-constrained">
              {messages.length === 0 ? (
                <div className="empty-state">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h1>Analyze {dataDNA.filename}</h1>
                    <div className="suggestions-container">
                      <div className="suggestions-label">Quick Actions</div>
                      <SuggestedQueryChips
                        queries={dataDNA.patterns.map(p => `Analyze ${p}`)}
                        onQueryClick={handleQueryClick}
                      />
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="message-list">
                  {messages.map((msg, i) => (
                    msg.role === "user" ? (
                      <div key={i} className="user-message">
                        {msg.content}
                      </div>
                    ) : (
                      <AgentMessage key={i} {...msg} />
                    )
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="chat-input-fixed">
            <div className="input-container">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                rows={1}
              />
              <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </main>

        {/* RIGHT DATA PANEL */}
        <aside className="right-data-panel">
          <DataDNAPanel dataDNA={dataDNA} />
        </aside>

      </div>

      <style jsx>{`
        /* ROOT CONTAINER */
        .workspace-root {
          width: 100vw;
          height: 100vh;
          background-color: var(--bg);
          color: var(--fg);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* TOP NAVIGATION BAR */
        .top-nav-bar {
          height: 4rem;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          border-bottom: 1px solid var(--stroke);
          background: var(--bg);
          z-index: 20;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--fg);
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .logo-text:hover {
          opacity: 0.7;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .nav-link {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.2s;
          position: relative;
        }

        .nav-link:hover {
          color: var(--fg);
        }

        .nav-link.active {
          color: var(--fg);
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -1.125rem;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--fg);
        }

        .nav-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .dataset-badge {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-muted);
          padding: 0.375rem 0.875rem;
          background: var(--bg-surface);
          border: 1px solid var(--stroke);
          border-radius: 0.5rem;
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .share-btn {
          padding: 0.5rem 1rem;
          background: var(--fg);
          color: var(--bg);
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .share-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(31, 31, 31, 0.15);
        }

        .user-avatar {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: var(--bg-elevated);
          border: 1px solid var(--stroke);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--fg);
        }

        /* WORKSPACE BODY - 3 COLUMNS */
        .workspace-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* LEFT SIDEBAR */
        .left-sidebar {
          width: 280px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: var(--bg-surface);
          border-right: 1.5px solid var(--stroke);
          overflow: hidden;
        }

        .new-analysis-btn {
          margin: 1.25rem;
          padding: 0.75rem 1rem;
          background: var(--fg);
          color: var(--bg);
          border: none;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .new-analysis-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(31, 31, 31, 0.15);
        }

        .sidebar-section {
          display: flex;
          flex-direction: column;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin: 0 0 0.75rem 0;
          padding: 0 1.25rem;
        }

        .thread-list {
          display: flex;
          flex-direction: column;
          max-height: 200px;
          overflow-y: auto;
        }

        .thread-item {
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
          transition: background 0.2s;
          border-left: 2px solid transparent;
        }

        .thread-item:hover {
          background: var(--bg-base);
        }

        .thread-item.active {
          background: var(--bg-base);
          border-left-color: var(--accent-blue);
        }

        .thread-info {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          flex: 1;
        }

        .thread-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--fg);
        }

        .thread-time {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .pinned-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0 1.25rem;
        }

        .pinned-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: var(--bg-base);
          border-radius: 0.375rem;
          font-size: 0.8125rem;
          color: var(--fg);
          cursor: pointer;
          transition: background 0.2s;
        }

        .pinned-item:hover {
          background: var(--bg-elevated);
        }

        .sidebar-search {
          margin: auto 1.25rem 1.25rem;
          padding: 0.5rem 0.75rem;
          background: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 0.375rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
        }

        .sidebar-search input {
          background: transparent;
          border: none;
          outline: none;
          font-size: 0.875rem;
          width: 100%;
          color: var(--fg);
        }

        /* MAIN CHAT PANEL */
        .chat-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--bg);
          overflow: hidden;
        }

        .chat-scroll-area {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
        }

        .chat-content-constrained {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          min-height: 400px;
        }
        
        .empty-state h1 {
          font-size: 2rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
          color: var(--fg);
        }

        .suggestions-container {
          background: var(--bg-surface);
          border: 1px solid var(--stroke);
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-top: 1rem;
        }

        .suggestions-label {
          font-size: 0.8125rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .message-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          width: 100%;
        }

        .user-message {
          align-self: flex-end;
          background: var(--bg-elevated);
          padding: 0.75rem 1.25rem;
          border-radius: 1rem 1rem 0 1rem;
          max-width: 80%;
          font-size: 1rem;
          color: var(--fg);
        }

        .chat-input-fixed {
          padding: 1.5rem 2rem;
          border-top: 1px solid var(--stroke);
          background: var(--bg);
          flex-shrink: 0;
        }

        .input-container {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          background: var(--bg-surface);
          border: 1px solid var(--stroke);
          border-radius: 0.75rem;
          padding: 0.5rem;
          display: flex;
          align-items: flex-end;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .input-container:focus-within {
          border-color: var(--fg);
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .input-container textarea {
          flex: 1;
          border: none;
          background: transparent;
          padding: 0.75rem 1rem;
          resize: none;
          outline: none;
          font-family: inherit;
          font-size: 1rem;
          max-height: 120px;
          color: var(--fg);
        }

        .send-btn {
          background: var(--fg);
          color: var(--bg);
          border: none;
          border-radius: 0.5rem;
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .send-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* RIGHT DATA PANEL */
        .right-data-panel {
          width: 320px;
          flex-shrink: 0;
          height: 100%;
          overflow-y: auto;
          border-left: 1.5px solid var(--stroke);
        }

        /* CUSTOM SCROLLBAR */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--stroke);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}

