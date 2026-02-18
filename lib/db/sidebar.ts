/**
 * Workspace Sidebar Database Service
 * Handles all right sidebar data (Data DNA, Context, Code)
 * Consolidates data from workspace_sidebar table
 */

import { supabase } from "@/lib/supabase";

export interface CodeHistoryEntry {
  code: string;
  executed_at: string;
  description?: string;
}

export interface ContextAnalysis {
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
  analyzed_at?: string;
}

export interface WorkspaceSidebar {
  id: string;
  session_id: string;
  filename: string;
  data_dna: any;
  context_analysis: ContextAnalysis | null;
  current_sql_code: string | null;
  sql_code_history: CodeHistoryEntry[];
  current_python_code: string | null;
  python_code_history: CodeHistoryEntry[];
  created_at: string;
  updated_at: string;
}

export class WorkspaceSidebarService {
  /**
   * Get sidebar data for a session
   * If no row exists, creates one automatically and syncs data_dna from sessions table
   */
  static async getSidebar(sessionId: string): Promise<WorkspaceSidebar | null> {
    const { data, error } = await supabase
      .from("workspace_sidebar")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned - create one and sync data_dna and filename from sessions
        console.log("📝 [SidebarService] No workspace_sidebar row found, creating one...");
        try {
          // Get data_dna and filename from sessions table
          const { data: sessionData, error: sessionError } = await supabase
            .from("sessions")
            .select("data_dna, filename")
            .eq("id", sessionId)
            .single();
          
          if (sessionError) {
            console.error("❌ [SidebarService] Error fetching session data:", {
              code: sessionError.code,
              message: sessionError.message,
              details: sessionError.details,
              hint: sessionError.hint,
            });
            throw sessionError;
          }
          
          const dataDNA = sessionData?.data_dna || null;
          const filename = sessionData?.filename || "Unknown Dataset";
          console.log("📊 [SidebarService] Found data_dna in sessions:", dataDNA ? "Yes" : "No");
          console.log("📄 [SidebarService] Found filename in sessions:", filename);
          
          return await this.initializeSidebar(sessionId, dataDNA, filename);
        } catch (initError: any) {
          console.error("❌ [SidebarService] Failed to initialize sidebar:", {
            error: initError,
            code: initError?.code,
            message: initError?.message,
            details: initError?.details,
            hint: initError?.hint,
            stringified: JSON.stringify(initError, null, 2),
          });
          return null;
        }
      }
      
      // Other error
      console.error("❌ [SidebarService] Error fetching sidebar:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    return data;
  }

  /**
   * Initialize sidebar for a new session
   */
  static async initializeSidebar(
    sessionId: string,
    dataDNA?: any,
    filename?: string
  ): Promise<WorkspaceSidebar> {
    console.log("🔧 [SidebarService] Initializing sidebar with:", {
      sessionId,
      hasDataDNA: !!dataDNA,
      filename,
    });

    const { data, error } = await supabase
      .from("workspace_sidebar")
      .insert({
        session_id: sessionId,
        data_dna: dataDNA || null,
        filename: filename || "Unknown Dataset",
        sql_code_history: [],
        python_code_history: [],
      })
      .select()
      .single();

    if (error) {
      console.error("❌ [SidebarService] Error initializing sidebar:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        sessionId,
        stringified: JSON.stringify(error, null, 2),
      });
      throw error;
    }

