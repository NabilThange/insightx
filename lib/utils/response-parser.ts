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

    // Strategy 2: Try to find JSON object directly
    const jsonMatch = rawResponse.match(/\{[\s\S]*?"text"[\s\S]*?\}/);
    if (jsonMatch) {
      const json = JSON.parse(jsonMatch[0]);
      return validateComposerResponse(json);
    }

    // Strategy 3: Try to parse the entire response as JSON
    const json = JSON.parse(rawResponse);
    return validateComposerResponse(json);
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
  // Check if it contains JSON structure indicators
  return (
    text.includes('"text"') &&
    (text.includes('```json') || text.includes('"metrics"') || text.includes('"follow_ups"'))
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
