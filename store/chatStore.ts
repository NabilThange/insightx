import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MessageType = 'user' | 'orchestrator' | 'sql' | 'python' | 'system';

export interface Message {
    id: string;
    sessionId: string;
    type: MessageType;
    content: string;
    thinking?: string[];
    code?: {
        sql?: string;
        python?: string;
    };
    insight?: {
        title: string;
        metric: string;
        trend?: 'up' | 'down' | 'neutral';
        trendValue?: string;
    };
    timestamp: Date;
}

export interface ChatSession {
    id: string;
    title: string;
    datasetId: string;
    createdAt: Date;
    updatedAt: Date;
    messageCount: number;
}

interface ChatState {
    // Sessions
    sessions: ChatSession[];
    activeSessionId: string | null;

    // Messages
    messages: Message[];

    // Streaming state
    isStreaming: boolean;
    streamingMessageId: string | null;

    // Actions
    createSession: (datasetId: string) => string;
    setActiveSession: (sessionId: string) => void;
    addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
    updateMessage: (id: string, updates: Partial<Message>) => void;
    updateSession: (id: string, updates: Partial<ChatSession>) => void;
    getSessionMessages: (sessionId: string) => Message[];
    setStreaming: (isStreaming: boolean, messageId?: string) => void;
    clearSession: (sessionId: string) => void;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            sessions: [],
            activeSessionId: null,
            messages: [],
            isStreaming: false,
            streamingMessageId: null,

            createSession: (datasetId: string) => {
                const sessionId = `session_${Date.now()}`;
                const newSession: ChatSession = {
                    id: sessionId,
                    title: 'New Analysis',
                    datasetId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    messageCount: 0,
                };

                set((state) => ({
                    sessions: [newSession, ...state.sessions],
                    activeSessionId: sessionId,
                }));

                return sessionId;
            },

            setActiveSession: (sessionId: string) => {
                set({ activeSessionId: sessionId });
            },

            addMessage: (message) => {
                const newMessage: Message = {
                    ...message,
                    id: `msg_${Date.now()}`,
                    timestamp: new Date(),
                };

                set((state) => {
                    // Update session message count and title
                    const sessions = state.sessions.map((session) => {
                        if (session.id === message.sessionId) {
                            return {
                                ...session,
                                messageCount: session.messageCount + 1,
                                updatedAt: new Date(),
                                // Update title from first user message
                                title:
                                    session.messageCount === 0 && message.type === 'user'
                                        ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                                        : session.title,
                            };
                        }
                        return session;
                    });

                    return {
                        messages: [...state.messages, newMessage],
                        sessions,
                    };
                });
            },

            updateMessage: (id, updates) => {
                set((state) => ({
                    messages: state.messages.map((msg) =>
                        msg.id === id ? { ...msg, ...updates } : msg
                    ),
                }));
            },

            updateSession: (id, updates) => {
                set((state) => ({
                    sessions: state.sessions.map((s) =>
                        s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
                    ),
                }));
            },

            getSessionMessages: (sessionId: string) => {
                return get().messages.filter((msg) => msg.sessionId === sessionId);
            },

            setStreaming: (isStreaming, messageId) => {
                set({ isStreaming, streamingMessageId: messageId || null });
            },

            clearSession: (sessionId: string) => {
                set((state) => ({
                    messages: state.messages.filter((msg) => msg.sessionId !== sessionId),
                    sessions: state.sessions.filter((session) => session.id !== sessionId),
                    activeSessionId:
                        state.activeSessionId === sessionId ? null : state.activeSessionId,
                }));
            },
        }),
        {
            name: 'insightx-chat-storage',
            partialize: (state) => ({
                sessions: state.sessions,
                messages: state.messages,
                activeSessionId: state.activeSessionId,
            }),
        }
    )
);
