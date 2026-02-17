/**
 * API Route: /api/agents/context
 * Handles context agent analysis for dataset insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { AgentRunner } from '@/lib/agents/orchestrator';
import { ToolExecutor } from '@/lib/agents/tool-executor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ContextRequest {
  sessionId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContextRequest = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required field: sessionId' },
        { status: 400 }
      );
    }

    // Create tool executor and load data DNA
    const toolExecutor = new ToolExecutor(sessionId);
    await toolExecutor.loadDataDNA();

    // Run context agent
    const agentRunner = new AgentRunner();
    const result = await agentRunner.runAgent({
      agentId: 'context_agent',
      userMessage: 'Analyze this dataset and provide context insights about its purpose, domain, use cases, and business value.',
      toolExecutor,
    });

    // Parse the response
    let contextData;
    try {
      contextData = JSON.parse(result.content);
    } catch (e) {
      console.error('Failed to parse context agent response:', e);
      // Try to extract JSON from markdown code blocks
      const jsonMatch = result.content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        try {
          contextData = JSON.parse(jsonMatch[1]);
        } catch (e2) {
          throw new Error('Invalid context response format');
        }
      } else {
        throw new Error('Could not parse context response');
      }
    }

    return NextResponse.json({
      success: true,
      response: contextData,
    });
  } catch (error) {
    console.error('[API] Context agent error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze context',
      },
      { status: 500 }
    );
  }
}
