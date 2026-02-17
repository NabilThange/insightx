"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ContextData {
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
}

interface ContextPanelProps {
  dataDNA: any;
  sessionId: string;
}

export default function ContextPanel({ dataDNA, sessionId }: ContextPanelProps) {
  const [context, setContext] = useState<ContextData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call the context agent API
        const response = await fetch("/api/agents/context", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch context: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "Failed to analyze context");
        }

        setContext(data.response);
      } catch (err) {
        console.error("Error fetching context:", err);
        setError(err instanceof Error ? err.message : "Failed to load context");
      } finally {
        setLoading(false);
      }
    };

    if (dataDNA && sessionId) {
      fetchContext();
    }
  }, [dataDNA, sessionId]);

  if (loading) {
    return (
      <div className="panel-container">
        <h3 className="panel-title" style={{ color: "var(--warning)" }}>Context & Knowledge</h3>
        <div className="flex items-center justify-center gap-2 py-8">
          <Loader2 size={16} className="animate-spin" />
          <p className="panel-text">Analyzing dataset context...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-container">
        <h3 className="panel-title" style={{ color: "var(--warning)" }}>Context & Knowledge</h3>
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="panel-container">
        <h3 className="panel-title" style={{ color: "var(--warning)" }}>Context & Knowledge</h3>
        <p className="panel-text">No context data available.</p>
      </div>
    );
  }

  return (
    <div className="panel-container">
      <h3 className="panel-title" style={{ color: "var(--warning)" }}>Context & Knowledge</h3>
      
      <div className="context-content">
        {/* Dataset Name & Domain */}
        <div className="context-section">
          <h4 className="context-heading">📊 {context.dataset_name}</h4>
          <p className="context-label">Domain:</p>
          <p className="context-value">{context.domain}</p>
        </div>

        {/* Purpose */}
        <div className="context-section">
          <p className="context-label">Purpose:</p>
          <p className="context-value">{context.purpose}</p>
        </div>

        {/* Key Entities */}
        <div className="context-section">
          <p className="context-label">Key Entities:</p>
          <ul className="context-list">
            {context.key_entities.map((entity, idx) => (
              <li key={idx}>{entity}</li>
            ))}
          </ul>
        </div>

        {/* Use Cases */}
        <div className="context-section">
          <p className="context-label">Use Cases:</p>
          <ul className="context-list">
            {context.use_cases.map((useCase, idx) => (
              <li key={idx}>{useCase}</li>
            ))}
          </ul>
        </div>

        {/* Audience */}
        <div className="context-section">
          <p className="context-label">Audience:</p>
          <p className="context-value">{context.audience}</p>
        </div>

        {/* Business Value */}
        <div className="context-section">
          <p className="context-label">Business Value:</p>
          <p className="context-value">{context.business_value}</p>
        </div>

        {/* Data Health */}
        <div className="context-section">
          <p className="context-label">Data Health:</p>
          <p className="context-value">{context.data_health}</p>
        </div>

        {/* Key Insights */}
        <div className="context-section">
          <p className="context-label">Key Insights:</p>
          <ul className="context-list">
            {context.key_insights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        </div>

        {/* Recommended Analyses */}
        <div className="context-section">
          <p className="context-label">Recommended Analyses:</p>
          <ul className="context-list">
            {context.recommended_analyses.map((analysis, idx) => (
              <li key={idx}>{analysis}</li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <div className="context-section">
          <p className="context-label">Summary:</p>
          <div className="context-summary" dangerouslySetInnerHTML={{ __html: context.context_summary }} />
        </div>
      </div>

      <style jsx>{`
        .context-content {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .context-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .context-heading {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--fg);
          margin: 0;
        }

        .context-label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin: 0;
        }

        .context-value {
          font-size: 0.875rem;
          color: var(--fg);
          line-height: 1.5;
          margin: 0;
        }

        .context-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .context-list li {
          font-size: 0.875rem;
          color: var(--fg);
          padding-left: 1rem;
          position: relative;
          line-height: 1.4;
        }

        .context-list li:before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--accent);
          font-weight: bold;
        }

        .context-summary {
          font-size: 0.875rem;
          color: var(--fg);
          line-height: 1.6;
          background: var(--bg);
          padding: 0.75rem;
          border-radius: 0.375rem;
          border-left: 2px solid var(--accent);
        }
      `}</style>
    </div>
  );
}
