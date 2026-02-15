"use client";

import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { usePathname } from "next/navigation";
import { Edit2, Check, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { updateChatTitle } from "@/lib/api/chats";

interface WorkspaceNavbarProps {
  sessionId: string;
  chatTitle?: string;
  chatId?: string;
  onTitleUpdate?: () => void;
  onToggleSidebar?: (collapsed: boolean) => void;
  sidebarCollapsed?: boolean;
}

export default function WorkspaceNavbar({
  sessionId,
  chatTitle = "New Analysis",
  chatId,
  onTitleUpdate,
  onToggleSidebar,
  sidebarCollapsed = false
}: WorkspaceNavbarProps) {
  const pathname = usePathname();

  // Editable Title State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(chatTitle);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Sync edited title when chatTitle prop changes
  useEffect(() => {
    setEditedTitle(chatTitle);
  }, [chatTitle]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleSave = async () => {
    if (!editedTitle.trim()) {
      setEditedTitle(chatTitle);
      setIsEditingTitle(false);
      return;
    }

    if (chatId && editedTitle !== chatTitle) {
      try {
        await updateChatTitle(chatId, editedTitle.trim());
        onTitleUpdate?.();
      } catch (error) {
        console.error("Failed to update chat title:", error);
        setEditedTitle(chatTitle);
      }
    }
    setIsEditingTitle(false);
  };

  const handleToggleSidebar = () => {
    onToggleSidebar?.(!sidebarCollapsed);
  };

  return (
    <nav className="global-navbar workspace-nav-override">
      <div className="navbar-content">
        {/* Sidebar Toggle Button */}
        <button
          className="sidebar-toggle-btn"
          onClick={handleToggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Logo */}
        <div className="logo-name">
          <Link href="/">InsightX</Link>
        </div>

        {/* Session Context */}
        <div className="session-context">
          {isEditingTitle ? (
            <div className="title-edit-mode">
              <input
                ref={titleInputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                  if (e.key === 'Escape') {
                    setEditedTitle(chatTitle);
                    setIsEditingTitle(false);
                  }
                }}
                className="title-input"
              />
              <button onClick={handleTitleSave} className="save-title-btn">
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div className="title-display-mode" onClick={() => setIsEditingTitle(true)}>
              <span className="session-title">{chatTitle}</span>
              <Edit2 size={12} className="edit-icon" />
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <Link href="/connect" className={pathname.startsWith('/connect') ? 'active' : ''}>
            Connect
          </Link>
          <span className="link-divider">/</span>
          <Link href="/workspace" className={pathname.startsWith('/workspace') ? 'active' : ''}>
            Workspace
          </Link>
          <span className="link-divider">/</span>
          <Link href="/reports" className={pathname.startsWith('/reports') ? 'active' : ''}>
            Reports
          </Link>
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          <button className="share-btn-premium">
            <Share2 size={14} />
            <span>Share Room</span>
          </button>
          <div className="user-profile-circle">
            <span>U</span>
          </div>
        </div>
      </div>

      <div className="navbar-divider-bottom" />

      <style jsx>{`
        .global-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          height: 4.5rem;
          background: var(--bg);
          border-bottom: 1px solid var(--stroke);
        }

        .navbar-content {
          height: 100%;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: auto auto 1fr auto auto;
          align-items: center;
          gap: 2rem;
          max-width: 1920px;
          margin: 0 auto;
        }

        /* Sidebar Toggle Button */
        .sidebar-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          background: transparent;
          border: 1px solid var(--stroke);
          border-radius: 0.5rem;
          color: var(--fg);
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .sidebar-toggle-btn:hover {
          background: var(--bg-surface);
          border-color: var(--fg);
          transform: translateY(-1px);
        }

        /* Logo */
        .logo-name {
          display: flex;
          align-items: center;
        }

        .logo-name :global(a) {
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: -0.05rem;
          color: var(--fg);
          text-decoration: none;
          white-space: nowrap;
        }

        /* Session Context */
        .session-context {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
          flex: 1;
        }

        .title-display-mode {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          transition: background 0.2s;
          max-width: 100%;
        }

        .title-display-mode:hover {
          background: var(--bg-surface);
        }

        .session-title {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--fg);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .edit-icon {
          opacity: 0;
          transition: opacity 0.2s;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .title-display-mode:hover .edit-icon {
          opacity: 1;
        }

        .title-edit-mode {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }

        .title-input {
          flex: 1;
          background: var(--bg-surface);
          border: 1px solid var(--fg);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.9375rem;
          font-family: inherit;
          color: var(--fg);
          outline: none;
          min-width: 200px;
        }

        .save-title-btn {
          color: var(--accent-green, #10b981);
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: 0.25rem;
          transition: background 0.2s;
        }

        .save-title-btn:hover {
          background: var(--bg-surface);
        }

        /* Navigation Links */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1rem;
          justify-self: end;
        }

        .nav-links :global(a) {
          color: var(--fg);
          text-decoration: none;
          font-size: 0.9375rem;
          font-weight: 500;
          opacity: 0.5;
          transition: opacity 0.2s ease;
          white-space: nowrap;
        }

        .nav-links :global(a:hover) {
          opacity: 0.8;
        }

        .nav-links :global(a.active) {
          opacity: 1;
        }

        .link-divider {
          color: var(--fg);
          opacity: 0.25;
          font-weight: 300;
          user-select: none;
        }

        /* Actions */
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          justify-self: end;
        }

        .share-btn-premium {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: var(--fg);
          color: var(--bg);
          border: none;
          border-radius: 2rem;
          font-size: 0.8125rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .share-btn-premium:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .user-profile-circle {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: var(--loader-bg);
          border: 1px solid var(--stroke);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: border-color 0.2s;
          flex-shrink: 0;
        }

        .user-profile-circle:hover {
          border-color: var(--fg);
        }

        .navbar-divider-bottom {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 1px;
          background-color: var(--stroke);
          display: none;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .navbar-content {
            gap: 1.5rem;
          }
        }

        @media (max-width: 1000px) {
          .navbar-content {
            grid-template-columns: auto auto 1fr auto;
            gap: 1.5rem;
            padding: 0 1.5rem;
          }

          .session-context {
            grid-column: 1 / -1;
            grid-row: 2;
            padding-top: 0.5rem;
          }

          .nav-links {
            gap: 0.75rem;
          }

          .nav-links :global(a) {
            font-size: 0.875rem;
          }
        }

        @media (max-width: 768px) {
          .global-navbar {
            height: auto;
            min-height: 4.5rem;
          }

          .navbar-content {
            grid-template-columns: auto auto 1fr auto;
            padding: 1rem 1.5rem;
          }

          .nav-links {
            display: none;
          }

          .share-btn-premium span {
            display: none;
          }

          .share-btn-premium {
            padding: 0.625rem;
          }
        }
      `}</style>
    </nav>
  );
}