"use client";

import { useSidebar } from "@/components/ui/sidebar";
import WorkspaceNavbar from "@/components/workspace/WorkspaceNavbar";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";

interface WorkspaceLayoutProps {
  sessionId: string;
  chatTitle?: string;
  chatId?: string;
  onChatsUpdate: () => void;
  onTitleUpdate?: () => void;
  sqlHistory?: string[];
  children: React.ReactNode;
}

export default function WorkspaceLayout({
  sessionId,
  chatTitle,
  chatId,
  onChatsUpdate,
  onTitleUpdate,
  sqlHistory = [],
  children,
}: WorkspaceLayoutProps) {
  const { open, setOpen } = useSidebar();

  const handleToggleSidebar = (collapsed: boolean) => {
    setOpen(!collapsed);
  };

  return (
    <div className="workspace-container">
      <WorkspaceNavbar
        sessionId={sessionId}
        chatTitle={chatTitle}
        chatId={chatId}
        onTitleUpdate={onTitleUpdate}
        onToggleSidebar={handleToggleSidebar}
        sidebarCollapsed={!open}
      />

      <div className="workspace-body">
        {/* Sidebar only visible when open */}
        {open && (
          <WorkspaceSidebar
            sessionId={sessionId}
            onChatsUpdate={onChatsUpdate}
            sqlHistory={sqlHistory}
          />
        )}

        <div className="main-content">{children}</div>
      </div>

      <style jsx>{`
        .workspace-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          background: var(--bg);
        }

        .workspace-body {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .main-content {
          flex: 1;
          height: 100%;
          overflow: hidden;
          background: var(--bg);
          display: flex;
        }
      `}</style>
    </div>
  );
}