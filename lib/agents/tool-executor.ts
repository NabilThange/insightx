/**
 * Tool Executor - Executes tool calls from agents
 * Calls real backend API for SQL/Python execution
 */

import { WorkspaceSidebarService } from '@/lib/db/sidebar';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

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
  private codeWriteCallback?: (code: string, language: string, description?: string) => void;
  private toolCallCallback?: (toolName: string, status: 'start' | 'success' | 'error', data?: any) => void;
  private currentMessageId?: string;

  constructor(
    sessionId: string, 
    codeWriteCallback?: (code: string, language: string, description?: string) => void,
    toolCallCallback?: (toolName: string, status: 'start' | 'success' | 'error', data?: any) => void
  ) {
    this.sessionId = sessionId;
    this.codeWriteCallback = codeWriteCallback;
    this.toolCallCallback = toolCallCallback;
  }

  /**
   * Set the current message ID for linking executions to messages
   */
  setMessageContext(messageId: string): void {
    this.currentMessageId = messageId;
  }

  /**
   * Load Data DNA from backend
   */
  async loadDataDNA(): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/session/${this.sessionId}`);
      if (!response.ok) {
        console.warn('[ToolExecutor] Backend not available, using mock Data DNA');
        // Use mock Data DNA for development
        this.dataDNA = {
          filename: 'sample_transactions.csv',
          rowCount: 250000,
          columns: [
            { name: 'transaction_id', type: 'string' },
            { name: 'amount', type: 'number' },
            { name: 'category', type: 'string' },
            { name: 'state', type: 'string' },
            { name: 'timestamp', type: 'datetime' },
          ],
          baselines: {
            avg_amount: 125.50,
            failure_rate: 4.2,
            total_transactions: 250000,
          },
          patterns: [
            'Peak transactions occur at 2pm-4pm',
            'Electronics category has highest average amount',
          ],
        };
        this.accumulatedInsights = [];
        return;
      }
      const session = await response.json();
      this.dataDNA = session.data_dna;
      this.accumulatedInsights = session.data_dna?.accumulated_insights || [];
      console.log('[ToolExecutor] Data DNA loaded successfully');
    } catch (error) {
      console.error('[ToolExecutor] Failed to load Data DNA:', error);
      // Use mock data as fallback
      this.dataDNA = {
        filename: 'sample_transactions.csv',
        rowCount: 250000,
        columns: [
          { name: 'transaction_id', type: 'string' },
          { name: 'amount', type: 'number' },
          { name: 'category', type: 'string' },
          { name: 'state', type: 'string' },
          { name: 'timestamp', type: 'datetime' },
        ],
        baselines: {
          avg_amount: 125.50,
          failure_rate: 4.2,
          total_transactions: 250000,
        },
      };
      this.accumulatedInsights = [];
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
      // Emit tool call start event
      this.toolCallCallback?.(toolName, 'start', { args });
      console.log(`[ToolExecutor] 🔧 Tool call started: ${toolName}`);

      let result: any;

      switch (toolName) {
        case 'read_data_dna':
          result = await this.readDataDNA(args as { sections?: string[] });
          break;

        case 'read_context':
          result = await this.readContext(args as { query_type?: string });
          break;

        case 'write_context':
          result = await this.writeContext(args as { insight: any });
          break;

        case 'run_sql':
          result = await this.runSQL(args as { sql: string; limit?: number });
          break;

        case 'run_python':
          result = await this.runPython(args as { code: string; timeout?: number });
          break;

        case 'write_code':
          result = await this.writeCode(args as { code: string; language: string; description?: string });
          break;

        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }

      const executionTime = Date.now() - startTime;

      // Emit tool call success event
      this.toolCallCallback?.(toolName, 'success', { 
        result, 
        executionTime,
        dataSize: result?.rows?.length || result?.length || 0
      });
      console.log(`[ToolExecutor] ✅ Tool call completed: ${toolName} (${executionTime}ms)`);

      return {
        success: true,
        data: result,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Emit tool call error event
      this.toolCallCallback?.(toolName, 'error', { 
        error: errorMessage, 
        executionTime 
      });
      console.error(`[ToolExecutor] ❌ Tool ${toolName} failed (${executionTime}ms):`, errorMessage);

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
    console.log('[ToolExecutor] 📖 Reading Data DNA...');
    
    if (!this.dataDNA) {
      await this.loadDataDNA();
    }

    if (!args.sections || args.sections.length === 0) {
      // Return full Data DNA
      console.log('[ToolExecutor] ✅ Returning full Data DNA');
      return this.dataDNA;
    }

    // Return specific sections
    const filtered: any = {};
    for (const section of args.sections) {
      if (this.dataDNA[section]) {
        filtered[section] = this.dataDNA[section];
      }
    }
    console.log(`[ToolExecutor] ✅ Returned ${Object.keys(filtered).length} sections from Data DNA`);
    return filtered;
  }

  /**
   * Read accumulated context/insights
   */
  private async readContext(args: { query_type?: string }): Promise<any> {
    console.log('[ToolExecutor] 📚 Reading accumulated context...');
    
    if (!this.dataDNA) {
      await this.loadDataDNA();
    }

    const insights = this.accumulatedInsights;

    if (!args.query_type || args.query_type === 'all') {
      console.log(`[ToolExecutor] ✅ Returned ${insights.length} accumulated insights`);
      return { insights };
    }

    // Filter by type
    const filtered = insights.filter((insight: any) => 
      insight.finding?.toLowerCase().includes(args.query_type!.toLowerCase())
    );

    console.log(`[ToolExecutor] ✅ Returned ${filtered.length} filtered insights`);
    return { insights: filtered };
  }

  /**
   * Write new insight to context
   */
  private async writeContext(args: { insight: any }): Promise<any> {
    console.log('[ToolExecutor] 💾 Writing insight to context...');
    
    try {
      // Add timestamp if not present
      if (!args.insight.timestamp) {
        args.insight.timestamp = new Date().toISOString();
      }

      this.accumulatedInsights.push(args.insight);

      // Update Data DNA in backend
      const response = await fetch(`${BACKEND_URL}/api/session/${this.sessionId}/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          insight: args.insight,
        }),
      });

      if (!response.ok) {
        console.warn('[ToolExecutor] ⚠️ Failed to save insight to backend, storing locally only');
      } else {
        console.log('[ToolExecutor] ✅ Insight saved to backend');
      }

      return {
        success: true,
        message: 'Insight saved to accumulated context',
      };
    } catch (error) {
      console.error('[ToolExecutor] ❌ Failed to write context:', error);
      // Still return success if we saved locally
      return {
        success: true,
        message: 'Insight saved locally (backend unavailable)',
      };
    }
  }

  /**
   * Run SQL query via real backend
   */
  private async runSQL(args: { sql: string; limit?: number }): Promise<any> {
    const startTime = Date.now();
    
    try {
      console.log('[ToolExecutor] 🔍 Executing SQL query...');
      console.log(`[ToolExecutor] 📝 Full SQL received: ${args.sql}`);
      console.log(`[ToolExecutor] 📝 SQL type: ${typeof args.sql}`);
      console.log(`[ToolExecutor] 📝 SQL length: ${args.sql.length} characters`);
      console.log(`[ToolExecutor] 📝 Query preview: ${args.sql.substring(0, 150)}${args.sql.length > 150 ? '...' : ''}`);
      
      const response = await fetch(`${BACKEND_URL}/api/sql/execute`, {
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
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        const errorMessage = errorData.detail || `SQL execution failed: ${response.statusText}`;
        
        // Save error to sidebar
        const executionTime = Date.now() - startTime;
        await WorkspaceSidebarService.updateSQLCode(
          this.sessionId,
          args.sql,
          true,
          {
            description: 'SQL query failed',
            message_id: this.currentMessageId,
            status: 'error',
            error_message: errorMessage,
            execution_time_ms: executionTime,
          }
        ).catch(err => console.error('[ToolExecutor] Failed to save SQL error to sidebar:', err));
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const executionTime = Date.now() - startTime;
      const rowCount = result.data.rows?.length || 0;
      
      console.log(`[ToolExecutor] ✅ SQL execution successful: ${rowCount} rows returned in ${executionTime}ms`);
      
      // Save successful execution to sidebar with full metadata
      await WorkspaceSidebarService.updateSQLCode(
        this.sessionId,
        args.sql,
        true,
        {
          description: 'SQL query executed',
          message_id: this.currentMessageId,
          result: result.data.rows,
          row_count: rowCount,
          execution_time_ms: executionTime,
          status: 'success',
        }
      ).catch(err => console.error('[ToolExecutor] Failed to save SQL to sidebar:', err));
      
      return result.data;
    } catch (error) {
      console.error('[ToolExecutor] ❌ SQL execution failed:', error);
      throw error;
    }
  }

  /**
   * Run Python code via real backend
   */
  private async runPython(args: { code: string; timeout?: number }): Promise<any> {
    const startTime = Date.now();
    
    try {
      console.log('[ToolExecutor] 📊 Executing Python code...');
      console.log(`[ToolExecutor] 📝 Full Python code received: ${args.code}`);
      console.log(`[ToolExecutor] 📝 Code type: ${typeof args.code}`);
      console.log(`[ToolExecutor] 📝 Code length: ${args.code.length} characters`);
      console.log(`[ToolExecutor] 📝 Code preview: ${args.code.substring(0, 150)}${args.code.length > 150 ? '...' : ''}`);
      
      const response = await fetch(`${BACKEND_URL}/api/python/execute`, {
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
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        const errorMessage = errorData.detail || `Python execution failed: ${response.statusText}`;
        
        // Save error to sidebar
        const executionTime = Date.now() - startTime;
        await WorkspaceSidebarService.updatePythonCode(
          this.sessionId,
          args.code,
          true,
          {
            description: 'Python execution failed',
            message_id: this.currentMessageId,
            status: 'error',
            error_message: errorMessage,
            execution_time_ms: executionTime,
          }
        ).catch(err => console.error('[ToolExecutor] Failed to save Python error to sidebar:', err));
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const executionTime = Date.now() - startTime;
      
      console.log(`[ToolExecutor] ✅ Python execution successful in ${executionTime}ms`);
      console.log(`[ToolExecutor] 📊 Result: ${JSON.stringify(result.data).substring(0, 150)}...`);
      
      // Save successful execution to sidebar with full metadata
      await WorkspaceSidebarService.updatePythonCode(
        this.sessionId,
        args.code,
        true,
        {
          description: 'Python analysis executed',
          message_id: this.currentMessageId,
          result: result.data,
          execution_time_ms: executionTime,
          status: 'success',
        }
      ).catch(err => console.error('[ToolExecutor] Failed to save Python to sidebar:', err));
      
      return result.data;
    } catch (error) {
      console.error('[ToolExecutor] ❌ Python execution failed:', error);
      throw error;
    }
  }

  /**
   * Write code to sidebar - ACTUALLY SAVES TO DATABASE
   */
  private async writeCode(args: { code: string; language: string; description?: string }): Promise<any> {
    try {
      console.log(`[ToolExecutor] 📝 Writing ${args.language.toUpperCase()} code to sidebar`);
      console.log(`[ToolExecutor] 📄 Code length: ${args.code.length} characters`);
      console.log(`[ToolExecutor] 📄 First 100 chars: ${args.code.substring(0, 100)}`);
      
      // Actually save to database
      if (args.language === 'sql') {
        await WorkspaceSidebarService.updateSQLCode(
          this.sessionId,
          args.code,
          false,  // Don't add to history yet - execution will do that
          { 
            description: args.description || 'SQL query generated',
            message_id: this.currentMessageId,
            status: 'success'  // Mark as generated (will be updated on execution)
          }
        );
        console.log(`[ToolExecutor] ✅ SQL code saved to workspace_sidebar.current_sql_code`);
      } else if (args.language === 'python') {
        await WorkspaceSidebarService.updatePythonCode(
          this.sessionId,
          args.code,
          false,  // Don't add to history yet - execution will do that
          { 
            description: args.description || 'Python code generated',
            message_id: this.currentMessageId,
            status: 'success'  // Mark as generated (will be updated on execution)
          }
        );
        console.log(`[ToolExecutor] ✅ Python code saved to workspace_sidebar.current_python_code`);
      }

      // Also call the callback for real-time UI updates
      if (this.codeWriteCallback) {
        this.codeWriteCallback(args.code, args.language, args.description);
      }

      return {
        success: true,
        message: `${args.language.toUpperCase()} code written to sidebar and saved to database`,
      };
    } catch (error) {
      console.error('[ToolExecutor] ❌ Failed to write code:', error);
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
