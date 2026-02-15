/**
 * Agent Context Builder
 * Builds conversation context for agents to maintain memory across turns
 */

import { backendAPI } from '@/lib/api/backend';

export class AgentContextBuilder {
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  /**
   * Builds dynamic context from conversation history
   * Returns formatted context to prepend to agent messages
   */
  async buildDynamicContext(): Promise<string> {
    try {
      // Fetch session data including Data DNA
      const sessionData = await backendAPI.getSession(this.sessionId);
      
      if (!sessionData) {
        return '';
      }

      const contextParts: string[] = [];

      // Add Data DNA summary if available
      if (sessionData.data_dna) {
        contextParts.push('📊 DATASET CONTEXT');
        contextParts.push(`Dataset: ${sessionData.data_dna.file_name || 'Uploaded data'}`);
        contextParts.push(`Rows: ${sessionData.data_dna.row_count || 'Unknown'}`);
        contextParts.push(`Columns: ${sessionData.data_dna.column_count || 'Unknown'}`);
        
        if (sessionData.data_dna.columns && sessionData.data_dna.columns.length > 0) {
          const columnNames = sessionData.data_dna.columns
            .slice(0, 10)
            .map((col: any) => col.name)
            .join(', ');
          contextParts.push(`Key columns: ${columnNames}`);
        }
        contextParts.push('');
      }

      // Add conversation history summary
      const historyContext = await this.getConversationHistorySummary();
      if (historyContext) {
        contextParts.push(historyContext);
      }

      if (contextParts.length === 0) {
        return '';
      }

      return `---
${contextParts.join('\n')}
---

Use the above context to inform your response. Reference previous findings when relevant.`;

    } catch (error) {
      console.error('[ContextBuilder] Failed to build context:', error);
      return '';
    }
  }

  /**
   * Gets summary of recent conversation history
   */
  private async getConversationHistorySummary(): Promise<string> {
    try {
      // Try to fetch recent messages from backend
      // This assumes you have an endpoint to get messages by session
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/session/${this.sessionId}?limit=5`);
      
      if (!response.ok) {
        return '';
      }

      const messages = await response.json();

      if (!messages || messages.length === 0) {
        return '';
      }

      const contextLines: string[] = ['💬 RECENT CONVERSATION'];
      
      messages.slice(-5).forEach((msg: any) => {
        const preview = msg.content?.text?.slice(0, 100) || msg.content?.slice(0, 100) || '';
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        contextLines.push(`${role}: ${preview}${preview.length >= 100 ? '...' : ''}`);
      });

      return contextLines.join('\n');

    } catch (error) {
      // Silently fail - context is optional
      return '';
    }
  }

  /**
   * Gets metadata about existing artifacts/insights
   */
  async getArtifactsMetadata(): Promise<string> {
    try {
      // This would fetch saved insights/artifacts from your backend
      // For now, return empty string
      return '';
    } catch (error) {
      console.error('[ContextBuilder] Failed to get artifacts metadata:', error);
      return '';
    }
  }

  /**
   * Builds context specifically for SQL agent
   */
  async buildSQLContext(): Promise<string> {
    try {
      const sessionData = await backendAPI.getSession(this.sessionId);
      
      if (!sessionData?.data_dna) {
        return '';
      }

      const contextParts: string[] = ['📊 DATABASE SCHEMA'];

      if (sessionData.data_dna.columns) {
        contextParts.push('\nAvailable columns:');
        sessionData.data_dna.columns.forEach((col: any) => {
          contextParts.push(`- ${col.name} (${col.type}): ${col.description || 'No description'}`);
        });
      }

      if (sessionData.data_dna.sample_values) {
        contextParts.push('\nSample data patterns available in Data DNA.');
      }

      return contextParts.join('\n');

    } catch (error) {
      console.error('[ContextBuilder] Failed to build SQL context:', error);
      return '';
    }
  }

  /**
   * Builds context specifically for Python agent
   */
  async buildPythonContext(): Promise<string> {
    try {
      const sessionData = await backendAPI.getSession(this.sessionId);
      
      if (!sessionData?.data_dna) {
        return '';
      }

      const contextParts: string[] = ['🐍 STATISTICAL CONTEXT'];

      if (sessionData.data_dna.statistics) {
        contextParts.push('\nDataset statistics available in Data DNA:');
        contextParts.push('- Distributions, correlations, outliers pre-computed');
      }

      return contextParts.join('\n');

    } catch (error) {
      console.error('[ContextBuilder] Failed to build Python context:', error);
      return '';
    }
  }
}

/**
 * Helper function to create context builder
 */
export function createContextBuilder(sessionId: string): AgentContextBuilder {
  return new AgentContextBuilder(sessionId);
}
