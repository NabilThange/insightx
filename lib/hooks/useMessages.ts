import { useState, useEffect } from 'react';
import { getMessagesByChat, type Message } from '../api/messages';

export function useMessages(chatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    getMessagesByChat(chatId)
      .then(setMessages)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [chatId]);

  return { messages, loading, error, refetch: () => {
    if (!chatId) return;
    setLoading(true);
    getMessagesByChat(chatId)
      .then(setMessages)
      .catch(setError)
      .finally(() => setLoading(false));
  }};
}
