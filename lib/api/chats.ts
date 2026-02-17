import { supabase } from '@/lib/supabase';

export interface Chat {
  id: string;
  session_id: string;
  title: string | null;
  created_at: string;
}

export interface EnhancedChat extends Chat {
  filename: string;
  first_ai_message: string | null;
}

export async function getChat(chatId: string) {
  const { data, error } = await supabase
    .from('chats').select('*').eq('id', chatId).single();
  if (error) throw error;
  return data as Chat;
}

export async function getChatsFromSupabase(sessionId: string) {
  const { data, error } = await supabase
    .from('chats').select('*').eq('session_id', sessionId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * Fetch ALL chats across ALL sessions — no auth, no user_id filter.
 * Works because sessions.user_id is null (no auth implemented yet).
 */
export async function getAllChats(): Promise<EnhancedChat[]> {
  // 1. Get all sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('id, filename');

  if (sessionsError) throw sessionsError;
  if (!sessions || sessions.length === 0) return [];

  const sessionMap = new Map(sessions.map(s => [s.id, s.filename]));
  const sessionIds = sessions.map(s => s.id);

  // 2. Get all chats
  const { data: chats, error: chatsError } = await supabase
    .from('chats')
    .select('*')
    .in('session_id', sessionIds)
    .order('created_at', { ascending: false });

  if (chatsError) throw chatsError;
  if (!chats || chats.length === 0) return [];

  // 3. Get first AI message per chat
  const chatIds = chats.map(c => c.id);
  const { data: messages } = await supabase
    .from('messages')
    .select('chat_id, content')
    .in('chat_id', chatIds)
    .eq('role', 'assistant')
    .order('created_at', { ascending: true });

  const firstMessageMap = new Map<string, string>();
  if (messages) {
    for (const msg of messages) {
      if (!firstMessageMap.has(msg.chat_id)) {
        firstMessageMap.set(msg.chat_id, msg.content);
      }
    }
  }

  return chats.map(chat => ({
    ...chat,
    filename: sessionMap.get(chat.session_id) || 'Unknown',
    first_ai_message: firstMessageMap.get(chat.id) || null,
  }));
}

/** @deprecated Use getAllChats() instead — no auth needed */
export async function getAllUserChats(userId: string): Promise<EnhancedChat[]> {
  return getAllChats();
}

export async function createChatInSupabase(sessionId: string, title: string) {
  const { data, error } = await supabase
    .from('chats').insert({ session_id: sessionId, title: title || 'Untitled Chat' })
    .select().single();
  if (error) throw error;
  return data;
}

export async function updateChatTitle(chatId: string, newTitle: string) {
  const { data, error } = await supabase
    .from('chats').update({ title: newTitle }).eq('id', chatId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteChatFromSupabase(chatId: string) {
  const { error } = await supabase.from('chats').delete().eq('id', chatId);
  if (error) throw error;
  return true;
}

export function subscribeToChats(sessionId: string, onUpdate: (chats: any[]) => void) {
  const channel = supabase
    .channel(`chats-${sessionId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'chats', filter: `session_id=eq.${sessionId}` },
      async () => { const chats = await getChatsFromSupabase(sessionId); onUpdate(chats); })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}