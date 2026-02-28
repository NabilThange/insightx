import { NextRequest, NextResponse } from 'next/server';
import { getKeyManager } from '@/lib/agents/key-manager';

/**
 * Admin endpoint to reset all API keys to healthy status
 * Useful after rate limit cooldown periods
 */
export async function POST(request: NextRequest) {
  try {
    const keyManager = getKeyManager();
    keyManager.resetAllKeys();
    
    return NextResponse.json({
      success: true,
      message: 'All API keys reset to healthy status',
      keyCount: keyManager.getKeyCount()
    });
  } catch (error: any) {
    console.error('[Admin] Failed to reset keys:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get current key manager status
 */
export async function GET(request: NextRequest) {
  try {
    const keyManager = getKeyManager();
    const metrics = keyManager.getMetrics();
    
    return NextResponse.json({
      success: true,
      currentKeyIndex: keyManager.getCurrentKeyIndex(),
      totalKeys: keyManager.getKeyCount(),
      metrics
    });
  } catch (error: any) {
    console.error('[Admin] Failed to get key status:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
