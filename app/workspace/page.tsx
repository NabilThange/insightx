"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, getChats } from "@/lib/api/backend";

export default function WorkspacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        // Get session_id from localStorage
        const sessionId = localStorage.getItem("current_session_id");

        if (!sessionId) {
          // No session, redirect to connect
          router.push("/connect");
          return;
        }

        // Load session from backend
        const session = await getSession(sessionId);

        if (session.status !== "ready") {
          // Session not ready yet, redirect to connect
          router.push("/connect");
          return;
        }

        // Check if there are existing chats
        const chats = await getChats(sessionId);

        if (chats.length > 0) {
          // Redirect to most recent chat
          router.push(`/workspace/${chats[0].id}`);
        } else {
          // No chats yet, stay on empty workspace
          // The workspace/[id] page will create a chat on first message
          router.push(`/workspace/${sessionId}`);
        }
      } catch (error) {
        console.error("Failed to load workspace:", error);
        router.push("/connect");
      } finally {
        setLoading(false);
      }
    }

    loadWorkspace();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="text-center">
          <h2 className="text-xl font-medium animate-pulse">
            Initializing Workspace...
          </h2>
        </div>
      </div>
    );
  }

  return null;
}
