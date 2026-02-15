/**
 * API Route: /api/agents/chat
 * Handles multi-agent chat orchestration with SSE streaming
 */

import { NextRequest, NextResponse } from 'next/server';
import { AssemblyLineOrchestrator } from '@/lib/agents/orchestrator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequest {
  session_id: string;
  chat_id: string;
  message: string;
  history?: any[];
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

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const orchestrator = new AssemblyLineOrchestrator();

          // Stream events from orchestrator
          for await (const event of orchestrator.orchestrateStream({
            sessionId: session_id,
            chatId: chat_id,
            userMessage: message,
            conversationHistory: history,
          })) {
            // Send SSE formatted data
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          // Send completion signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('[API] Chat orchestration error:', error);
          
          const errorEvent = {
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
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
    console.error('[API] Request parsing error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
