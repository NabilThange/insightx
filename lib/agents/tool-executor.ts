/**
 * Tool Executor - Executes tool calls from agents
 * Calls backend APIs for SQL/Python execution
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ToolCallResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
}

export class ToolExecutor {
  private sessionId: string;
  private dataDNA: any = null;
  private accumulatedInsights: any[] = [];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  /**
   * Load Data DNA from backend
   */
  async loadDataDNA(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/session/${this.sessionId}`);
      if (!response.ok) {
        throw new Error(`Failed to load session: ${response.statusText}`);
      }
      const session = await response.json();
      this.dataDNA = session.data_dna;
      this.accumulatedInsights = session.data_dna?.accumulated_insights || [];
    } catch (error) {
      console.error('[ToolExecutor] Failed to load Data DNA:', error);
      throw error;
    }
  }

  /**
   * Execute a tool call
   */
  async executeToolCall(
    toolName: string,
    args: Record<string, any>
  ): Promise<ToolCallResult> {
    const startTime = Date.now();

    try {
      let result: any;

      switch (toolName) {
        case 'read_data_dna':
          result = await this.readDataDNA(args);
          break;

        case 'read_context':
          result = await this.readContext(args);
          break;

        case 'write_context':
          result = await this.writeContext(args);
          break;

        case 'run_sql':
          result = await this.runSQL(args);
          break;

        case 'run_python':
          result = await this.runPython(args);
          break;

        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error(`[ToolExecutor] Tool ${toolName} failed:`, errorMessage);

      return {
        success: false,
        error: errorMessage,
        executionTime,
      };
    }
  }

  /**
   * Read Data DNA
   */
  private async readDataDNA(args: { sections?: string[] }): Promise<any> {
    if (!this.dataDNA) {
      await this.loadDataDNA();
    }

    if (!args.sections || args.sections.length === 0) {
      // Return full Data DNA
      return this.dataDNA;
    }

    // Return specific sections
    const filtered: any = {};
    for (const section of args.sections) {
      if (this.dataDNA[section]) {
        filtered[section] = this.dataDNA[section];
      }
    }
    return filtered;
  }

  /**
   * Read accumulated context/insights
   */
  private async readContext(args: { query_type?: string }): Promise<any> {
    if (!this.dataDNA) {
      await this.loadDataDNA();
    }

    const insights = this.accumulatedInsights;

    if (!args.query_type || args.query_type === 'all') {
      return { insights };
    }

    // Filter by type
    const filtered = insights.filter((insight: any) => 
      insight.finding?.toLowerCase().includes(args.query_type!.toLowerCase())
    );

    return { insights: filtered };
  }

  /**
   * Write new insight to context
   */
  private async writeContext(args: { insight: any }): Promise<any> {
    try {
      // Add timestamp if not present
      if (!args.insight.timestamp) {
        args.insight.timestamp = new Date().toISOString();
      }

      this.accumulatedInsights.push(args.insight);

      // Update Data DNA in backend
      const response = await fetch(`${API_BASE_URL}/session/${this.sessionId}/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          insight: args.insight,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save insight: ${response.statusText}`);
      }

      return {
        success: true,
        message: 'Insight saved to accumulated context',
      };
    } catch (error) {
      console.error('[ToolExecutor] Failed to write context:', error);
      throw error;
    }
  }

  /**
   * Run SQL query on backend
   */
  private async runSQL(args: { sql: string; limit?: number }): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/sql/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          sql: args.sql,
          limit: args.limit || 500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SQL execution failed: ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('[ToolExecutor] SQL execution failed:', error);
      throw error;
    }
  }

  /**
   * Run Python code on backend
   */
  private async runPython(args: { code: string; timeout?: number }): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/python/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          code: args.code,
          timeout: args.timeout || 10,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Python execution failed: ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('[ToolExecutor] Python execution failed:', error);
      throw error;
    }
  }

  /**
   * Get current Data DNA
   */
  getDataDNA(): any {
    return this.dataDNA;
  }

  /**
   * Get accumulated insights
   */
  getAccumulatedInsights(): any[] {
    return this.accumulatedInsights;
  }
}
