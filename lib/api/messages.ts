import { supabase } from '../supabase';

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Create a new message
export async function createMessage(
  chatId: string,
  role: 'user' | 'assistant',
  content: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      role,
      content,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

// Get all messages for a chat
export async function getMessagesByChat(chatId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Message[];
}

// Delete message
export async function deleteMessage(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) throw error;
}

// Delete all messages for a chat
export async function deleteMessagesByChat(chatId: string) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('chat_id', chatId);

  if (error) throw error;
}
