import { supabase } from '@/lib/supabase';

export interface Chat {
  id: string;
  session_id: string;
  title: string | null;
  created_at: string;
  updated_at?: string;
  metadata?: any;
}

/**
 * Fetch a single chat by ID
 */
export async function getChat(chatId: string) {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .single();

  if (error) {
    console.error('Error fetching chat:', error);
    throw error;
  }

  return data as Chat;
}

/**
 * Fetch all chats for a given session from Supabase
 */
export async function getChatsFromSupabase(sessionId: string) {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }

  return data || [];
}

/**
 * Create a new chat in Supabase
 */
export async function createChatInSupabase(sessionId: string, title: string) {
  const { data, error } = await supabase
    .from('chats')
    .insert({
      session_id: sessionId,
      title: title || 'Untitled Chat',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating chat:', error);
    throw error;
  }

  return data;
}

/**
 * Update a chat title in Supabase
 */
export async function updateChatTitle(chatId: string, newTitle: string) {
  const { data, error } = await supabase
    .from('chats')
    .update({ title: newTitle })
    .eq('id', chatId)
    .select()
    .single();

  if (error) {
    console.error('Error updating chat title:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a chat from Supabase
 */
export async function deleteChatFromSupabase(chatId: string) {
  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId);

  if (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }

  return true;
}

/**
 * Subscribe to real-time chat updates for a session
 */
export function subscribeToChats(
  sessionId: string,
  onUpdate: (chats: any[]) => void
) {
  const channel = supabase
    .channel(`chats-${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `session_id=eq.${sessionId}`,
      },
      async () => {
        // Refetch all chats when any change occurs
        const chats = await getChatsFromSupabase(sessionId);
        onUpdate(chats);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}