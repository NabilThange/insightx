/**
 * Tool Definitions for InsightX Agents
 * OpenAI-compatible function schemas
 */

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required: string[];
    };
  };
}

// Tool: Read Data DNA
export const READ_DATA_DNA_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'read_data_dna',
    description: 'Read the full Data DNA (dataset profile) including schema, baselines, patterns, and correlations. Use this to understand what columns are available and what the baseline metrics are.',
    parameters: {
      type: 'object',
      properties: {
        sections: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific sections to read: ["columns", "baselines", "patterns", "correlations", "datetime_info", "outlier_summary", "segment_breakdown"]. Omit to read all.',
        },
      },
      required: [],
    },
  },
};

// Tool: Read Context (Accumulated Insights)
export const READ_CONTEXT_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'read_context',
    description: 'Read accumulated insights from previous queries in this session. Use this to build on past findings and avoid repeating analysis.',
    parameters: {
      type: 'object',
      properties: {
        query_type: {
          type: 'string',
          description: 'Filter insights by type: "all", "outliers", "correlations", "trends", etc.',
        },
      },
      required: [],
    },
  },
};

// Tool: Write Context (Save Insights)
export const WRITE_CONTEXT_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'write_context',
    description: 'Save new insights to accumulated context for future queries. Use this after discovering important patterns or findings.',
    parameters: {
      type: 'object',
      properties: {
        insight: {
          type: 'object',
          description: 'The insight to save',
          properties: {
            query: { type: 'string' },
            finding: { type: 'string' },
            baseline_update: { type: 'object' },
            timestamp: { type: 'string' },
          },
        },
      },
      required: ['insight'],
    },
  },
};

// Tool: Run SQL Query
export const RUN_SQL_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'run_sql',
    description: 'Execute a DuckDB SQL query against the dataset Parquet file. Only SELECT statements allowed. Use "transactions" as table name.',
    parameters: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          description: 'The SQL query to execute. Must be a SELECT statement. Use "transactions" as the table name.',
        },
        limit: {
          type: 'number',
          description: 'Maximum rows to return (default: 500)',
        },
      },
      required: ['sql'],
    },
  },
};

// Tool: Run Python Code
export const RUN_PYTHON_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'run_python',
    description: 'Execute Python code for statistical analysis. Available libraries: pandas, numpy, scipy.stats. The variable "result_df" contains data from SQL query. Print JSON output.',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Python code to execute. Use result_df as the input dataframe. Print results as JSON using json.dumps().',
        },
        timeout: {
          type: 'number',
          description: 'Timeout in seconds (default: 10)',
        },
      },
      required: ['code'],
    },
  },
};

// Tool: Write Code to Sidebar
export const WRITE_CODE_TOOL: ToolDefinition = {
  type: 'function',
  function: {
    name: 'write_code',
    description: 'Write code to the WorkspaceRightSidebar so the user can see what code was executed. Call this AFTER generating SQL or Python code but BEFORE executing it.',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The code to display in the sidebar',
        },
        language: {
          type: 'string',
          enum: ['sql', 'python'],
          description: 'The programming language of the code',
        },
        description: {
          type: 'string',
          description: 'Brief description of what the code does',
        },
      },
      required: ['code', 'language'],
    },
  },
};

// All tools registry
export const ALL_TOOLS: Record<string, ToolDefinition> = {
  read_data_dna: READ_DATA_DNA_TOOL,
  read_context: READ_CONTEXT_TOOL,
  write_context: WRITE_CONTEXT_TOOL,
  run_sql: RUN_SQL_TOOL,
  run_python: RUN_PYTHON_TOOL,
  write_code: WRITE_CODE_TOOL,
};

/**
 * Get tool definitions for a specific agent
 */
export function getToolsForAgent(toolIds: string[]): ToolDefinition[] {
  return toolIds
    .map((id) => ALL_TOOLS[id])
    .filter((tool): tool is ToolDefinition => tool !== undefined);
}

/**
 * Get tool definition by name
 */
export function getToolByName(name: string): ToolDefinition | undefined {
  return ALL_TOOLS[name];
}
