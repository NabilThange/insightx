'use client';

/**
 * Toast Notifications for Agent System
 * Provides real-time user feedback for key rotation, agent changes, and tool calls
 */

// Simple toast implementation without external dependencies
// You can replace this with your preferred toast library later

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description: string;
  duration: number;
}

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: Set<(toasts: Toast[]) => void> = new Set();

  show(type: ToastType, title: string, description: string, duration: number = 5000) {
    if (typeof window === 'undefined') return;

    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, type, title, description, duration };
    
    this.toasts.push(toast);
    this.notifyListeners();

    // Log to console for debugging
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${icon} [Toast] ${title}: ${description}`);

    if (duration !== Infinity) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notifyListeners();
  }

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }
}

const toastManager = new ToastManager();

export function showKeyFailureToast(keyIndex: number, totalKeys: number, error: string) {
  if (typeof window === 'undefined') return;

  const remainingKeys = totalKeys - keyIndex - 1;
  toastManager.show(
    'warning',
    '🔄 API Key Rotation',
    `Key #${keyIndex + 1} exhausted. Switching to backup... (${remainingKeys} backup${remainingKeys !== 1 ? 's' : ''} available)`,
    5000
  );
}

export function showAllKeysExhaustedToast(totalKeys: number) {
  if (typeof window === 'undefined') return;

  toastManager.show(
    'error',
    '❌ All API Keys Exhausted',
    `All ${totalKeys} API keys have run out of credits. Please add credits or new keys.`,
    Infinity
  );
}

export function showKeyRotationSuccessToast(newKeyIndex: number) {
  if (typeof window === 'undefined') return;

  toastManager.show(
    'success',
    '✅ API Key Rotated Successfully',
    `Now using backup key #${newKeyIndex + 1}. Continuing your request...`,
    5000
  );
}

export function showAgentChangeToast(agentId: string) {
  if (typeof window === 'undefined') return;

  const { getAgentIdentity } = require('./agent-identities');
  const identity = getAgentIdentity(agentId);

  toastManager.show(
    'success',
    'Agent Active',
    `${identity.icon} ${identity.name} is now handling your request.`,
    4000
  );
}

const TOOL_DISPLAY_NAMES: Record<string, { name: string; icon: string }> = {
  read_data_dna: { name: 'Data DNA Read', icon: '📖' },
  run_sql: { name: 'SQL Query Executed', icon: '📊' },
  run_python: { name: 'Python Analysis Run', icon: '🐍' },
  read_context: { name: 'Context Retrieved', icon: '🔍' },
  write_context: { name: 'Insight Saved', icon: '💾' },
};

export function showToolCallToast(toolName: string) {
  if (typeof window === 'undefined') return;

  const display = TOOL_DISPLAY_NAMES[toolName] || { name: toolName, icon: '⚙️' };

  toastManager.show(
    'info',
    `Tool: ${toolName}`,
    `${display.icon} ${display.name}`,
    3000
  );
}

export function showErrorToast(title: string, description: string) {
  if (typeof window === 'undefined') return;

  toastManager.show('error', title, description, 7000);
}

export function showSuccessToast(title: string, description: string) {
  if (typeof window === 'undefined') return;

  toastManager.show('success', title, description, 5000);
}

export function showInfoToast(title: string, description: string) {
  if (typeof window === 'undefined') return;

  toastManager.show('info', title, description, 5000);
}

export { toastManager };
