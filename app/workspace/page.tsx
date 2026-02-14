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
    <div className="workspace-page">
      {/* Navigation */}
      <nav className="workspace-nav">
        <div className="logo-name">
          <a href="/">InsightX</a>
        </div>
        <div className="nav-items">
          <a href="/workspace" className="active">Workspace</a>
          <a href="/reports">Reports</a>
          <a href="/connect">Settings</a>
        </div>
        <div className="divider" />
      </nav>

      {/* Sidebar (Fixed Icons) */}
      <div className="sidebar">
        <div className="divider" />
      </div>

      {/* Main Layout Container */}
      <div className="workspace-layout">

        {/* Left Pane: History */}
        <div className="history-panel">
          <div className="panel-header">
            <h3>History</h3>
            <button className="icon-btn"><Plus size={16} /></button>
          </div>
          <div className="search-bar">
            <Search size={14} />
            <input type="text" placeholder="Search chats..." />
          </div>
          <div className="history-list custom-scrollbar">
            <div className="history-item active">
              <MessageSquare size={14} />
              <div className="history-info">
                <span className="history-title">Transaction Failures</span>
                <span className="history-time">Just now</span>
              </div>
            </div>
            <div className="history-item">
              <MessageSquare size={14} />
              <div className="history-info">
                <span className="history-title">User Retention Analysis</span>
                <span className="history-time">2h ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Pane: Chat */}
        <div className="chat-panel">
          <div className="chat-content custom-scrollbar" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="empty-state">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1>Analyze {dataDNA.filename}</h1>
                  <SuggestedQueryChips
                    queries={dataDNA.patterns.map(p => `Analyze ${p}`)}
                    onQueryClick={handleQueryClick}
                  />
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

          <div className="input-area">
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
        </div>

        {/* Right Pane: Data DNA */}
        <div className="dna-panel-container">
          <DataDNAPanel dataDNA={dataDNA} />
        </div>

      </div>

      <style jsx>{`
        .workspace-page {
          width: 100vw;
          height: 100vh;
          background-color: var(--bg);
          color: var(--fg);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .workspace-nav {
          height: 5rem;
          padding: 1rem 1.5rem 1rem 7.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
          border-bottom: 1px solid var(--stroke);
          background: var(--bg);
          z-index: 20;
        }

        .logo-name a {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--fg);
          text-decoration: none;
        }

        .nav-items {
            display: flex;
            gap: 2rem;
        }
        
        .nav-items a {
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 500;
            transition: color 0.2s;
        }
        
        .nav-items a.active, .nav-items a:hover {
            color: var(--fg);
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 5rem;
          height: 100vh;
          border-right: 1px solid var(--stroke);
          z-index: 30;
        }

        .workspace-layout {
            display: flex;
            height: calc(100vh - 5rem);
            margin-left: 5rem;
            width: calc(100vw - 5rem);
        }

        /* History Panel */
        .history-panel {
            width: 280px;
            border-right: 1px solid var(--stroke);
            display: flex;
            flex-direction: column;
            background: var(--bg-surface);
        }

        .panel-header {
            padding: 1rem 1.25rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .panel-header h3 {
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            margin: 0;
        }

        .icon-btn {
            background: transparent;
            border: none;
            color: var(--fg);
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 4px;
        }
        .icon-btn:hover { background: var(--bg-elevated); }

        .search-bar {
            margin: 0 1.25rem 1rem;
            padding: 0.5rem 0.75rem;
            background: var(--bg);
            border: 1px solid var(--stroke);
            border-radius: 0.375rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-muted);
        }

        .search-bar input {
            background: transparent;
            border: none;
            outline: none;
            font-size: 0.875rem;
            width: 100%;
            color: var(--fg);
        }

        .history-list {
            flex: 1;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
        }

        .history-item {
            padding: 0.75rem 1.25rem;
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            cursor: pointer;
            transition: background 0.2s;
            border-left: 2px solid transparent;
        }

        .history-item:hover { background: var(--bg-base); }
        .history-item.active { 
            background: var(--bg-base);
            border-left-color: var(--accent-blue);
        }

        .history-info {
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
        }

        .history-title {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--fg);
        }

        .history-time {
            font-size: 0.75rem;
            color: var(--text-muted);
        }

        /* Chat Panel */
        .chat-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: var(--bg);
            position: relative;
        }

        .chat-content {
            flex: 1;
            overflow-y: auto;
            padding: 2rem;
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
        }
        
        .empty-state h1 {
            font-size: 2rem;
            font-weight: 500;
            margin-bottom: 2rem;
            color: var(--fg);
        }

        .message-list {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
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

        .input-area {
            padding: 1.5rem 2rem;
            border-top: 1px solid var(--stroke);
            background: var(--bg);
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

        /* Right Panel */
        .dna-panel-container {
            width: 320px;
            flex-shrink: 0;
            height: 100%;
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--stroke); border-radius: 3px; }
      `}</style>
    </div>
  );
}

