"use client";

import { useState, useEffect, useRef, use, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ChatPanel from "@/components/workspace/ChatPanel";
import WorkspaceRightSidebar from "@/components/workspace/WorkspaceRightSidebar";
import WorkspaceLayout from "@/components/workspace/WorkspaceLayout";
import { SidebarProvider } from "@/components/ui/sidebar";

import {
  getSession,
  getMessages,
  createMessage,
  chatStream,
  formatSessionToDataDNA,
} from "@/lib/api/backend";
import {
  getChatsFromSupabase,
  createChatInSupabase,
  subscribeToChats,
} from "@/lib/api/chats";
import { logger } from "@/lib/utils/logger";
import { showToast } from "@/lib/utils/toast";
import type { Message } from "@/store/chatStore";

export default function ActiveWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id: workspaceId } = use(params);
  const chatIdFromUrl = searchParams.get("chat");

  const [input, setInput] = useState("");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sqlHistory, setSqlHistory] = useState<string[]>([]);
  const [currentSqlCode, setCurrentSqlCode] = useState<string>("");
  const [currentPythonCode, setCurrentPythonCode] = useState<string>("");
  const scrollRef = useRef<any>(null);

  // Load session and chats
  const loadChats = async (sessionId: string) => {
    try {
      const sessionChats = await getChatsFromSupabase(sessionId);
      logger.db("Loaded session chats", { count: sessionChats.length });
      setChats(sessionChats);
      return sessionChats;
    } catch (error) {
      console.error("Failed to load chats:", error);
      return [];
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        // workspaceId could be either session_id or chat_id
        // First try to load as session
        let session;
        let sessionId = workspaceId;

        try {
          session = await getSession(workspaceId);
        } catch {
          // If that fails, workspaceId might be a chat_id
          // We need to get the session_id from somewhere
          // For now, try localStorage
          const storedSessionId = localStorage.getItem("current_session_id");
          if (storedSessionId) {
            session = await getSession(storedSessionId);
            sessionId = storedSessionId;
          } else {
            throw new Error("Session not found");
          }
        }

        setSessionData(session);

        // Load chats for this session from Supabase
        const sessionChats = await loadChats(sessionId);

        // Determine active chat
        if (chatIdFromUrl && sessionChats.some((c) => c.id === chatIdFromUrl)) {
          setActiveChatId(chatIdFromUrl);
        } else if (sessionChats.length > 0) {
          setActiveChatId(sessionChats[0].id);
        }
      } catch (error) {
        console.error("Failed to load workspace:", error);
        router.push("/connect");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [workspaceId, chatIdFromUrl, router]);

  // Subscribe to real-time chat updates
  useEffect(() => {
    if (!sessionData?.id) return;

    const unsubscribe = subscribeToChats(sessionData.id, (updatedChats) => {
      logger.db("Real-time chat update received", { count: updatedChats.length });
      setChats(updatedChats);
    });

    return () => {
      unsubscribe();
    };
  }, [sessionData?.id]);

  // Load messages when active chat changes
  useEffect(() => {
    async function loadMessages() {
      if (!activeChatId) {
        setMessages([]);
        return;
      }

      try {
        const chatMessages = await getMessages(activeChatId);
        const formattedMessages: Message[] = chatMessages.map((msg) => {
          // Parse content if it's a string (JSON)
          let parsedContent = msg.content;
          if (typeof msg.content === "string") {
            try {
              parsedContent = JSON.parse(msg.content);
            } catch (e) {
              // If parsing fails, keep as string
              parsedContent = msg.content;
            }
          }

          return {
            id: msg.id,
            sessionId: sessionData?.id || workspaceId,
            type: msg.role === "user" ? "user" : "orchestrator",
            content: typeof parsedContent === "object" && parsedContent?.text ? parsedContent.text : parsedContent,
            timestamp: new Date(msg.created_at),
          };
        });
        setMessages(formattedMessages);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    }

    loadMessages();
  }, [activeChatId, sessionData, workspaceId]);

  const handleSend = async () => {
    if (!input.trim() || !sessionData) return;

    try {
      let chatId = activeChatId;

      // Create first chat if none exists
      if (!chatId) {
        const newChat = await createChatInSupabase(
          sessionData.id,
          input.slice(0, 50)
        );
        chatId = newChat.id;
        setActiveChatId(chatId);

        // Reload chats from Supabase
        await loadChats(sessionData.id);

        // Update URL
        router.push(`/workspace/${sessionData.id}?chat=${chatId}`);
      }

      // Save user message
      if (chatId) {
        await createMessage(chatId, "user", input);
      }
      const userInput = input;
      setInput("");

      // Reload messages to show user message
      if (chatId) {
        const updatedMessages = await getMessages(chatId);
        setMessages(
          updatedMessages.map((msg) => {
            // Parse content if it's a string (JSON)
            let parsedContent = msg.content;
            if (typeof msg.content === "string") {
              try {
                parsedContent = JSON.parse(msg.content);
              } catch (e) {
                // If parsing fails, keep as string
                parsedContent = msg.content;
              }
            }

            return {
              id: msg.id,
              sessionId: sessionData.id,
              type: msg.role === "user" ? "user" : "orchestrator",
              content: typeof parsedContent === "object" && parsedContent?.text ? parsedContent.text : parsedContent,
              timestamp: new Date(msg.created_at),
            };
          })
        );
      }

      // Stream AI response via SSE
      setIsStreaming(true);
      let assistantContent = "";

      try {
        if (chatId) {
          for await (const event of chatStream(
            chatId,
            sessionData.id,
            userInput,
            messages.map((m) => ({ role: m.type, content: m.content }))
          )) {
            console.log("[handleSend] Received event:", event.type, event);

            if (event.type === "status") {
              logger.orchestrator(`Thinking: ${event.message}`);
            } else if (event.type === "toast") {
              // Handle agent selection toast
              showToast.agent(event.message, event.data?.reasoning);
            } else if (event.type === "orchestrator_result") {
              logger.orchestrator("Intent Classified", event.data.classification);
            } else if (event.type === "code_written") {
              // Handle code written to sidebar
              const { code, language } = event.data;
              if (language === 'sql') {
                setCurrentSqlCode(code);
              } else if (language === 'python') {
                setCurrentPythonCode(code);
              }
              logger.tool(`${language.toUpperCase()} Code Written`, { length: code.length });
              showToast.agent(`📝 ${language.toUpperCase()} code written to sidebar`, `${code.length} characters`);
            } else if (event.type === "sql_result") {
              logger.tool("SQL Analysis Executed", { query: event.data.query });
              showToast.agent("✅ SQL Query executed successfully", `${event.data.results?.rows?.length || 0} rows returned`);
              
              // Add SQL query to history
              if (event.data.query) {
                setSqlHistory(prev => {
                  const newHistory = [event.data.query, ...prev];
                  // Keep only last 10 queries
                  return newHistory.slice(0, 10);
                });
              }
            } else if (event.type === "python_result") {
              logger.tool("Python Script Executed", { results: event.data.results });
              showToast.agent("✅ Python analysis completed", "Results ready for synthesis");
            } else if (event.type === "final_response") {
              // Store the full response data for proper rendering
              assistantContent = event.data;
              logger.orchestrator("Final response received");
            } else if (event.type === "error") {
              logger.error("Orchestrator", event.message);
              assistantContent = `Error: ${event.message}`;
              showToast.error("❌ Error during analysis", event.message);
            }
          }
        }
      } catch (streamError) {
        console.error("[handleSend] Stream error:", streamError);
        assistantContent = `Failed to get response: ${streamError}`;
      }

      setIsStreaming(false);

      // Reload messages to show AI response
      if (chatId) {
        const finalMessages = await getMessages(chatId);
        setMessages(
          finalMessages.map((msg) => {
            // Parse content if it's a string (JSON)
            let parsedContent = msg.content;
            if (typeof msg.content === "string") {
              try {
                parsedContent = JSON.parse(msg.content);
              } catch (e) {
                // If parsing fails, keep as string
                parsedContent = msg.content;
              }
            }

            return {
              id: msg.id,
              sessionId: sessionData.id,
              type: msg.role === "user" ? "user" : "orchestrator",
              // Keep the full parsed object if it has a text field (Composer response)
              // Otherwise extract just the text or use the string
              content: parsedContent,
              timestamp: new Date(msg.created_at),
            };
          })
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFollowUpClick = (question: string) => {
    setInput(question);
    // Auto-submit the follow-up question
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleChatsUpdate = async () => {
    if (sessionData?.id) {
      await loadChats(sessionData.id);
    }
  };

  // Memoize formatted Data DNA - MUST be before any early returns
  const formattedDNA = useMemo(() => {
    if (!sessionData) return null;
    return formatSessionToDataDNA(sessionData);
  }, [sessionData]);

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--bg)",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ fontSize: "1.5rem", color: "var(--fg)" }}>
          Loading workspace...
        </div>
        <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Workspace ID: {workspaceId}
        </div>
      </div>
    );
  }

  // Error state - session not found
  if (!sessionData) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--bg)",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ fontSize: "1.5rem", color: "var(--fg)" }}>
          Session not found
        </div>
        <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          The session you're looking for doesn't exist or has been deleted.
        </div>
        <button
          onClick={() => router.push("/connect")}
          style={{
            padding: "0.75rem 1.5rem",
            background: "var(--fg)",
            color: "var(--bg)",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "1rem",
            marginTop: "1rem",
          }}
        >
          Create New Session
        </button>
      </div>
    );
  }

  const activeChat = chats.find((c) => c.id === activeChatId);

  return (
    <SidebarProvider>
      <WorkspaceLayout
        sessionId={activeChatId || sessionData.id}
        chatTitle={activeChat?.title || "New Analysis"}
        chatId={activeChatId || undefined}
        onChatsUpdate={handleChatsUpdate}
        onTitleUpdate={handleChatsUpdate}
        sqlHistory={sqlHistory}
      >
        {/* MAIN PANEL - CHAT INTERFACE */}
        <ChatPanel
          messages={messages}
          dataDNA={formattedDNA}
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          handleKeyDown={handleKeyDown}
          isStreaming={isStreaming}
          scrollRef={scrollRef}
          onFollowUpClick={handleFollowUpClick}
        />

        {/* RIGHT SIDEBAR - DATA PROFILING */}
        {formattedDNA && (
          <WorkspaceRightSidebar 
            dataDNA={formattedDNA} 
            sqlCode={currentSqlCode}
            pythonCode={currentPythonCode}
            sessionId={sessionData?.id || workspaceId}
          />
        )}
      </WorkspaceLayout>
    </SidebarProvider>
  );
}