/**
 * API Route: /api/chat/stream
 * Handles multi-agent chat orchestration with SSE streaming
 * This is the endpoint the frontend calls
 */

import { NextRequest, NextResponse } from 'next/server';
import { AssemblyLineOrchestrator, type ChatMessage } from '@/lib/agents/orchestrator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequest {
  session_id: string;
  chat_id: string;
  message: string;
  history?: Array<{ role: string; content: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { session_id, chat_id, message, history = [] } = body;

    if (!session_id || !chat_id || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: session_id, chat_id, message' },
        { status: 400 }
      );
    }

    // Convert history to ChatMessage format
    const conversationHistory: ChatMessage[] = history.map((h) => ({
      role: (h.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: h.content,
    }));

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('🎬 [/api/chat/stream] Starting orchestration...');
          console.log('📦 [/api/chat/stream] Params:', { session_id, chat_id, messageLength: message.length });

          const orchestrator = new AssemblyLineOrchestrator(chat_id);

          // Stream events from orchestrator
          for await (const event of orchestrator.orchestrateStream({
            sessionId: session_id,
            chatId: chat_id,
            userMessage: message,
            conversationHistory,
          })) {
            // Forward events from orchestrator as SSE
            if (event && event.type) {
              console.log('📤 [/api/chat/stream] Sending event:', event.type);
              const sseData = `data: ${JSON.stringify(event)}\n\n`;
              controller.enqueue(encoder.encode(sseData));
            }
          }

          // Send completion signal
          console.log('✅ [/api/chat/stream] Orchestration complete');
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('❌ [/api/chat/stream] Orchestration error:', error);
          console.error('📋 [/api/chat/stream] Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : 'No stack trace',
            cause: error instanceof Error ? error.cause : undefined
          });

          const errorEvent = {
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            details: error instanceof Error ? error.stack : String(error)
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[/api/chat/stream] Request parsing error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
