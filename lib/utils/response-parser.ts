/**
 * Response Parser Utility
 * Parses Composer agent responses and extracts structured JSON
 */

export interface ComposerResponse {
  text: string;
  metrics?: Record<string, any> | null;
  chart_spec?: {
    type: 'bar' | 'line' | 'pie' | 'scatter';
    data: any[];
    xAxis?: string;
    yAxis?: string;
    title?: string;
  } | null;
  confidence?: number;
  follow_ups?: string[];
  sql_used?: string | null;
  insight_type?: string;
  data_rows?: number;
  warning?: string | null;
}

/**
 * Parse Composer response from raw text
 * Handles markdown code blocks and extracts JSON
 */
export function parseComposerResponse(rawResponse: string): ComposerResponse | null {
  try {
    // Strategy 1: Try to extract JSON from markdown code block
    const codeBlockMatch = rawResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      const json = JSON.parse(codeBlockMatch[1]);
      return validateComposerResponse(json);
    }

    // Strategy 2: Try to parse the entire response as JSON directly
    // This handles cases where the response is pure JSON without markdown
    try {
      const json = JSON.parse(rawResponse);
      return validateComposerResponse(json);
    } catch (e) {
      // Not valid JSON, continue to next strategy
    }

    // Strategy 3: Try to find and extract a complete JSON object
    // This is a fallback for malformed responses
    const trimmed = rawResponse.trim();
    if (trimmed.startsWith('{')) {
      // Find the matching closing brace
      let braceCount = 0;
      let endIndex = -1;
      
      for (let i = 0; i < trimmed.length; i++) {
        if (trimmed[i] === '{') braceCount++;
        if (trimmed[i] === '}') braceCount--;
        
        if (braceCount === 0) {
          endIndex = i + 1;
          break;
        }
      }
      
      if (endIndex > 0) {
        const jsonStr = trimmed.substring(0, endIndex);
        const json = JSON.parse(jsonStr);
        return validateComposerResponse(json);
      }
    }

    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('[ResponseParser] Failed to parse Composer response:', error);
    console.error('[ResponseParser] Raw response:', rawResponse.substring(0, 500));
    return null;
  }
}

/**
 * Validate and normalize Composer response
 * Ensures all required fields are present
 */
function validateComposerResponse(json: any): ComposerResponse {
  // Required field: text
  if (!json.text || typeof json.text !== 'string') {
    throw new Error('Missing or invalid "text" field');
  }

  // Build validated response with defaults
  const response: ComposerResponse = {
    text: json.text,
    metrics: json.metrics || null,
    chart_spec: json.chart_spec || null,
    confidence: typeof json.confidence === 'number' ? json.confidence : undefined,
    follow_ups: Array.isArray(json.follow_ups) ? json.follow_ups : [],
    sql_used: json.sql_used || null,
    insight_type: json.insight_type,
    data_rows: json.data_rows,
    warning: json.warning || null,
  };

  return response;
}

/**
 * Check if a response is a structured Composer response
 */
export function isComposerResponse(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  
  // Quick check: does it look like JSON?
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    // Try to parse it to confirm
    try {
      const parsed = JSON.parse(trimmed);
      // Check if it has the required "text" field
      return typeof parsed.text === 'string';
    } catch {
      return false;
    }
  }
  
  // Check if it contains JSON structure indicators (for markdown-wrapped JSON)
  return (
    text.includes('"text"') &&
    (text.includes('```json') || text.includes('"metrics"') || text.includes('"follow_ups"') || text.includes('"chart_spec"'))
  );
}

/**
 * Extract SQL query from response for sidebar display
 */
export function extractSQLQuery(response: ComposerResponse | string): string | null {
  if (typeof response === 'string') {
    const parsed = parseComposerResponse(response);
    return parsed?.sql_used || null;
  }
  return response.sql_used || null;
}
