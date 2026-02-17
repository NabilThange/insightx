/**
 * Context Insights Database Service
 * Handles storage and retrieval of dataset context analysis
 */

import { supabase } from "@/lib/supabase";

export interface ContextInsight {
  id: string;
  session_id: string;
  dataset_name: string;
  purpose: string;
  domain: string;
  key_entities: string[];
  use_cases: string[];
  audience: string;
  business_value: string;
  data_health: string;
  key_insights: string[];
  recommended_analyses: string[];
  context_summary: string;
  created_at: string;
  updated_at: string;
}

export class ContextService {
  /**
   * Save context insight for a dataset
   */
  static async saveContextInsight(
    sessionId: string,
    contextData: Omit<ContextInsight, "id" | "session_id" | "created_at" | "updated_at">
  ): Promise<ContextInsight> {
    const { data, error } = await supabase
      .from("context_insights")
      .insert({
        session_id: sessionId,
        ...contextData,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ [ContextService] Error saving context insight:", error);
      throw error;
    }

    return data;
  }

  /**
   * Get context insight for a session
   */
  static async getContextInsight(sessionId: string): Promise<ContextInsight | null> {
    const { data, error } = await supabase
      .from("context_insights")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("❌ [ContextService] Error retrieving context insight:", error);
      throw error;
    }

    return data || null;
  }

  /**
   * Update context insight for a session
   */
  static async updateContextInsight(
    sessionId: string,
    contextData: Partial<Omit<ContextInsight, "id" | "session_id" | "created_at" | "updated_at">>
  ): Promise<ContextInsight> {
    const { data, error } = await supabase
      .from("context_insights")
      .update(contextData)
      .eq("session_id", sessionId)
      .select()
      .single();

    if (error) {
      console.error("❌ [ContextService] Error updating context insight:", error);
      throw error;
    }

    return data;
  }

  /**
   * Delete context insight for a session
   */
  static async deleteContextInsight(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from("context_insights")
      .delete()
      .eq("session_id", sessionId);

    if (error) {
      console.error("❌ [ContextService] Error deleting context insight:", error);
      throw error;
    }
  }

  /**
   * Get all context insights for a user (via their sessions)
   */
  static async getAllContextInsights(): Promise<ContextInsight[]> {
    const { data, error } = await supabase
      .from("context_insights")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ [ContextService] Error retrieving context insights:", error);
      throw error;
    }

    return data || [];
  }
}
