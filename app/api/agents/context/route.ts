/**
 * API Route: /api/agents/context
 * Handles context agent analysis for dataset insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { AgentRunner } from '@/lib/agents/orchestrator';
import { ToolExecutor } from '@/lib/agents/tool-executor';
import { WorkspaceSidebarService } from '@/lib/db/sidebar';

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

    // Check if context already exists (avoid infinite loops and API key burnout)
    console.log('🔍 [Context API] Checking if context already exists for session:', sessionId);
    const existingSidebar = await WorkspaceSidebarService.getSidebar(sessionId);
    
    if (existingSidebar?.context_analysis) {
      console.log('✅ [Context API] Context already exists, returning cached data');
      return NextResponse.json({
        success: true,
        cached: true,
        response: existingSidebar.context_analysis,
      });
    }

    console.log('🚀 [Context API] No existing context found, running context agent...');

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
      let cleanedContent = result.content.trim();
      
      // Extract ONLY what's inside ```json ... ``` block, ignoring any preamble text
      const jsonMatch = cleanedContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanedContent = jsonMatch[1].trim();
        console.log('🧹 [Context API] Extracted JSON from code fence (ignoring preamble)');
      } else {
        // Try without the 'json' specifier
        const genericMatch = cleanedContent.match(/```\s*([\s\S]*?)\s*```/);
        if (genericMatch) {
          cleanedContent = genericMatch[1].trim();
          console.log('🧹 [Context API] Extracted content from generic code fence');
        }
      }
      
      contextData = JSON.parse(cleanedContent);
      console.log('✅ [Context API] Successfully parsed context data');
    } catch (e) {
      console.error('❌ [Context API] Failed to parse context agent response:', {
        error: e instanceof Error ? e.message : String(e),
        rawContent: result.content.substring(0, 200) + '...',
      });
      throw new Error('Could not parse context response as valid JSON');
    }

    // Save to workspace_sidebar table
    try {
      console.log('💾 [Context API] Saving context data to workspace_sidebar:', {
        sessionId,
        dataKeys: Object.keys(contextData),
        dataPreview: JSON.stringify(contextData).substring(0, 100) + '...',
      });
      
      await WorkspaceSidebarService.updateContextAnalysis(sessionId, contextData);
      console.log('✅ [Context API] Context analysis saved and verified in workspace_sidebar');
    } catch (dbError) {
      console.error('❌ [Context API] Failed to save context to database:', {
        error: dbError instanceof Error ? dbError.message : String(dbError),
        stack: dbError instanceof Error ? dbError.stack : undefined,
      });
      // Don't continue - this is a critical error
      throw new Error(`Failed to save context analysis: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
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
