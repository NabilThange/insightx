/**
 * API Health Monitoring
 * Provides diagnostics and health metrics for API key rotation system
 */

import { getKeyManager } from './key-manager';

export interface APIHealthMetrics {
  totalKeys: number;
  healthyKeys: number;
  currentKeyIndex: number;
  metrics: Record<string, {
    usageCount: number;
    errorCount: number;
    status: 'healthy' | 'degraded' | 'failed';
    lastError?: Date | string;
  }>;
}

/**
 * Log detailed API health report to console
 */
export function logAPIHealth(): void {
  try {
    const km = getKeyManager();
    const metrics = km.getMetrics();
    const currentIndex = km.getCurrentKeyIndex();

    console.log('\n📊 API Health Report');
    console.log('='.repeat(50));

    let healthyCount = 0;

    Object.entries(metrics).forEach(([key, metric], index) => {
      const icon = metric.status === 'healthy' ? '✅' : 
                   metric.status === 'degraded' ? '⚠️' : '❌';
      const current = index === currentIndex ? ' (CURRENT)' : '';
      const errorInfo = metric.lastError ? ` - Last error: ${metric.lastError}` : '';

      console.log(
        `${icon} Key #${index + 1}${current}: ${metric.usageCount} calls, ${metric.errorCount} errors${errorInfo}`
      );

      if (metric.status === 'healthy') healthyCount++;
    });

    const totalKeys = Object.keys(metrics).length;
    const healthPercentage = totalKeys > 0 ? Math.round((healthyCount / totalKeys) * 100) : 0;

    console.log(`\n🔑 API Keys: ${healthyCount}/${totalKeys} healthy (${healthPercentage}%)`);
    console.log(`📍 Current Key: #${currentIndex + 1}`);
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('[APIHealth] Failed to log health report:', error);
  }
}

/**
 * Get API health metrics as structured data
 */
export function getAPIHealthMetrics(): APIHealthMetrics {
  try {
    const km = getKeyManager();
    const metrics = km.getMetrics();
    const currentIndex = km.getCurrentKeyIndex();

    const healthyKeys = Object.values(metrics).filter(
      m => m.status === 'healthy'
    ).length;

    return {
      totalKeys: km.getKeyCount(),
      healthyKeys,
      currentKeyIndex: currentIndex,
      metrics
    };

  } catch (error) {
    console.error('[APIHealth] Failed to get health metrics:', error);
    return {
      totalKeys: 0,
      healthyKeys: 0,
      currentKeyIndex: 0,
      metrics: {}
    };
  }
}

/**
 * Check if API system is healthy (at least one key available)
 */
export function isAPIHealthy(): boolean {
  try {
    const metrics = getAPIHealthMetrics();
    return metrics.healthyKeys > 0;
  } catch (error) {
    console.error('[APIHealth] Failed to check API health:', error);
    return false;
  }
}

/**
 * Get health status as string
 */
export function getHealthStatus(): 'healthy' | 'degraded' | 'critical' {
  try {
    const metrics = getAPIHealthMetrics();
    
    if (metrics.healthyKeys === 0) {
      return 'critical';
    }
    
    if (metrics.healthyKeys < metrics.totalKeys / 2) {
      return 'degraded';
    }
    
    return 'healthy';

  } catch (error) {
    console.error('[APIHealth] Failed to get health status:', error);
    return 'critical';
  }
}

/**
 * Get a human-readable health summary
 */
export function getHealthSummary(): string {
  try {
    const metrics = getAPIHealthMetrics();
    const status = getHealthStatus();

    const statusEmoji = status === 'healthy' ? '✅' : 
                       status === 'degraded' ? '⚠️' : '❌';

    return `${statusEmoji} ${status.toUpperCase()}: ${metrics.healthyKeys}/${metrics.totalKeys} keys available`;

  } catch (error) {
    console.error('[APIHealth] Failed to get health summary:', error);
    return '❌ UNKNOWN: Unable to determine API health';
  }
}

/**
 * Log a warning if API health is degraded
 */
export function checkAndWarnIfUnhealthy(): void {
  const status = getHealthStatus();
  
  if (status === 'critical') {
    console.error('🚨 CRITICAL: All API keys exhausted! Please add credits or new keys.');
  } else if (status === 'degraded') {
    console.warn('⚠️ WARNING: API key pool is degraded. Some keys are unavailable.');
  }
}

/**
 * Export health metrics for monitoring/logging services
 */
export function exportHealthMetrics(): string {
  try {
    const metrics = getAPIHealthMetrics();
    return JSON.stringify(metrics, null, 2);
  } catch (error) {
    console.error('[APIHealth] Failed to export health metrics:', error);
    return '{}';
  }
}
