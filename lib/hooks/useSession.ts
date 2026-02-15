import { useState, useEffect } from 'react';
import { getSession, getAllSessions, type Session } from '../api/sessions';

export function useSession(sessionId: string | null) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setSession(null);
      return;
    }

    setLoading(true);
    getSession(sessionId)
      .then(setSession)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [sessionId]);

  return { session, loading, error };
}

export function useSessions(userId: string | null = null) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getAllSessions(userId)
      .then(setSessions)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { sessions, loading, error, refetch: () => {
    setLoading(true);
    getAllSessions(userId)
      .then(setSessions)
      .catch(setError)
      .finally(() => setLoading(false));
  }};
}
