/**
 * Next.js API client for InsightX
 * Connects to Next.js API routes (Bytez-powered multi-agent system)
 */

import type { DataDNA } from "@/store/dataStore";

// Use environment variable or default to deployed backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://insightx-bkend.onrender.com/api";

export interface UploadResponse {
  session_id: string;
  filename: string;
  row_count: number;
  status: string;
}

export interface SessionResponse {
  id: string;
  filename: string;
  row_count: number | null;
  status: string;
  data_dna: any | null;
  parquet_path: string | null;
  created_at: string;
}

/**
 * Format raw session response into DataDNA format
 */
export function formatSessionToDataDNA(session: SessionResponse): DataDNA {
  const rawDna = session.data_dna || {};

  return {
    filename: session.filename,
    rowCount: session.row_count || rawDna.row_count || 0,
    columnCount: rawDna.columns?.length || rawDna.col_count || 0,
    uploadDate: new Date(session.created_at),

    health: rawDna.health ? {
      score: rawDna.health.score,
      grade: rawDna.health.grade,
      completeness: rawDna.health.completeness,
      duplicateRows: rawDna.health.duplicate_rows,
      duplicatePct: rawDna.health.duplicate_pct,
      missingCells: rawDna.health.missing_cells,
      constantCols: rawDna.health.constant_cols || [],
      allNullCols: rawDna.health.all_null_cols || [],
      highMissingCols: rawDna.health.high_missing_cols || [],
      missingByCol: rawDna.health.missing_by_col || {},
    } : undefined,

    missingSummary: rawDna.missing_summary ? {
      hasMissing: rawDna.missing_summary.has_missing,
      affectedColumns: rawDna.missing_summary.affected_columns,
      affectedRows: rawDna.missing_summary.affected_rows,
      affectedRowsPct: rawDna.missing_summary.affected_rows_pct,
      fullyEmptyRows: rawDna.missing_summary.fully_empty_rows,
      coMissingPairs: (rawDna.missing_summary.co_missing_pairs || []).map((p: any) => ({
        colA: p.col_a,
        colB: p.col_b,
        coMissingCount: p.co_missing_count,
      })),
    } : undefined,

    columns: rawDna.columns?.map((col: any) => ({
      name: col.name,
      type: col.type,
      dtype: col.dtype,
      nullPercentage: col.null_pct || 0,
      uniqueCount: col.unique_count,
      outlierCount: col.outlier_count_iqr,
      sampleValues: col.top_values
        ? (Array.isArray(col.top_values) ? col.top_values.slice(0, 3) : Object.keys(col.top_values).slice(0, 3))
        : col.min !== undefined
          ? [String(col.min), String(col.mean), String(col.max)]
          : [],
      // Numeric
      mean: col.mean,
      median: col.median,
      std: col.std,
      min: col.min,
      max: col.max,
      iqr: col.iqr,
      skewness: col.skewness,
      kurtosis: col.kurtosis,
      zerosPct: col.zeros_pct,
      outlierPct: col.outlier_pct,
      outlierCountIqr: col.outlier_count_iqr,
      topValues: col.top_values,
      topValuePct: col.top_value_pct,
      entropy: col.entropy,
      isDominated: col.is_dominated,
      rareValues: col.rare_values,
      // Date
      minDate: col.min_date,
      maxDate: col.max_date,
      spanDays: col.span_days,
      peakHour: col.peak_hour,
      peakDay: col.peak_day,
      medianGapDays: col.median_gap_days,
    })) || [],

    outlierSummary: (rawDna.outlier_summary || []).map((o: any) => ({
      column: o.column,
      iqrOutliers: o.iqr_outliers,
      iqrOutlierPct: o.iqr_outlier_pct,
      extremeOutliers: o.extreme_outliers,
      lowerFence: o.lower_fence,
      upperFence: o.upper_fence,
      minOutlier: o.min_outlier,
      maxOutlier: o.max_outlier,
    })),

    correlations: (rawDna.correlations || []).map((c: any) => ({
      colA: c.col_a,
      colB: c.col_b,
      strength: c.strength,
      pearsonR: c.pearson_r,
      spearmanR: c.spearman_r,
      direction: c.direction,
      nonlinear: c.nonlinear,
    })),

    segmentBreakdown: (rawDna.segment_breakdown || []).map((seg: any) => ({
      dimension: seg.dimension,
      metric: seg.metric,
      data: seg.data,
    })),

    datetimeInfo: rawDna.datetime_info ? {
      column: rawDna.datetime_info.column,
      peakHour: rawDna.datetime_info.peak_hour,
      peakDay: rawDna.datetime_info.peak_day,
      peakMonth: rawDna.datetime_info.peak_month,
      spanDays: rawDna.datetime_info.span_days,
      businessHoursPct: rawDna.datetime_info.business_hours_pct,
      hourDistribution: rawDna.datetime_info.hour_distribution,
      dayDistribution: rawDna.datetime_info.day_distribution,
    } : undefined,

    baselines: Object.entries(rawDna.baselines || {}).reduce((acc: any, [key, value]: any) => {
      if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          acc[`${key}_${subKey}`] = subValue;
        });
      } else {
        acc[key] = value;
      }
      return acc;
    }, {}),

    patterns: rawDna.detected_patterns || [],
    insights: rawDna.suggested_queries || [],
    accumulatedInsights: rawDna.accumulated_insights || [],
  };
}

