"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Clock, FileText, ChevronRight, Loader2, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Chat {
  id: string;
  title: string | null;
  created_at: string;
}

interface SessionWithChats {
  id: string;
  filename: string;
  status: string;
  row_count: number | null;
  created_at: string;
  chats: Chat[];
}

// ─── Color palette (same as sidebar) ─────────────────────────────────────────
const PILL_COLORS = [
  { bg: "#dde4f5", text: "#1a3a8f" },
  { bg: "#d4edda", text: "#1a6b35" },
  { bg: "#fde8d8", text: "#8f3a1a" },
  { bg: "#f5d4f5", text: "#6b1a8f" },
  { bg: "#d4f0f5", text: "#1a6b75" },
  { bg: "#f5f5d4", text: "#6b6b1a" },
];

const getDeterministicColor = (filename: string) => {
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    hash = filename.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PILL_COLORS[Math.abs(hash) % PILL_COLORS.length];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RecentsPage() {
  const router = useRouter();
  const [sessionsWithChats, setSessionsWithChats] = useState<SessionWithChats[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  // Single efficient query: sessions + their chats in one round trip
  useEffect(() => {
    async function load() {
      try {

        // Fetch sessions with nested chats in one query (no N+1)
        const { data, error } = await supabase
          .from("sessions")
          .select(`
            id,
            filename,
            status,
            row_count,
            created_at,
            chats (
              id,
              title,
              created_at
            )
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const shaped: SessionWithChats[] = (data || []).map(s => ({
          ...s,
          chats: [...(s.chats || [])].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ),
        }));

        setSessionsWithChats(shaped);

        // Auto-expand sessions that have chats
        const withChats = new Set(shaped.filter(s => s.chats.length > 0).map(s => s.id));
        setExpandedSessions(withChats);
      } catch (err) {
        console.error("Failed to load recents:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const toggleExpand = (sessionId: string) => {
    setExpandedSessions(prev => {
      const next = new Set(prev);
      next.has(sessionId) ? next.delete(sessionId) : next.add(sessionId);
      return next;
    });
  };

  const handleChatClick = (sessionId: string, chatId: string) => {
    router.push(`/workspace/${sessionId}?chat=${chatId}`);
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(`/workspace/${sessionId}`);
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="recents-page">
        <div className="recents-container">
          <div className="loading-state">
            <Loader2 size={28} className="spinner" />
            <p>Loading your sessions…</p>
          </div>
        </div>
        <Styles />
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────────
  if (sessionsWithChats.length === 0) {
    return (
      <div className="recents-page">
        <div className="recents-container">
          <header className="page-header">
            <h1>Recent Sessions</h1>
          </header>
          <div className="empty-state">
            <FileText size={52} strokeWidth={1} />
            <h2>No sessions yet</h2>
            <p>Upload a dataset to start your first analysis</p>
            <button className="cta-button" onClick={() => router.push("/connect")}>
              <Plus size={16} />
              Upload Dataset
            </button>
          </div>
        </div>
        <Styles />
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────────
  return (
    <div className="recents-page">
      <div className="recents-container">
        <header className="page-header">
          <h1>Recent Sessions</h1>
          <p className="subtitle">
            {sessionsWithChats.length} session{sessionsWithChats.length !== 1 ? "s" : ""}
          </p>
        </header>

        <div className="sessions-grid">
          {sessionsWithChats.map(session => {
            const colors = getDeterministicColor(session.filename);
            const isExpanded = expandedSessions.has(session.id);

            return (
              <div key={session.id} className="session-card">
                {/* Session Header */}
                <div
                  className="session-header"
                  onClick={() => handleSessionClick(session.id)}
                >
                  <div className="session-left">
                    {/* Color dot tied to dataset */}
                    <div
                      className="dataset-dot"
                      style={{ backgroundColor: colors.text }}
                    />
                    <div className="session-info">
                      <h3 className="session-title">{session.filename}</h3>
                      <div className="session-meta">
                        <span
                          className="status-badge"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {session.status.toUpperCase()}
                        </span>
                        {session.row_count != null && (
                          <span className="meta-item">{session.row_count.toLocaleString()} rows</span>
                        )}
                        <span className="meta-item">
                          <Clock size={11} />
                          {formatDate(session.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="session-right">
                    {session.chats.length > 0 && (
                      <button
                        className={`expand-btn ${isExpanded ? "expanded" : ""}`}
                        onClick={e => {
                          e.stopPropagation();
                          toggleExpand(session.id);
                        }}
                        title={isExpanded ? "Collapse chats" : "Show chats"}
                      >
                        <MessageSquare size={13} />
                        <span>{session.chats.length}</span>
                        <ChevronRight size={13} className="chevron-icon" />
                      </button>
                    )}
                    <ChevronRight size={18} className="goto-icon" />
                  </div>
                </div>

                {/* Chats List — collapsible */}
                {session.chats.length > 0 && isExpanded && (
                  <div className="chats-list">
                    {session.chats.map(chat => (
                      <div
                        key={chat.id}
                        className="chat-item"
                        onClick={e => {
                          e.stopPropagation();
                          handleChatClick(session.id, chat.id);
                        }}
                      >
                        <div
                          className="chat-avatar"
                          style={{ backgroundColor: colors.text }}
                        >
                          {(chat.title || "Un").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="chat-title">{chat.title || "Untitled Chat"}</span>
                        <span className="chat-time">{formatDate(chat.created_at)}</span>
                        <ChevronRight size={13} className="chat-arrow" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Styles />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function Styles() {
  return (
    <style jsx global>{`
      .recents-page {
        min-height: 100vh;
        background: var(--bg);
        padding: 2.5rem 2rem;
      }

      .recents-container {
        max-width: 860px;
        margin: 0 auto;
      }

      /* Header */
      .page-header {
        margin-bottom: 2rem;
      }

      .page-header h1 {
        font-size: 2rem;
        font-weight: 600;
        color: var(--fg);
        margin: 0 0 0.25rem 0;
        letter-spacing: -0.03em;
      }

      .subtitle {
        font-size: 0.875rem;
        color: var(--text-muted);
        margin: 0;
      }

      /* Loading */
      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 5rem 2rem;
        color: var(--text-muted);
        font-size: 0.875rem;
      }

      .spinner {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* Empty */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 0.75rem;
        padding: 5rem 2rem;
        color: var(--text-muted);
      }

      .empty-state h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--fg);
        margin: 0.5rem 0 0;
      }

      .empty-state p {
        font-size: 0.9rem;
        margin: 0;
      }

      .cta-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.75rem;
        padding: 0.75rem 1.5rem;
        background: var(--fg);
        color: var(--bg);
        border: none;
        border-radius: 0.5rem;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s;
      }

      .cta-button:hover { opacity: 0.85; }

      /* Grid */
      .sessions-grid {
        display: grid;
        gap: 1rem;
      }

      /* Card */
      .session-card {
        background: var(--bg-surface);
        border: 1px solid var(--stroke);
        border-radius: 0.875rem;
        overflow: hidden;
        transition: box-shadow 0.2s, border-color 0.2s;
      }

      .session-card:hover {
        border-color: var(--fg);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      }

      /* Session header row */
      .session-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.5rem;
        cursor: pointer;
        gap: 1rem;
      }

      .session-left {
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 0;
        flex: 1;
      }

      .dataset-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .session-info {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        min-width: 0;
      }

      .session-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--fg);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .session-meta {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        flex-wrap: wrap;
      }

      .status-badge {
        padding: 0.2rem 0.55rem;
        border-radius: 0.3rem;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.05em;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.8rem;
        color: var(--text-muted);
      }

      /* Right side of session header */
      .session-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-shrink: 0;
      }

      .expand-btn {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.3rem 0.625rem;
        border: 1px solid var(--stroke);
        border-radius: 1rem;
        background: transparent;
        font-size: 0.75rem;
        color: var(--text-muted);
        cursor: pointer;
        transition: all 0.15s;
      }

      .expand-btn:hover {
        background: var(--bg);
        color: var(--fg);
        border-color: var(--fg);
      }

      .chevron-icon {
        transition: transform 0.2s;
      }

      .expand-btn.expanded .chevron-icon {
        transform: rotate(90deg);
      }

      .goto-icon {
        color: var(--text-muted);
        transition: transform 0.15s;
      }

      .session-header:hover .goto-icon {
        transform: translateX(3px);
        color: var(--fg);
      }

      /* Chats list */
      .chats-list {
        border-top: 1px solid var(--stroke);
        padding: 0.625rem 0.75rem;
        background: var(--bg);
      }

      .chat-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.625rem 0.75rem;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: background 0.15s;
      }

      .chat-item:hover {
        background: var(--bg-surface);
      }

      .chat-avatar {
        width: 26px;
        height: 26px;
        border-radius: 6px;
        color: white;
        font-size: 9px;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .chat-title {
        flex: 1;
        font-size: 0.875rem;
        color: var(--fg);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .chat-time {
        font-size: 0.75rem;
        color: var(--text-muted);
        flex-shrink: 0;
      }

      .chat-arrow {
        color: var(--text-muted);
        opacity: 0;
        transition: opacity 0.15s, transform 0.15s;
        flex-shrink: 0;
      }

      .chat-item:hover .chat-arrow {
        opacity: 1;
        transform: translateX(2px);
      }

      @media (max-width: 640px) {
        .recents-page { padding: 1.25rem 1rem; }
        .session-header { padding: 1rem; }
        .chats-list { padding: 0.5rem; }
        .page-header h1 { font-size: 1.5rem; }
      }
    `}</style>
  );
}