import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          user_id: string | null;
          filename: string;
          row_count: number | null;
          status: 'uploading' | 'exploring' | 'ready';
          data_dna: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          filename: string;
          row_count?: number | null;
          status?: 'uploading' | 'exploring' | 'ready';
          data_dna?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          filename?: string;
          row_count?: number | null;
          status?: 'uploading' | 'exploring' | 'ready';
          data_dna?: any | null;
          created_at?: string;
        };
      };
      chats: {
        Row: {
          id: string;
          session_id: string;
          title: string | null;
          created_at: string;
          user_id?: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          title?: string | null;
          created_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          title?: string | null;
          created_at?: string;
          user_id?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          role?: 'user' | 'assistant';
          content?: string;
          created_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          chat_id: string;
          active_agent?: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          active_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          active_agent?: string | null;
          created_at?: string;
        };
      };
      artifacts: {
        Row: {
          id: string;
          chat_id: string;
          type: string;
          title: string;
          current_version: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          type: string;
          title: string;
          current_version?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          type?: string;
          title?: string;
          current_version?: number;
          created_at?: string;
        };
      };
      artifact_versions: {
        Row: {
          id: string;
          artifact_id: string;
          version_number: number;
          content: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          artifact_id: string;
          version_number: number;
          content: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          artifact_id?: string;
          version_number?: number;
          content?: any;
          created_at?: string;
        };
      };
      component_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string | null;
          pins: any | null;
          voltage_range: string | null;
          interface_types: string[] | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?: string | null;
          pins?: any | null;
          voltage_range?: string | null;
          interface_types?: string[] | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          pins?: any | null;
          voltage_range?: string | null;
          interface_types?: string[] | null;
        };
      };
      parts: {
        Row: {
          id: string;
          project_id: string;
          template_id: string;
          quantity: number;
        };
        Insert: {
          id?: string;
          project_id: string;
          template_id: string;
          quantity: number;
        };
        Update: {
          id?: string;
          project_id?: string;
          template_id?: string;
          quantity?: number;
        };
      };
    };
  };
}
