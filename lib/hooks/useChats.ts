import { useState, useEffect } from 'react';
import { getChatsFromSupabase, getChat, type Chat } from '../api/chats';

export function useChat(chatId: string | null) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!chatId) {
      setChat(null);
      return;
    }

    setLoading(true);
    getChat(chatId)
      .then(setChat)
      .catch((err: any) => setError(err))
      .finally(() => setLoading(false));
  }, [chatId]);

  return { chat, loading, error };
}

export function useChatsBySession(sessionId: string | null) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setChats([]);
      return;
    }

    setLoading(true);
    getChatsFromSupabase(sessionId)
      .then(setChats)
      .catch((err: any) => setError(err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return {
    chats, loading, error, refetch: () => {
      if (!sessionId) return;
      setLoading(true);
      getChatsFromSupabase(sessionId)
        .then(setChats)
        .catch((err: any) => setError(err))
        .finally(() => setLoading(false));
    }
  };
}
