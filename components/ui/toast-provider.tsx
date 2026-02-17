'use client';

/**
 * Toast Provider Component
 * Displays toast notifications for agent system events
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toastManager } from '@/lib/agents/toast-notifications';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description: string;
  duration: number;
}

interface ToastContextValue {
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextValue>({ toasts: [] });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((newToasts) => {
      setToasts(newToasts);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    toastManager.remove(id);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts }}>
      {children}
      <div className="fixed top-20 right-4 flex flex-col gap-2" style={{ zIndex: 9999, width: '400px' }}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: 'text-green-900',
    error: 'text-red-900',
    warning: 'text-yellow-900',
    info: 'text-blue-900',
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div
      className={`${bgColors[toast.type]} ${textColors[toast.type]} border rounded-lg p-4 shadow-lg animate-slide-in-right w-full`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{icons[toast.type]}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm break-words">{toast.title}</h4>
          <p className="text-xs mt-1 opacity-90 break-words">{toast.description}</p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function useToasts() {
  return useContext(ToastContext);
}
