"use client";

import { useState, useEffect, useRef } from "react";
import {
    Share2,
    X,
    Copy,
    Check,
    Users,
    Link,
    Eye,
    MessageSquare,
    Shield,
    Globe,
    Lock,
    ChevronDown,
} from "lucide-react";

interface Collaborator {
    id: string;
    name: string;
    initials: string;
    role: "owner" | "editor" | "viewer";
    color: string;
    isOnline: boolean;
}

interface ShareRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionId?: string;
    title?: string;
    context?: "workspace" | "reports";
}

const ROLE_OPTIONS = [
    { value: "viewer", label: "View Only", icon: Eye },
    { value: "commenter", label: "Can Comment", icon: MessageSquare },
    { value: "editor", label: "Full Access", icon: Shield },
];

const MOCK_COLLABORATORS: Collaborator[] = [
    {
        id: "1",
        name: "You",
        initials: "U",
        role: "owner",
        color: "#4f46e5",
        isOnline: true,
    },
    {
        id: "2",
        name: "Alex Chen",
        initials: "AC",
        role: "editor",
        color: "#0891b2",
        isOnline: true,
    },
    {
        id: "3",
        name: "Sarah M.",
        initials: "SM",
        role: "viewer",
        color: "#059669",
        isOnline: false,
    },
];

