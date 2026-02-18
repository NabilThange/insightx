"use client";

import { useState } from "react";
import { WorkspaceSidebarService } from "@/lib/db/sidebar";
import { supabase } from "@/lib/supabase";

export default function TestSidebarPage() {
  const [sessionId, setSessionId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testGetSidebar = async () => {
    if (!sessionId) {
      alert("Please enter a session ID");
      return;
    }

    setLoading(true);
    try {
      console.log("Testing getSidebar for:", sessionId);
      const data = await WorkspaceSidebarService.getSidebar(sessionId);
      console.log("Result:", data);
      setResult({ success: true, data });
    } catch (error) {
      console.error("Error:", error);
      setResult({ success: false, error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testDirectQuery = async () => {
    if (!sessionId) {
      alert("Please enter a session ID");
      return;
    }

    setLoading(true);
    try {
      console.log("Testing direct Supabase query for:", sessionId);
      
      // Check sessions table
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      
      console.log("Sessions table:", sessionData, sessionError);

      // Check workspace_sidebar table
      const { data: sidebarData, error: sidebarError } = await supabase
        .from("workspace_sidebar")
        .select("*")
        .eq("session_id", sessionId)
        .single();
      
      console.log("Workspace sidebar table:", sidebarData, sidebarError);

      setResult({
        success: true,
        sessions: { data: sessionData, error: sessionError?.message },
        workspace_sidebar: { data: sidebarData, error: sidebarError?.message }
      });
    } catch (error) {
      console.error("Error:", error);
      setResult({ success: false, error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  const listAllSessions = async () => {
    setLoading(true);
    try {
      const { data: sessions } = await supabase
        .from("sessions")
        .select("id, filename, created_at, data_dna")
        .order("created_at", { ascending: false })
        .limit(10);

      const { data: sidebars } = await supabase
        .from("workspace_sidebar")
        .select("session_id, data_dna, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      setResult({
        success: true,
        sessions,
        sidebars,
        comparison: sessions?.map(s => ({
          session_id: s.id,
          filename: s.filename,
          has_dna_in_sessions: !!s.data_dna,
          has_sidebar_row: sidebars?.some(sb => sb.session_id === s.id),
        }))
      });
    } catch (error) {
      console.error("Error:", error);
      setResult({ success: false, error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem" }}>Workspace Sidebar Debug Tool</h1>

      <div style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h2>Test Session ID</h2>
        <input
          type="text"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder="Enter session ID"
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "1rem",
            fontSize: "1rem",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
        
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <button
            onClick={testGetSidebar}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Loading..." : "Test getSidebar()"}
          </button>

          <button
            onClick={testDirectQuery}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Loading..." : "Test Direct Query"}
          </button>

          <button
            onClick={listAllSessions}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "1rem",
              backgroundColor: "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Loading..." : "List All Sessions"}
          </button>
        </div>
      </div>

      {result && (
        <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
          <h2>Result:</h2>
          <pre style={{ 
            overflow: "auto", 
            padding: "1rem", 
            backgroundColor: "#1e1e1e", 
            color: "#d4d4d4",
            borderRadius: "4px",
            fontSize: "0.875rem"
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#f3f4f6" }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Enter a session ID from your database</li>
          <li>Click "Test getSidebar()" to test the service method</li>
          <li>Click "Test Direct Query" to see raw database data</li>
          <li>Click "List All Sessions" to see all sessions and their sidebar status</li>
          <li>Check the browser console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
}
