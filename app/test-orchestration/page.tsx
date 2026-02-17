'use client';

/**
 * Test Page for Orchestration System
 * Allows testing the multi-agent workflow without full UI
 */

import { useState } from 'react';
import { toastManager } from '@/lib/agents/toast-notifications';

export default function TestOrchestrationPage() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testQueries = [
    "What's the average transaction amount?",
    "Write a Python code to find the highest selling category",
    "Which states are statistical outliers for failure rate?",
    "Show me transactions over $1000",
  ];

  const handleSubmit = async (query: string) => {
    setMessage(query);
    setResponse(null);
    setEvents([]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: 'test-session-' + Date.now(),
          chat_id: 'test-chat-' + Date.now(),
          message: query,
          history: [],
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setLoading(false);
              continue;
            }

            try {
              const event = JSON.parse(data);
              setEvents((prev) => [...prev, event]);

              // Trigger toast notifications for toast events
              if (event.type === 'toast') {
                toastManager.show(
                  'info',
                  event.message,
                  event.data?.reasoning || '',
                  5000
                );
              }

              if (event.type === 'final_response') {
                setResponse(event.data);
              }
            } catch (e) {
              console.error('Failed to parse event:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setEvents((prev) => [
        ...prev,
        { type: 'error', message: error instanceof Error ? error.message : 'Unknown error' },
      ]);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Orchestration System Test</h1>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Queries</h2>
          <div className="grid grid-cols-1 gap-2">
            {testQueries.map((query, i) => (
              <button
                key={i}
                onClick={() => handleSubmit(query)}
                disabled={loading}
                className="btn-secondary text-left"
              >
                {query}
              </button>
            ))}
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Custom Query</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSubmit(message)}
              placeholder="Enter your query..."
              className="input flex-1"
              disabled={loading}
            />
            <button
              onClick={() => handleSubmit(message)}
              disabled={loading || !message}
              className="btn-primary"
            >
              {loading ? 'Processing...' : 'Send'}
            </button>
          </div>
        </div>

        {events.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Events Stream</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.map((event, i) => (
                <div key={i} className="code-block text-xs">
                  <div className="font-semibold text-[var(--accent)]">{event.type}</div>
                  <pre className="mt-1 text-[var(--text-muted)]">
                    {JSON.stringify(event, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {response && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Final Response</h2>
            <div className="prose">
              <p className="text-[var(--fg)]">{response.text}</p>
              {response.classification && (
                <div className="mt-4">
                  <span className="badge badge-info">{response.classification}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
