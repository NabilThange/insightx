"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Collapsible } from "radix-ui";
import { Brain, ChevronDown, ChevronUp } from "lucide-react";

// ─── Context ────────────────────────────────────────────────────────────────

interface ReasoningContextValue {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration?: number;
}

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

export function useReasoning(): ReasoningContextValue {
  const ctx = useContext(ReasoningContext);
  if (!ctx) throw new Error("useReasoning must be used inside <Reasoning>");
  return ctx;
}

// ─── Root: <Reasoning> ──────────────────────────────────────────────────────

interface ReasoningProps {
  /** Whether the model is still streaming reasoning tokens */
  isStreaming?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Uncontrolled initial open state */
  defaultOpen?: boolean;
  /** Callback when toggled */
  onOpenChange?: (open: boolean) => void;
  /** Duration in ms shown after reasoning completes */
  duration?: number;
  className?: string;
  children: ReactNode;
}

export function Reasoning({
  isStreaming = false,
  open,
  defaultOpen,
  onOpenChange,
  duration,
  className = "",
  children,
}: ReasoningProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? isStreaming);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open! : internalOpen;

  const setIsOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  // Auto-open while streaming, auto-close when done
  useEffect(() => {
    if (isStreaming) {
      setIsOpen(true);
    } else {
      const t = setTimeout(() => setIsOpen(false), 600);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming]);

  return (
    <ReasoningContext.Provider value={{ isStreaming, isOpen, setIsOpen, duration }}>
      <Collapsible.Root
        open={isOpen}
        onOpenChange={setIsOpen}
        style={{
          width: "100%",
          border: "1px solid var(--stroke)",
          borderRadius: "6px",
          background: "var(--bg)",
          overflow: "hidden",
        }}
        className={className}
      >
        {children}
      </Collapsible.Root>
    </ReasoningContext.Provider>
  );
}

// ─── Trigger: <ReasoningTrigger> ────────────────────────────────────────────

interface ReasoningTriggerProps {
  getThinkingMessage?: (isStreaming: boolean, duration?: number) => ReactNode;
  className?: string;
}

export function ReasoningTrigger({
  getThinkingMessage,
  className = "",
}: ReasoningTriggerProps) {
  const { isStreaming, isOpen, duration } = useReasoning();

  const label = getThinkingMessage
    ? getThinkingMessage(isStreaming, duration)
    : isStreaming
      ? "Thinking…"
      : duration !== undefined
        ? `Thought for ${(duration / 1000).toFixed(1)}s`
        : "View reasoning";

  return (
    <>
      <Collapsible.Trigger className={`reasoning-trigger ${isOpen ? "open" : ""} ${className}`}>
        <span className={`reasoning-dot ${isStreaming ? "pulsing" : "done"}`} />
        <Brain size={13} className="reasoning-brain-icon" />
        <span className="reasoning-label">{label}</span>
        <span className="reasoning-chevron">
          {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </Collapsible.Trigger>

      <style jsx global>{`
        .reasoning-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.625rem 0.875rem;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: "PP Neue Montreal", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 0.8125rem;
          font-weight: 500;
          color: rgba(31, 31, 31, 0.6);
          text-align: left;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .reasoning-trigger:hover {
          background: rgba(0, 0, 0, 0.025);
          color: var(--fg);
        }

        .reasoning-trigger.open {
          border-bottom: 1px solid var(--stroke);
          color: var(--fg);
        }

        .reasoning-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .reasoning-dot.pulsing {
          background: #4f46e5;
          animation: reasoning-pulse 1.2s ease-in-out infinite;
        }

        .reasoning-dot.done {
          background: rgba(31, 31, 31, 0.22);
        }

        @keyframes reasoning-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.7); }
        }

        .reasoning-brain-icon {
          flex-shrink: 0;
          opacity: 0.5;
        }

        .reasoning-label {
          flex: 1;
          letter-spacing: 0.01em;
        }

        .reasoning-chevron {
          flex-shrink: 0;
          opacity: 0.4;
          display: flex;
          align-items: center;
        }
      `}</style>
    </>
  );
}

// ─── Content: <ReasoningContent> ────────────────────────────────────────────

interface ReasoningContentProps {
  children: string | string[];
  className?: string;
}

export function ReasoningContent({
  children,
  className = "",
}: ReasoningContentProps) {
  const { isStreaming } = useReasoning();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom while streaming
  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [children, isStreaming]);

  return (
    <>
      <Collapsible.Content className={`reasoning-content-wrapper ${className}`}>
        <div className="reasoning-scroll" ref={scrollRef}>
          {Array.isArray(children) ? (
            <ul className="reasoning-steps">
              {(children as string[]).map((step, i) => (
                <li key={i} className="reasoning-step">
                  <span className="step-index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="step-text">{step}</span>
                </li>
              ))}
              {isStreaming && <span className="reasoning-cursor" aria-hidden />}
            </ul>
          ) : (
            <div className="reasoning-text-block">
              <pre className="reasoning-text">{children as string}</pre>
              {isStreaming && <span className="reasoning-cursor" aria-hidden />}
            </div>
          )}
        </div>
      </Collapsible.Content>

      <style jsx global>{`
        .reasoning-content-wrapper {
          overflow: hidden;
        }

        .reasoning-content-wrapper[data-state="open"] {
          animation: reasoning-open 0.2s ease-out;
        }

        .reasoning-content-wrapper[data-state="closed"] {
          animation: reasoning-close 0.15s ease-in;
        }

        @keyframes reasoning-open {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes reasoning-close {
          from { opacity: 1; }
          to   { opacity: 0; }
        }

        .reasoning-scroll {
          padding: 0.875rem;
          max-height: 260px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--stroke) transparent;
        }

        .reasoning-scroll::-webkit-scrollbar { width: 3px; }
        .reasoning-scroll::-webkit-scrollbar-thumb {
          background: var(--stroke);
          border-radius: 2px;
        }

        /* Step list */
        .reasoning-steps {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .reasoning-step {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          font-size: 0.8125rem;
          line-height: 1.55;
          color: rgba(31, 31, 31, 0.65);
          padding: 0.3125rem 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.045);
        }

        .reasoning-step:last-child { border-bottom: none; }

        .step-index {
          font-size: 0.6875rem;
          font-weight: 600;
          color: rgba(31, 31, 31, 0.28);
          letter-spacing: 0.04em;
          flex-shrink: 0;
          padding-top: 0.1em;
          font-variant-numeric: tabular-nums;
          min-width: 1.5rem;
        }

        .step-text { flex: 1; }

        /* Raw text */
        .reasoning-text-block { position: relative; }

        .reasoning-text {
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: 0.75rem;
          line-height: 1.65;
          color: rgba(31, 31, 31, 0.6);
          white-space: pre-wrap;
          word-break: break-word;
          margin: 0;
          padding: 0;
        }

        /* Blinking cursor */
        .reasoning-cursor {
          display: inline-block;
          width: 2px;
          height: 0.85em;
          background: #4f46e5;
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: reasoning-blink 0.75s step-end infinite;
        }

        @keyframes reasoning-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </>
  );
}