    console.log("✅ [SidebarService] Sidebar initialized successfully:", data.id);
    return data;
  }

  /**
   * Update Data DNA
   */
  static async updateDataDNA(sessionId: string, dataDNA: any): Promise<void> {
    const { error } = await supabase
      .from("workspace_sidebar")
      .upsert(
        {
          session_id: sessionId,
          data_dna: dataDNA,
        },
        {
          onConflict: "session_id",
        }
      );

    if (error) {
      console.error("❌ [SidebarService] Error updating Data DNA:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        sessionId,
      });
      throw error;
    }
  }

  /**
   * Update Context Analysis
   */
  static async updateContextAnalysis(
    sessionId: string,
    contextAnalysis: Omit<ContextAnalysis, "analyzed_at">
  ): Promise<void> {
    const contextWithTimestamp = {
      ...contextAnalysis,
      analyzed_at: new Date().toISOString(),
    };

    console.log("📝 [SidebarService] Upserting context analysis:", {
      sessionId,
      hasData: !!contextAnalysis,
      keys: Object.keys(contextAnalysis),
    });

    // Step 1: Get filename from sessions table (required for NOT NULL constraint)
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("filename")
      .eq("id", sessionId)
      .single();

    if (sessionError) {
      console.error("❌ [SidebarService] Failed to fetch session filename:", sessionError);
      throw new Error(`Cannot upsert context: session not found (${sessionError.message})`);
    }

    if (!session?.filename) {
      console.error("❌ [SidebarService] Session has no filename");
      throw new Error("Cannot upsert context: session filename is null");
    }

    console.log("📄 [SidebarService] Fetched filename from sessions:", session.filename);

    // Step 2: Upsert with filename included
    const { data, error } = await supabase
      .from("workspace_sidebar")
      .upsert(
        {
          session_id: sessionId,
          filename: session.filename,  // ← CRITICAL: Include filename for NOT NULL constraint
          context_analysis: contextWithTimestamp,
        },
        {
          onConflict: "session_id",
        }
      )
      .select();

    if (error) {
      console.error("❌ [SidebarService] Error upserting context analysis:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        sessionId,
      });
      throw error;
    }

    // Verify the data was actually saved
    const { data: verify, error: verifyError } = await supabase
      .from("workspace_sidebar")
      .select("context_analysis")
      .eq("session_id", sessionId)
      .single();

    if (verifyError) {
      console.error("⚠️ [SidebarService] Failed to verify context save:", verifyError);
    } else {
      console.log("✅ [SidebarService] Verified context_analysis in DB:", 
        verify?.context_analysis ? "HAS DATA" : "STILL NULL"
      );
      if (!verify?.context_analysis) {
        throw new Error("Context analysis was not saved to database (verification returned null)");
      }
    }
  }

  /**
   * Update SQL Code
   */
  static async updateSQLCode(
    sessionId: string,
    code: string,
    addToHistory: boolean = true,
    description?: string
  ): Promise<void> {
    const sidebar = await this.getSidebar(sessionId);

    const updates: any = {
      current_sql_code: code,
    };

    if (addToHistory) {
      const history = sidebar?.sql_code_history || [];
      updates.sql_code_history = [
        ...history,
        {
          code,
          executed_at: new Date().toISOString(),
          description,
        },
      ];
    }

    const { error } = await supabase
      .from("workspace_sidebar")
      .update(updates)
      .eq("session_id", sessionId);

    if (error) {
      console.error("❌ [SidebarService] Error updating SQL code:", error);
      throw error;
    }
  }

  /**
   * Update Python Code
   */
  static async updatePythonCode(
    sessionId: string,
    code: string,
    addToHistory: boolean = true,
    description?: string
  ): Promise<void> {
    const sidebar = await this.getSidebar(sessionId);

    const updates: any = {
      current_python_code: code,
    };

    if (addToHistory) {
      const history = sidebar?.python_code_history || [];
      updates.python_code_history = [
        ...history,
        {
          code,
          executed_at: new Date().toISOString(),
          description,
        },
      ];
    }

    const { error } = await supabase
      .from("workspace_sidebar")
      .update(updates)
      .eq("session_id", sessionId);

    if (error) {
      console.error("❌ [SidebarService] Error updating Python code:", error);
      throw error;
    }
  }

  /**
   * Clear code history
   */
  static async clearCodeHistory(
    sessionId: string,
    type: "sql" | "python" | "both"
  ): Promise<void> {
    const updates: any = {};

    if (type === "sql" || type === "both") {
      updates.sql_code_history = [];
      updates.current_sql_code = null;
    }

    if (type === "python" || type === "both") {
      updates.python_code_history = [];
      updates.current_python_code = null;
    }

    const { error } = await supabase
      .from("workspace_sidebar")
      .update(updates)
      .eq("session_id", sessionId);

    if (error) {
      console.error("❌ [SidebarService] Error clearing code history:", error);
      throw error;
    }
  }

  /**
   * Get code history for a session
   */
  static async getCodeHistory(
    sessionId: string,
    type: "sql" | "python"
  ): Promise<CodeHistoryEntry[]> {
    const sidebar = await this.getSidebar(sessionId);
    if (!sidebar) return [];

    return type === "sql"
      ? sidebar.sql_code_history || []
      : sidebar.python_code_history || [];
  }

  /**
   * Delete sidebar data for a session
   */
  static async deleteSidebar(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from("workspace_sidebar")
      .delete()
      .eq("session_id", sessionId);

    if (error) {
      console.error("❌ [SidebarService] Error deleting sidebar:", error);
      throw error;
    }
  }

  /**
   * Upsert entire sidebar data (useful for bulk updates)
   */
  static async upsertSidebar(
    sessionId: string,
    sidebarData: Partial<Omit<WorkspaceSidebar, "id" | "created_at" | "updated_at">>
  ): Promise<WorkspaceSidebar> {
    const { data, error } = await supabase
      .from("workspace_sidebar")
      .upsert(
        {
          session_id: sessionId,
          ...sidebarData,
        },
        {
          onConflict: "session_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("❌ [SidebarService] Error upserting sidebar:", error);
      throw error;
    }

    return data;
  }
}