export default function ShareRoomModal({
    isOpen,
    onClose,
    sessionId,
    title = "Untitled",
    context = "workspace",
}: ShareRoomModalProps) {
    const [activeTab, setActiveTab] = useState<"link" | "people">("link");
    const [selectedRole, setSelectedRole] = useState("viewer");
    const [linkCopied, setLinkCopied] = useState(false);
    const [allowPublicLink, setAllowPublicLink] = useState(true);
    const [allowComments, setAllowComments] = useState(true);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [shareUrl, setShareUrl] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const roleDropdownRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && typeof window !== "undefined") {
            const base = window.location.href.split("?")[0];
            const params = new URLSearchParams();
            if (sessionId) params.set("shared", sessionId);
            params.set("role", selectedRole);
            setShareUrl(`${base}?${params.toString()}`);
        }
    }, [isOpen, sessionId, selectedRole]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Close role dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                roleDropdownRef.current &&
                !roleDropdownRef.current.contains(e.target as Node)
            ) {
                setShowRoleDropdown(false);
            }
        };
        if (showRoleDropdown) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [showRoleDropdown]);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2500);
        } catch {
            // Fallback for browsers without clipboard API
            const input = document.createElement("input");
            input.value = shareUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2500);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    };

    const selectedRoleInfo =
        ROLE_OPTIONS.find((r) => r.value === selectedRole) || ROLE_OPTIONS[0];
    const SelectedRoleIcon = selectedRoleInfo.icon;

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="srm-overlay"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-label="Share Room"
        >
            <div className="srm-modal">
                {/* Header */}
                <div className="srm-header">
                    <div className="srm-header-left">
                        <div className="srm-icon-wrap">
                            <Share2 size={16} />
                        </div>
                        <div>
                            <h2 className="srm-title">Share Room</h2>
                            <p className="srm-subtitle">
                                {context === "workspace" ? "Workspace" : "Reports"} ·{" "}
                                <span className="srm-context-name">{title}</span>
                            </p>
                        </div>
                    </div>
                    <button className="srm-close-btn" onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                {/* Active collaborators */}
                <div className="srm-collab-bar">
                    <div className="srm-collab-avatars">
                        {MOCK_COLLABORATORS.map((c) => (
                            <div
                                key={c.id}
                                className="srm-avatar"
                                style={{ background: c.color }}
                                title={c.name}
                            >
                                {c.initials}
                                {c.isOnline && <span className="srm-online-dot" />}
                            </div>
                        ))}
                    </div>
                    <span className="srm-collab-label">
                        <Users size={12} />
                        {MOCK_COLLABORATORS.filter((c) => c.isOnline).length} active now
                    </span>
                </div>

                {/* Tabs */}
                <div className="srm-tabs">
                    <button
                        className={`srm-tab ${activeTab === "link" ? "srm-tab-active" : ""}`}
                        onClick={() => setActiveTab("link")}
                    >
                        <Link size={14} />
                        Share Link
                    </button>
                    <button
                        className={`srm-tab ${activeTab === "people" ? "srm-tab-active" : ""}`}
                        onClick={() => setActiveTab("people")}
                    >
                        <Users size={14} />
                        People
                    </button>
                </div>

                {/* Tab: Share Link */}
                {activeTab === "link" && (
                    <div className="srm-tab-content">
                        {/* Role selector */}
                        <div className="srm-field-label">Link access level</div>
                        <div className="srm-role-selector" ref={roleDropdownRef}>
                            <button
                                className="srm-role-btn"
                                onClick={() => setShowRoleDropdown((v) => !v)}
                            >
                                <SelectedRoleIcon size={14} />
                                <span>{selectedRoleInfo.label}</span>
                                <ChevronDown size={14} className={`srm-chevron ${showRoleDropdown ? "srm-chevron-open" : ""}`} />
                            </button>
                            {showRoleDropdown && (
                                <div className="srm-role-dropdown">
                                    {ROLE_OPTIONS.map((opt) => {
                                        const Icon = opt.icon;
                                        return (
                                            <button
                                                key={opt.value}
                                                className={`srm-role-option ${selectedRole === opt.value ? "srm-role-option-active" : ""}`}
                                                onClick={() => {
                                                    setSelectedRole(opt.value);
                                                    setShowRoleDropdown(false);
                                                }}
                                            >
                                                <Icon size={14} />
                                                {opt.label}
                                                {selectedRole === opt.value && <Check size={12} className="srm-role-check" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* URL copy box */}
                        <div className="srm-url-row">
                            <div className="srm-url-box">
                                <Globe size={13} className="srm-url-icon" />
                                <span className="srm-url-text">{shareUrl}</span>
                            </div>
                            <button
                                className={`srm-copy-btn ${linkCopied ? "srm-copy-btn-success" : ""}`}
                                onClick={handleCopyLink}
                            >
                                {linkCopied ? (
                                    <>
                                        <Check size={14} />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy size={14} />
                                        Copy Link
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Toggles */}
                        <div className="srm-toggles">
                            <div className="srm-toggle-row">
                                <div className="srm-toggle-info">
                                    <Globe size={13} />
                                    <div>
                                        <div className="srm-toggle-label">Allow public link access</div>
                                        <div className="srm-toggle-desc">Anyone with the link can view</div>
                                    </div>
                                </div>
                                <button
                                    className={`srm-toggle ${allowPublicLink ? "srm-toggle-on" : ""}`}
                                    onClick={() => setAllowPublicLink((v) => !v)}
                                    aria-label="Toggle public link"
                                >
                                    <span className="srm-toggle-thumb" />
                                </button>
                            </div>

                            <div className="srm-toggle-row">
                                <div className="srm-toggle-info">
                                    <MessageSquare size={13} />
                                    <div>
                                        <div className="srm-toggle-label">Allow comments</div>
                                        <div className="srm-toggle-desc">Viewers can leave comments</div>
                                    </div>
                                </div>
                                <button
                                    className={`srm-toggle ${allowComments ? "srm-toggle-on" : ""}`}
                                    onClick={() => setAllowComments((v) => !v)}
                                    aria-label="Toggle comments"
                                >
                                    <span className="srm-toggle-thumb" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: People */}
                {activeTab === "people" && (
                    <div className="srm-tab-content">
                        <div className="srm-field-label">Invite by email</div>
                        <div className="srm-invite-row">
                            <input
                                type="email"
                                placeholder="colleague@company.com"
                                className="srm-invite-input"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && inviteEmail.trim()) setInviteEmail("");
                                }}
                            />
                            <button
                                className="srm-invite-btn"
                                onClick={() => setInviteEmail("")}
                            >
                                Invite
                            </button>
                        </div>

                        <div className="srm-field-label" style={{ marginTop: "1.25rem" }}>
                            Current members
                        </div>
                        <div className="srm-members-list">
                            {MOCK_COLLABORATORS.map((c) => (
                                <div key={c.id} className="srm-member-row">
                                    <div className="srm-member-avatar" style={{ background: c.color }}>
                                        {c.initials}
                                        {c.isOnline && <span className="srm-online-dot" />}
                                    </div>
                                    <div className="srm-member-info">
                                        <span className="srm-member-name">{c.name}</span>
                                        <span className={`srm-member-status ${c.isOnline ? "srm-status-online" : ""}`}>
                                            {c.isOnline ? "Online" : "Offline"}
                                        </span>
                                    </div>
                                    <span className="srm-member-role">{c.role}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="srm-footer">
                    <div className="srm-footer-info">
                        <Lock size={12} />
                        <span>Secure, encrypted sharing</span>
                    </div>
                    <button className="srm-done-btn" onClick={onClose}>
                        Done
                    </button>
                </div>
            </div>

            <style jsx>{`
        .srm-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: srm-overlay-in 0.18s ease;
        }

        @keyframes srm-overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .srm-modal {
          background: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 1rem;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.18);
          animation: srm-modal-in 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }

        @keyframes srm-modal-in {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Header */
        .srm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem 1rem;
          border-bottom: 1px solid var(--stroke);
        }

        .srm-header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .srm-icon-wrap {
          width: 2rem;
          height: 2rem;
          background: var(--fg);
          color: var(--bg);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .srm-title {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--fg);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .srm-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0.1rem 0 0;
        }

        .srm-context-name {
          font-weight: 500;
          color: var(--fg);
          opacity: 0.75;
        }

        .srm-close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          background: transparent;
          border: 1px solid var(--stroke);
          border-radius: 0.5rem;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }

        .srm-close-btn:hover {
          border-color: var(--fg);
          color: var(--fg);
          background: var(--bg-elevated);
        }

        /* Collaborator bar */
        .srm-collab-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.5rem;
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--stroke);
        }

        .srm-collab-avatars {
          display: flex;
          align-items: center;
        }

        .srm-avatar {
          position: relative;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          color: #fff;
          font-size: 0.6875rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-elevated);
          margin-left: -0.4rem;
          flex-shrink: 0;
        }

        .srm-avatar:first-child { margin-left: 0; }

        .srm-online-dot {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 0.5rem;
          height: 0.5rem;
          background: #22c55e;
          border-radius: 50%;
          border: 1px solid var(--bg-elevated);
        }

        .srm-collab-label {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Tabs */
        .srm-tabs {
          display: flex;
          padding: 0.75rem 1.5rem 0;
          gap: 0.25rem;
          border-bottom: 1px solid var(--stroke);
        }

        .srm-tab {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-muted);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
          margin-bottom: -1px;
        }

        .srm-tab:hover {
          color: var(--fg);
        }

        .srm-tab-active {
          color: var(--fg);
          border-bottom-color: var(--fg);
        }

        /* Tab content */
        .srm-tab-content {
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .srm-field-label {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          margin-bottom: 0.1rem;
        }

        /* Role selector */
        .srm-role-selector {
          position: relative;
        }

        .srm-role-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 0.875rem;
          background: var(--bg-elevated);
          border: 1px solid var(--stroke);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--fg);
          cursor: pointer;
          transition: all 0.15s;
          width: 100%;
          text-align: left;
        }

        .srm-role-btn:hover {
          border-color: var(--fg);
        }

        .srm-role-btn span {
          flex: 1;
        }

        .srm-chevron {
          transition: transform 0.2s;
        }

        .srm-chevron-open {
          transform: rotate(180deg);
        }

        .srm-role-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: var(--bg);
          border: 1px solid var(--stroke);
          border-radius: 0.625rem;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          z-index: 100;
          overflow: hidden;
          animation: srm-dropdown-in 0.15s ease;
        }

        @keyframes srm-dropdown-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .srm-role-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 0.875rem;
          font-size: 0.875rem;
          color: var(--fg);
          background: transparent;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: background 0.1s;
        }

        .srm-role-option:hover {
          background: var(--bg-elevated);
        }

        .srm-role-option-active {
          background: var(--bg-elevated);
          font-weight: 500;
        }

        .srm-role-check {
          margin-left: auto;
          color: var(--accent-green);
        }

        /* URL row */
        .srm-url-row {
          display: flex;
          gap: 0.5rem;
          align-items: stretch;
          margin-top: 0.25rem;
        }

        .srm-url-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 0.875rem;
          background: var(--bg-elevated);
          border: 1px solid var(--stroke);
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .srm-url-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .srm-url-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: 'JetBrains Mono', monospace;
        }

        .srm-copy-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.625rem 1rem;
          background: var(--fg);
          color: var(--bg);
          border: none;
          border-radius: 0.5rem;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .srm-copy-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .srm-copy-btn-success {
          background: var(--accent-green);
        }

        /* Toggles */
        .srm-toggles {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          margin-top: 0.25rem;
          border: 1px solid var(--stroke);
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .srm-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1rem;
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--stroke);
          gap: 1rem;
        }

        .srm-toggle-row:last-child {
          border-bottom: none;
        }

        .srm-toggle-info {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          flex: 1;
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .srm-toggle-info svg {
          margin-top: 2px;
          flex-shrink: 0;
        }

        .srm-toggle-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--fg);
        }

        .srm-toggle-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.1rem;
        }

        .srm-toggle {
          position: relative;
          width: 2.5rem;
          height: 1.375rem;
          background: var(--stroke);
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          transition: background 0.2s;
          flex-shrink: 0;
          padding: 0;
        }

        .srm-toggle-on {
          background: var(--fg);
        }

        .srm-toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: calc(1.375rem - 4px);
          height: calc(1.375rem - 4px);
          background: #fff;
          border-radius: 50%;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: block;
        }

        .srm-toggle-on .srm-toggle-thumb {
          transform: translateX(1.125rem);
        }

        /* People tab */
        .srm-invite-row {
          display: flex;
          gap: 0.5rem;
        }

        .srm-invite-input {
          flex: 1;
          padding: 0.625rem 0.875rem;
          background: var(--bg-elevated);
          border: 1px solid var(--stroke);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: var(--fg);
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s;
        }

        .srm-invite-input::placeholder {
          color: var(--text-muted);
        }

        .srm-invite-input:focus {
          border-color: var(--fg);
        }

        .srm-invite-btn {
          padding: 0.625rem 1rem;
          background: var(--fg);
          color: var(--bg);
          border: none;
          border-radius: 0.5rem;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .srm-invite-btn:hover {
          transform: translateY(-1px);
        }

        .srm-members-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          border: 1px solid var(--stroke);
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .srm-member-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--stroke);
        }

        .srm-member-row:last-child {
          border-bottom: none;
        }

        .srm-member-avatar {
          position: relative;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          color: #fff;
          font-size: 0.6875rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .srm-member-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .srm-member-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--fg);
        }

        .srm-member-status {
          font-size: 0.6875rem;
          color: var(--text-muted);
        }

        .srm-status-online {
          color: #22c55e;
        }

        .srm-member-role {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          background: var(--bg);
          border: 1px solid var(--stroke);
          padding: 0.2rem 0.5rem;
          border-radius: 0.25rem;
        }

        /* Footer */
        .srm-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--stroke);
          background: var(--bg-elevated);
        }

        .srm-footer-info {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .srm-done-btn {
          padding: 0.5rem 1.25rem;
          background: var(--fg);
          color: var(--bg);
          border: none;
          border-radius: 2rem;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }

        .srm-done-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
      `}</style>
        </div>
    );
}
