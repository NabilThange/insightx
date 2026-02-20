"use client";

/**
 * ChatInput — Enhanced chat input for InsightX
 *
 * Extends the original simple textarea+send with the full PromptInput system:
 *   - Auto-resizing textarea
 *   - File attachment support (drag & drop + file picker)
 *   - Model selector dropdown
 *   - Web search toggle
 *   - Submit button with streaming/loading state
 *   - Keyboard shortcuts (Enter = submit, Shift+Enter = newline)
 *
 * Backward-compatible: the `onSend` prop still works as before.
 *
 * Design System: DESIGN_SYSTEM.md
 */

import { useState } from "react";
import { GlobeIcon } from "lucide-react";

import {
  PromptInput,
  PromptInputHeader,
  PromptInputBody,
  PromptInputFooter,
  PromptInputTools,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputButton,
  PromptInputSelect,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  usePromptInputAttachments,
  type PromptInputMessage,
  type ChatStatus,
} from "@/components/ai-elements/prompt-input";

import {
  Attachments,
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
} from "@/components/ai-elements/attachments";

// ─── Model list ───────────────────────────────────────────────────────────────

const MODELS = [
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "claude-opus-4-20250514", name: "Claude 4 Opus" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
];

// ─── Attachment strip (reads from context) ────────────────────────────────────

function AttachmentsDisplay() {
  const attachments = usePromptInputAttachments();
  if (attachments.files.length === 0) return null;

  return (
    <Attachments variant="inline">
      {attachments.files.map((file) => (
        <Attachment
          key={file.id}
          data={file}
          onRemove={() => attachments.remove(file.id)}
        >
          <AttachmentPreview />
          {/* Show truncated name */}
          <span
            style={{
              fontSize: "0.75rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "7rem",
            }}
            title={file.file.name}
          >
            {file.file.name.length > 16
              ? file.file.name.slice(0, 13) + "…"
              : file.file.name}
          </span>
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChatInputProps {
  /** Legacy prop — called with the text string when the user submits */
  onSend?: (message: string) => void;
  /** Full message callback (text + files). Takes priority over onSend. */
  onSubmit?: (message: PromptInputMessage) => void;
  disabled?: boolean;
  status?: ChatStatus;
  placeholder?: string;
  /** Allow file attachments */
  allowAttachments?: boolean;
  /** Allow model selection */
  allowModelSelect?: boolean;
  /** Allow web search toggle */
  allowWebSearch?: boolean;
  /** Show drag-and-drop support */
  globalDrop?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatInput({
  onSend,
  onSubmit,
  disabled = false,
  status = "idle",
  placeholder = "Ask InsightX anything…",
  allowAttachments = true,
  allowModelSelect = true,
  allowWebSearch = true,
  globalDrop = true,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [model, setModel] = useState(MODELS[0].id);
  const [webSearch, setWebSearch] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim() && !message.files?.length) return;

    // Call the appropriate callback
    if (onSubmit) {
      onSubmit(message);
    } else if (onSend && message.text) {
      onSend(message.text);
    }

    setText("");
  };

  const isDisabled =
    disabled || (status !== "idle" && status !== "ready" && status !== "error");

  return (
    <PromptInput
      onSubmit={handleSubmit}
      globalDrop={globalDrop && allowAttachments}
      multiple
      status={status}
      style={{
        margin: "0",
        background: "var(--bg)",
        border: isFocused
          ? "1px solid var(--accent, #4f46e5)"
          : "1px solid var(--stroke, rgba(0,0,0,0.2))",
        boxShadow: isFocused
          ? "0 0 0 3px rgba(79, 70, 229, 0.08), 0 4px 16px rgba(0,0,0,0.06)"
          : "0 2px 8px rgba(0,0,0,0.05)",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Attachment strip */}
      {allowAttachments && (
        <PromptInputHeader>
          <AttachmentsDisplay />
        </PromptInputHeader>
      )}

      {/* Main textarea */}
      <PromptInputBody>
        <PromptInputTextarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={isDisabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            fontFamily: "'PP Neue Montreal', system-ui, sans-serif",
          }}
        />
      </PromptInputBody>

      {/* Footer toolbar */}
      <PromptInputFooter>
        <PromptInputTools>
          {/* Attachment menu */}
          {allowAttachments && (
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
          )}

          {/* Web search toggle */}
          {allowWebSearch && (
            <PromptInputButton
              onClick={() => setWebSearch(!webSearch)}
              tooltip={{ content: "Search the web", shortcut: "⌘K" }}
              variant={webSearch ? "default" : "ghost"}
              active={webSearch}
              aria-pressed={webSearch}
              style={{
                border: webSearch ? "1px solid var(--accent, #4f46e5)" : "1px solid rgba(0, 0, 0, 0.12)",
                background: webSearch ? "rgba(79, 70, 229, 0.1)" : "transparent",
                transition: "all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)",
              }}
            >
              <GlobeIcon size={14} />
              <span>Search</span>
            </PromptInputButton>
          )}

          {/* Model selector */}
          {allowModelSelect && (
            <PromptInputSelect value={model} onValueChange={setModel}>
              <PromptInputSelectTrigger>
                <PromptInputSelectValue />
              </PromptInputSelectTrigger>
              <PromptInputSelectContent>
                {MODELS.map((m) => (
                  <PromptInputSelectItem key={m.id} value={m.id}>
                    {m.name}
                  </PromptInputSelectItem>
                ))}
              </PromptInputSelectContent>
            </PromptInputSelect>
          )}
        </PromptInputTools>

        {/* Submit / stop button */}
        <PromptInputSubmit
          status={status}
          disabled={isDisabled || (!text.trim())}
        />
      </PromptInputFooter>
    </PromptInput>
  );
}
