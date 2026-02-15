"use client";

import { useSidebar } from "@/components/ui/sidebar";
import WorkspaceNavbar from "@/components/workspace/WorkspaceNavbar";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";

interface Chat {
  id: string;
  session_id: string;
  title: string | null;
  created_at: string;
}

interface WorkspaceLayoutProps {
  sessionId: string;
  chatTitle?: string;
  chatId?: string;
  chats: Chat[];
  onChatsUpdate: () => void;
  onTitleUpdate?: () => void;
  children: React.ReactNode;
}


export default function WorkspaceLayout({
  sessionId,
  chatTitle,
  chatId,
  chats,
  onChatsUpdate,
  onTitleUpdate,
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
        <WorkspaceSidebar
          sessionId={sessionId}
          chats={chats}
          onChatsUpdate={onChatsUpdate}
        />

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

        .sidebar-wrapper {
          height: 100%;
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