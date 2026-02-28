/**
 * KeyManager - Handles multiple Bytez API keys with automatic rotation
 * Based on OHM's key management pattern
 */

import {
  showKeyFailureToast,
  showAllKeysExhaustedToast,
  showKeyRotationSuccessToast,
} from './toast-notifications';

interface KeyMetrics {
  usageCount: number;
  errorCount: number;
  lastUsed: Date | null;
  lastError: Date | null;
  status: 'healthy' | 'failed';
  failureReason?: string;
}

interface RotationEvent {
  timestamp: Date;
  fromKey: string;
  toKey: string;
  reason: string;
}

export class KeyManager {
  private keys: string[] = [];
  private currentIndex: number = 0;
  private metrics: Map<string, KeyMetrics> = new Map();
  private lastEvent: RotationEvent | null = null;

  constructor() {
    this.loadKeys();
    this.initializeMetrics();
  }

  /**
   * Load keys from environment variables
   * Supports both numbered format (BYTEZ_API_KEY_1, BYTEZ_API_KEY_2, ...)
   * and legacy formats
   */
  private loadKeys(): void {
    const keys: string[] = [];

    // Try numbered keys first (BYTEZ_API_KEY_1, BYTEZ_API_KEY_2, ...)
    let i = 1;
    while (true) {
      const key =
        process.env[`BYTEZ_API_KEY_${i}`] ||
        process.env[`NEXT_PUBLIC_BYTEZ_API_KEY_${i}`];

      if (!key) break;
      keys.push(key);
      i++;
    }

    // Fall back to legacy formats if no numbered keys
    if (keys.length === 0) {
      // Try comma-separated format
      const commaSeparated = process.env.BYTEZ_API_KEYS || process.env.NEXT_PUBLIC_BYTEZ_API_KEYS;
      if (commaSeparated) {
        keys.push(...commaSeparated.split(',').map(k => k.trim()).filter(Boolean));
      } else {
        // Try single key
        const singleKey = process.env.BYTEZ_API_KEY || process.env.NEXT_PUBLIC_BYTEZ_API_KEY;
        if (singleKey) {
          keys.push(singleKey);
        }
      }
    }

    if (keys.length === 0) {
      console.warn('[KeyManager] No Bytez API keys found in environment variables. API calls will fail until keys are configured.');
    } else {
      console.log(`[KeyManager] Loaded ${keys.length} API key(s)`);
    }

    this.keys = keys;
  }

  private initializeMetrics(): void {
    for (const key of this.keys) {
      this.metrics.set(this.maskKey(key), {
        usageCount: 0,
        errorCount: 0,
        lastUsed: null,
        lastError: null,
        status: 'healthy',
      });
    }
  }

  /**
   * Get current active key
   */
  getCurrentKey(): string {
    if (this.keys.length === 0) {
      throw new Error('No Bytez API keys found in environment variables. Please configure BYTEZ_API_KEY or BYTEZ_API_KEY_1.');
    }
    const key = this.keys[this.currentIndex];
    const metrics = this.metrics.get(this.maskKey(key));

    if (metrics?.status === 'failed') {
      // Auto-rotate to next healthy key instead of throwing error
      console.warn('[KeyManager] Current key is failed, attempting auto-rotation...');
      const rotated = this.rotateKey();
      if (!rotated) {
        throw new Error('All API keys exhausted. Please check your Bytez API keys or wait for rate limits to reset.');
      }
      // Return the newly rotated key
      return this.keys[this.currentIndex];
    }

    return key;
  }

  /**
   * Get index of current key (for logging)
   */
  getCurrentKeyIndex(): number {
    return this.currentIndex;
  }

  /**
   * Mark current key as failed
   */
  markCurrentKeyAsFailed(reason: string): void {
    const key = this.keys[this.currentIndex];
    const maskedKey = this.maskKey(key);
    const metrics = this.metrics.get(maskedKey);

    if (metrics) {
      metrics.status = 'failed';
      metrics.errorCount++;
      metrics.lastError = new Date();
      metrics.failureReason = reason;
    }

    console.error(`[KeyManager] Key #${this.currentIndex + 1} marked as failed: ${reason}`);

    // Show toast notification to user
    if (typeof window !== 'undefined') {
      showKeyFailureToast(this.currentIndex, this.keys.length, reason);
    }
  }

  /**
   * Rotate to next available healthy key
   * Returns true if rotation succeeded, false if all keys exhausted
   */
  rotateKey(): boolean {
    const startIndex = this.currentIndex;
    const fromKey = this.maskKey(this.keys[this.currentIndex]);

    // Try all keys
    for (let i = 0; i < this.keys.length; i++) {
      const nextIndex = (this.currentIndex + 1) % this.keys.length;
      const nextKey = this.keys[nextIndex];
      const metrics = this.metrics.get(this.maskKey(nextKey));

      if (metrics?.status === 'healthy') {
        this.currentIndex = nextIndex;

        // Record rotation event
        this.lastEvent = {
          timestamp: new Date(),
          fromKey,
          toKey: this.maskKey(nextKey),
          reason: 'Key rotation due to failure',
        };

        console.log(`[KeyManager] Rotated to key #${this.currentIndex + 1}`);

        // Show success toast
        if (typeof window !== 'undefined') {
          showKeyRotationSuccessToast(this.currentIndex);
        }

        return true;
      }

      this.currentIndex = nextIndex;
    }

    // All keys exhausted
    console.error('[KeyManager] All API keys exhausted');

    // Show critical error toast
    if (typeof window !== 'undefined') {
      showAllKeysExhaustedToast(this.keys.length);
    }

    return false;
  }

  /**
   * Record successful usage of current key
   */
  recordSuccess(): void {
    const key = this.keys[this.currentIndex];
    const metrics = this.metrics.get(this.maskKey(key));

    if (metrics) {
      metrics.usageCount++;
      metrics.lastUsed = new Date();
    }
  }

  /**
   * Get and clear last rotation event (read-once)
   */
  getAndClearLastEvent(): RotationEvent | null {
    const event = this.lastEvent;
    this.lastEvent = null;
    return event;
  }

  /**
   * Get metrics for all keys
   */
  getMetrics(): Record<string, KeyMetrics> {
    const result: Record<string, KeyMetrics> = {};
    for (const [key, metrics] of this.metrics.entries()) {
      result[key] = { ...metrics };
    }
    return result;
  }

  /**
   * Get total number of keys
   */
  getKeyCount(): number {
    return this.keys.length;
  }

  /**
   * Reset all keys to healthy status (useful for recovery after rate limit cooldown)
   */
  resetAllKeys(): void {
    for (const [key, metrics] of this.metrics.entries()) {
      metrics.status = 'healthy';
      metrics.failureReason = undefined;
    }
    console.log('[KeyManager] All keys reset to healthy status');
  }

  /**
   * Mask key for logging (show first 8 and last 4 chars)
   */
  private maskKey(key: string): string {
    if (key.length < 16) return '***';
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  }
}

// Singleton instance
let keyManager: KeyManager | null = null;

export function getKeyManager(): KeyManager {
  if (!keyManager) {
    keyManager = new KeyManager();
  }
  return keyManager;
}
