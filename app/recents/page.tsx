"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessions } from "@/lib/hooks";
import { MessageSquare, Clock, FileText, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

interface SessionWithChats {
  id: string;
  filename: string;
  status: string;
  row_count: number | null;
  created_at: string;
  chats: Array<{
    id: string;
    title: string | null;
    created_at: string;
  }>;
}

export default function RecentsPage() {
  const router = useRouter();
  const { sessions, loading: sessionsLoading } = useSessions();
  const [sessionsWithChats, setSessionsWithChats] = useState<SessionWithChats[]>([]);
  const [loading, setLoading] = useState(true);

  // Load chats for each session
  useEffect(() => {
    async function loadChatsForSessions() {
      if (sessionsLoading || sessions.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const sessionsWithChatsData = await Promise.all(
          sessions.map(async (session) => {
            const { data: chats } = await supabase
              .from('chats')
              .select('id, title, created_at')
              .eq('session_id', session.id)
              .order('created_at', { ascending: false });

            return {
              id: session.id,
              filename: session.filename,
              status: session.status,
              row_count: session.row_count,
              created_at: session.created_at,
              chats: chats || [],
            };
          })
        );

        setSessionsWithChats(sessionsWithChatsData);
      } catch (error) {
        console.error('Failed to load chats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadChatsForSessions();
  }, [sessions, sessionsLoading]);

  const handleChatClick = (sessionId: string, chatId: string) => {
    router.push(`/workspace/${sessionId}?chat=${chatId}`);
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(`/workspace/${sessionId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading || sessionsLoading) {
    return (
      <div className="recents-page">
        <div className="recents-container">
          <div className="loading-state">
            <Loader2 size={32} className="spinner" />
            <p>Loading your sessions...</p>
          </div>
        </div>

        <style jsx>{`
          .recents-page {
            min-height: 100vh;
            background: var(--bg);
            padding: 2rem;
          }

          .recents-container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            padding: 4rem 2rem;
            color: var(--text-muted);
          }

          .spinner {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (sessionsWithChats.length === 0) {
    return (
      <div className="recents-page">
        <div className="recents-container">
          <header className="page-header">
            <h1>Recent Sessions</h1>
            <p className="subtitle">Your analysis history</p>
          </header>

          <div className="empty-state">
            <FileText size={64} strokeWidth={1} />
            <h2>No sessions yet</h2>
            <p>Upload a dataset to get started with your first analysis</p>
            <button className="cta-button" onClick={() => router.push('/connect')}>
              Upload Dataset
            </button>
          </div>
        </div>

        <style jsx>{`
          .recents-page {
            min-height: 100vh;
            background: var(--bg);
            padding: 2rem;
          }

          .recents-container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .page-header {
            margin-bottom: 3rem;
          }

          .page-header h1 {
            font-size: 2.5rem;
            font-weight: 500;
            color: var(--fg);
            margin: 0 0 0.5rem 0;
            letter-spacing: -0.02em;
          }

          .subtitle {
            font-size: 1.125rem;
            color: var(--text-muted);
            margin: 0;
          }

          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            text-align: center;
            color: var(--text-muted);
          }

          .empty-state h2 {
            font-size: 1.5rem;
            font-weight: 500;
            color: var(--fg);
            margin: 1.5rem 0 0.5rem 0;
          }

          .empty-state p {
            font-size: 1rem;
            margin: 0 0 2rem 0;
          }

          .cta-button {
            padding: 0.875rem 2rem;
            background: var(--fg);
            color: var(--bg);
            border: none;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
          }

          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="recents-page">
      <div className="recents-container">
        <header className="page-header">
          <h1>Recent Sessions</h1>
          <p className="subtitle">{sessionsWithChats.length} session{sessionsWithChats.length !== 1 ? 's' : ''}</p>
        </header>

        <div className="sessions-grid">
          {sessionsWithChats.map((session) => (
            <div key={session.id} className="session-card">
              <div className="session-header" onClick={() => handleSessionClick(session.id)}>
                <div className="session-info">
                  <FileText size={20} />
                  <div className="session-details">
                    <h3 className="session-title">{session.filename}</h3>
                    <div className="session-meta">
                      <span className={`status-badge ${session.status}`}>
                        {session.status}
                      </span>
                      {session.row_count && (
                        <>
                          <span className="dot">•</span>
                          <span>{session.row_count.toLocaleString()} rows</span>
                        </>
                      )}
                      <span className="dot">•</span>
                      <span className="timestamp">
                        <Clock size={12} />
                        {formatDate(session.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="chevron" />
              </div>

              {session.chats.length > 0 && (
                <div className="chats-list">
                  <div className="chats-header">
                    <MessageSquare size={14} />
                    <span>{session.chats.length} chat{session.chats.length !== 1 ? 's' : ''}</span>
                  </div>
                  {session.chats.map((chat) => (
                    <div
                      key={chat.id}
                      className="chat-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChatClick(session.id, chat.id);
                      }}
                    >
                      <MessageSquare size={14} />
                      <span className="chat-title">{chat.title || 'Untitled Chat'}</span>
                      <span className="chat-time">{formatDate(chat.created_at)}</span>
                      <ChevronRight size={14} className="chat-chevron" />
                    </div>
                  ))}
                </div>
              )}

              {session.chats.length === 0 && (
                <div className="no-chats">
                  <MessageSquare size={14} />
                  <span>No chats yet</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .recents-page {
          min-height: 100vh;
          background: var(--bg);
          padding: 2rem;
        }

        .recents-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2.5rem;
          font-weight: 500;
          color: var(--fg);
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.02em;
        }

        .subtitle {
          font-size: 1rem;
          color: var(--text-muted);
          margin: 0;
        }

        .sessions-grid {
          display: grid;
          gap: 1.5rem;
        }

        .session-card {
          background: var(--bg-surface);
          border: 1px solid var(--stroke);
          border-radius: 0.75rem;
          overflow: hidden;
          transition: all 0.2s;
        }

        .session-card:hover {
          border-color: var(--fg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .session-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .session-header:hover {
          background: var(--loader-bg);
        }

        .session-info {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex: 1;
        }

        .session-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .session-title {
          font-size: 1.125rem;
          font-weight: 500;
          color: var(--fg);
          margin: 0;
        }

        .session-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .status-badge {
          padding: 0.25rem 0.625rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-badge.ready {
          background: rgba(34, 197, 94, 0.1);
          color: rgb(34, 197, 94);
        }

        .status-badge.exploring {
          background: rgba(234, 179, 8, 0.1);
          color: rgb(234, 179, 8);
        }

        .status-badge.uploading {
          background: rgba(59, 130, 246, 0.1);
          color: rgb(59, 130, 246);
        }

        .dot {
          color: var(--stroke);
        }

        .timestamp {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .chevron {
          color: var(--text-muted);
          transition: transform 0.2s;
        }

        .session-header:hover .chevron {
          transform: translateX(4px);
        }

        .chats-list {
          border-top: 1px solid var(--stroke);
          padding: 1rem 1.5rem;
          background: var(--bg);
        }

        .chats-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }

        .chat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background 0.2s;
          margin-bottom: 0.5rem;
        }

        .chat-item:last-child {
          margin-bottom: 0;
        }

        .chat-item:hover {
          background: var(--loader-bg);
        }

        .chat-title {
          flex: 1;
          font-size: 0.9375rem;
          color: var(--fg);
        }

        .chat-time {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }

        .chat-chevron {
          color: var(--text-muted);
          opacity: 0;
          transition: opacity 0.2s, transform 0.2s;
        }

        .chat-item:hover .chat-chevron {
          opacity: 1;
          transform: translateX(2px);
        }

        .no-chats {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1.5rem;
          border-top: 1px solid var(--stroke);
          font-size: 0.875rem;
          color: var(--text-muted);
          background: var(--bg);
        }

        @media (max-width: 768px) {
          .recents-page {
            padding: 1rem;
          }

          .page-header h1 {
            font-size: 2rem;
          }

          .session-header {
            padding: 1rem;
          }

          .chats-list {
            padding: 0.75rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}
