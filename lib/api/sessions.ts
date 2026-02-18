import { supabase } from '../supabase';
import { WorkspaceSidebarService } from '../db/sidebar';
import type { DataDNA } from '@/store/dataStore';

export interface Session {
  id: string;
  user_id: string | null;
  filename: string;
  row_count: number | null;
  status: 'uploading' | 'exploring' | 'ready';
  data_dna: DataDNA | null;
  created_at: string;
}

// Create a new session (for file upload)
export async function createSession(filename: string, userId: string | null = null) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      filename,
      status: 'uploading',
    })
    .select()
    .single();

  if (error) throw error;
  
  // Initialize workspace_sidebar for this session
  try {
    await WorkspaceSidebarService.initializeSidebar(data.id);
    console.log('✅ [Sessions] Workspace sidebar initialized for session:', data.id);
  } catch (sidebarError) {
    console.error('⚠️ [Sessions] Failed to initialize workspace sidebar:', sidebarError);
    // Don't fail the session creation if sidebar init fails
  }
  
  return data as Session;
}

// Get session by ID
export async function getSession(sessionId: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data as Session;
}

// Update session status
export async function updateSessionStatus(
  sessionId: string,
  status: 'uploading' | 'exploring' | 'ready'
) {
  const { data, error } = await supabase
    .from('sessions')
    .update({ status })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data as Session;
}

// Update session with Data DNA
export async function updateSessionDataDNA(
  sessionId: string,
  dataDNA: DataDNA,
  rowCount: number
) {
  const { data, error } = await supabase
    .from('sessions')
    .update({
      data_dna: dataDNA,
      row_count: rowCount,
      status: 'ready',
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  
  // Also update workspace_sidebar with the Data DNA
  try {
    await WorkspaceSidebarService.updateDataDNA(sessionId, dataDNA);
    console.log('✅ [Sessions] Data DNA saved to workspace sidebar');
  } catch (sidebarError) {
    console.error('⚠️ [Sessions] Failed to save Data DNA to workspace sidebar:', sidebarError);
    // Don't fail the update if sidebar update fails
  }
  
  return data as Session;
}

// Get all sessions (for user)
export async function getAllSessions(userId: string | null = null) {
  let query = supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false });
  
  // If userId is provided, filter by it
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Session[];
}

// Delete session
export async function deleteSession(sessionId: string) {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId);

  if (error) throw error;
}
