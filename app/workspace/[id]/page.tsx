"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import ContextSidebar from "@/components/layout/ContextSidebar";
import ArtifactPanel from "@/components/layout/ArtifactPanel";
import ChatTimeline from "@/components/chat/ChatTimeline";
import ChatInput from "@/components/chat/ChatInput";
import UserMessage from "@/components/chat/UserMessage";
import AgentMessage from "@/components/chat/AgentMessage";
import FollowUpSuggester from "@/components/interactive/FollowUpSuggester";
import FeedbackButtons from "@/components/interactive/FeedbackButtons";
import { useChatStore } from "@/store/chatStore";
import { useDataStore } from "@/store/dataStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import type { Message } from "@/store/chatStore";

export default function ActiveWorkspacePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const sessionId = params.id;

  const { sessions, getSessionMessages, addMessage, setStreaming, isStreaming } =
    useChatStore();
  const { dataDNA } = useDataStore();
  const {
    isLeftSidebarOpen,
    isRightPanelOpen,
    toggleLeftSidebar,
    toggleRightPanel,
    setWorkspaceMode,
  } = useWorkspaceStore();

  const [messages, setMessages] = useState<Message[]>([]);

  // Set workspace mode to active
  useEffect(() => {
    setWorkspaceMode("active");
  }, [setWorkspaceMode]);

  // Load messages for this session
  useEffect(() => {
    const sessionMessages = getSessionMessages(sessionId);
    setMessages(sessionMessages);
  }, [sessionId, getSessionMessages]);

  // Redirect if no dataset
  useEffect(() => {
    if (!dataDNA) {
      router.push("/connect");
    }
  }, [dataDNA, router]);

  // Mock agent response generator
  const generateMockResponse = (userQuery: string): Message => {
    return {
      id: `msg_${Date.now()}`,
      sessionId,
      type: "orchestrator",
      content: `Based on your question "${userQuery}", I've analyzed the data and found some interesting patterns.`,
      thinking: [
        "Analyzing user query...",
        "Routing to SQL Agent...",
        "Executing query...",
        "Processing results...",
      ],
      code: {
        sql: `SELECT 
  payment_method,
  COUNT(*) as transaction_count,
  AVG(amount) as avg_amount,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failures
FROM transactions
WHERE timestamp >= '2024-01-01'
GROUP BY payment_method
ORDER BY transaction_count DESC;`,
      },
      insight: {
        title: "Transaction Volume",
        metric: "250,000",
        trend: "up",
        trendValue: "+15%",
      },
      timestamp: new Date(),
    };
  };

  const handleSendMessage = (content: string) => {
    // Add user message
    addMessage({
      sessionId,
      type: "user",
      content,
    });

    // Simulate agent response
    setStreaming(true);
    setTimeout(() => {
      const response = generateMockResponse(content);
      addMessage(response);
      setStreaming(false);

      // Update local state
      setMessages(getSessionMessages(sessionId));
    }, 2000);
  };

  const handleFollowUpClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  if (!dataDNA) {
    return null; // Will redirect
  }

  const session = sessions.find((s) => s.id === sessionId);

  return (
    <div className="active-workspace">
      {/* Navigation */}
      <nav className="workspace-nav">
        <div className="nav-left">
          <button className="menu-btn" onClick={toggleLeftSidebar}>
            {isLeftSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
          <div className="logo-name">
            <a href="/">InsightX</a>
          </div>
        </div>
        <div className="nav-center">
          <h2 className="session-title">{session?.title || "New Analysis"}</h2>
        </div>
        <div className="nav-right">
          <a href="/workspace">Workspace</a>
          <a href="/reports">Reports</a>
          <button className="panel-toggle" onClick={toggleRightPanel}>
            {isRightPanelOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        <div className="divider" />
      </nav>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="divider" />
      </div>

      {/* 3-Pane Layout */}
      <div className="workspace-container">
        {/* Left Panel - Context Sidebar */}
        <ContextSidebar sessionId={sessionId} />

        {/* Center Panel - Chat */}
        <div className="center-panel">
          <ChatTimeline messages={messages}>
            {messages.map((message) => (
              <div key={message.id}>
                {message.type === "user" ? (
                  <UserMessage content={message.content} />
                ) : (
                  <div>
                    <AgentMessage message={message} />
                    <FollowUpSuggester
                      suggestions={[
                        "Show breakdown by network type",
                        "Compare with last month",
                        "Identify peak failure times",
                      ]}
                      onSuggestionClick={handleFollowUpClick}
                    />
                    <FeedbackButtons messageId={message.id} />
                  </div>
                )}
              </div>
            ))}
          </ChatTimeline>
          <ChatInput onSend={handleSendMessage} disabled={isStreaming} />
        </div>

        {/* Right Panel - Artifact Panel */}
        <ArtifactPanel />
      </div>

      <style jsx>{`
        .active-workspace {
          position: relative;
          width: 100%;
          height: 100vh;
          background-color: var(--bg-base);
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
        }

        .workspace-nav {
          position: relative;
          width: 100%;
          height: 5rem;
          padding: 1.5rem 1.5rem 1.5rem 7.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--bg-surface);
          border-bottom: 1px solid var(--border);
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .menu-btn,
        .panel-toggle {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          transition: color var(--transition-fast) ease;
        }

        .menu-btn:hover,
        .panel-toggle:hover {
          color: var(--text-primary);
        }

        .logo-name a {
          font-size: 1.5rem;
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 600;
        }

        .nav-center {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .session-title {
          font-size: 1rem;
          font-weight: 500;
          color: var(--text-primary);
          margin: 0;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-right a {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          transition: color var(--transition-fast) ease;
        }

        .nav-right a:hover {
          color: var(--text-primary);
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
          background-color: var(--border);
        }

        .workspace-container {
          display: flex;
          flex: 1;
          overflow: hidden;
          margin-left: 5rem;
        }

        .center-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-base);
          overflow: hidden;
        }

        @media (max-width: 1000px) {
          .workspace-nav {
            padding: 1.5rem 1.5rem 1.5rem 7.5rem;
          }

          .nav-right a {
            display: none;
          }

          .session-title {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
}