export interface ChatResponse {
  id: string;
  session_id: string;
  title: string | null;
  created_at: string;
}

export interface MessageResponse {
  id: string;
  chat_id: string;
  role: string;
  content: any;
  created_at: string;
}

/**
 * Upload CSV file to backend
 */
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const uploadUrl = `${API_BASE_URL}/upload`;
  console.log("[uploadFile] Starting upload...");
  console.log("[uploadFile] URL:", uploadUrl);
  console.log("[uploadFile] File:", file.name, "Size:", file.size, "Type:", file.type);

  try {
    console.log("[uploadFile] Sending fetch request...");
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    console.log("[uploadFile] Response received");
    console.log("[uploadFile] Status:", response.status, response.statusText);
    console.log("[uploadFile] Headers:", {
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[uploadFile] Error response body:", errorText);
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("[uploadFile] Success! Response:", data);
    return data;
  } catch (error) {
    console.error("[uploadFile] Fetch error:", error);
    if (error instanceof Error) {
      console.error("[uploadFile] Error message:", error.message);
      console.error("[uploadFile] Error stack:", error.stack);
    }
    throw error;
  }
}

/**
 * Trigger data exploration for a session
 */
export async function exploreSession(sessionId: string): Promise<any> {
  const exploreUrl = `${API_BASE_URL}/explore/${sessionId}`;
  console.log("[exploreSession] Starting exploration...");
  console.log("[exploreSession] URL:", exploreUrl);

  try {
    const response = await fetch(exploreUrl, {
      method: "POST",
    });

    console.log("[exploreSession] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[exploreSession] Error:", errorText);
      throw new Error(`Exploration failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[exploreSession] Success! Data DNA generated");
    return data;
  } catch (error) {
    console.error("[exploreSession] Error:", error);
    throw error;
  }
}

/**
 * Get session details including Data DNA
 */
export async function getSession(sessionId: string): Promise<SessionResponse> {
  const sessionUrl = `${API_BASE_URL}/session/${sessionId}`;
  console.log("[getSession] Fetching session...");
  console.log("[getSession] URL:", sessionUrl);

  try {
    const response = await fetch(sessionUrl);

    console.log("[getSession] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[getSession] Error:", errorText);
      throw new Error(`Failed to fetch session: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[getSession] Success! Session status:", data.status);
    return data;
  } catch (error) {
    console.error("[getSession] Error:", error);
    throw error;
  }
}

/**
 * Poll session until status is 'ready'
 */
export async function pollSessionUntilReady(
  sessionId: string,
  onProgress?: (status: string) => void,
  maxAttempts = 60
): Promise<SessionResponse> {
  console.log("[pollSessionUntilReady] Starting poll loop...");
  console.log("[pollSessionUntilReady] Max attempts:", maxAttempts);

  for (let i = 0; i < maxAttempts; i++) {
    console.log(`[pollSessionUntilReady] Attempt ${i + 1}/${maxAttempts}`);

    try {
      const session = await getSession(sessionId);

      console.log(`[pollSessionUntilReady] Status: ${session.status}`);

      if (onProgress) {
        onProgress(session.status);
      }

      if (session.status === "ready") {
        console.log("[pollSessionUntilReady] Session ready!");
        return session;
      }

      // Wait 2 seconds before next poll
      console.log("[pollSessionUntilReady] Waiting 2 seconds before next poll...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`[pollSessionUntilReady] Error on attempt ${i + 1}:`, error);
      throw error;
    }
  }

  console.error("[pollSessionUntilReady] Max attempts reached!");
  throw new Error("Session exploration timeout");
}

/**
 * Create a new chat
 */
export async function createChat(
  sessionId: string,
  title?: string
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: sessionId,
      title: title || "New Chat",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create chat: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get all chats for a session
 */
export async function getChats(sessionId: string): Promise<ChatResponse[]> {
  const response = await fetch(`${API_BASE_URL}/chats/${sessionId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch chats: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new message
 */
export async function createMessage(
  chatId: string,
  role: "user" | "assistant",
  content: any
): Promise<MessageResponse> {
  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      role,
      content,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create message: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get all messages for a chat
 */
export async function getMessages(chatId: string): Promise<MessageResponse[]> {
  const response = await fetch(`${API_BASE_URL}/messages/${chatId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Stream chat response via Server-Sent Events (Next.js API Route)
 * Yields events as they arrive from the Bytez-powered multi-agent system
 */
export async function* chatStream(
  chatId: string,
  sessionId: string,
  message: string,
  history: any[] = []
): AsyncGenerator<any> {
  console.log("🚀 [chatStream] Initiating SSE stream to Next.js API...");
  console.log("📍 [chatStream] Endpoint: /api/chat/stream");
  console.log("📦 [chatStream] Payload:", { chatId, sessionId, messageLength: message.length });

  const response = await fetch(`/api/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      session_id: sessionId,
      message,
      history,
    }),
  });

  console.log("📡 [chatStream] Response received:", response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ [chatStream] HTTP Error:", response.status, errorText);
    throw new Error(`Chat stream failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("✅ [chatStream] Stream completed");
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            console.log("🏁 [chatStream] Received [DONE] signal");
            continue;
          }

          try {
            const event = JSON.parse(data);
            console.log("📨 [chatStream] Event received:", event.type);
            yield event;
          } catch (e) {
            console.error("⚠️ [chatStream] Failed to parse SSE event:", e, "Line:", line);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
