"use client";

/**
 * PromptInput — Full-featured chat input system for InsightX
 *
 * Design System: DESIGN_SYSTEM.md
 *   Colors  : --bg, --fg, --loader-bg, --stroke, --accent
 *   Radius  : 0.375rem (sm), 0.75rem (md), 9999px (full)
 *   Spacing : multiples of 0.25rem
 *   Font    : PP Neue Montreal (inherited)
 */

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useRef,
    useState,
} from "react";
import {
    ChevronDown,
    GlobeIcon,
    Loader2,
    Paperclip,
    Send,
    Square,
    X,
} from "lucide-react";
import { AttachmentFile } from "@/components/ai-elements/attachments";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChatStatus = "idle" | "submitted" | "streaming" | "ready" | "error";

export interface PromptInputMessage {
    text?: string;
    files?: AttachmentFile[];
}

interface TooltipConfig {
    content: string;
    shortcut?: string;
    side?: "top" | "bottom" | "left" | "right";
}

// ─── Attachment Context ───────────────────────────────────────────────────────

interface AttachmentsContextValue {
    files: AttachmentFile[];
    add: (files: File[]) => void;
    remove: (id: string) => void;
    clear: () => void;
    openFileDialog: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    maxFileSize?: number;
}

const AttachmentsContext = createContext<AttachmentsContextValue | null>(null);

export function usePromptInputAttachments(): AttachmentsContextValue {
    const ctx = useContext(AttachmentsContext);
    if (!ctx)
        throw new Error("usePromptInputAttachments must be used inside <PromptInput>");
    return ctx;
}

// ─── Submit Context ───────────────────────────────────────────────────────────

interface SubmitContextValue {
    onSubmit: (msg: PromptInputMessage) => void;
    status: ChatStatus;
    getText: () => string;
}

const SubmitContext = createContext<SubmitContextValue | null>(null);

// ─── PromptInput (Root) ───────────────────────────────────────────────────────

interface PromptInputProps {
    children: React.ReactNode;
    onSubmit?: (msg: PromptInputMessage) => void;
    accept?: string;
    multiple?: boolean;
    globalDrop?: boolean;
    maxFiles?: number;
    maxFileSize?: number; // bytes
    onError?: (err: string) => void;
    status?: ChatStatus;
    className?: string;
    style?: React.CSSProperties;
    /** Internal ref for reading textarea value at submit time */
    _textRef?: React.MutableRefObject<string>;
}

export function PromptInput({
    children,
    onSubmit,
    accept,
    multiple = false,
    globalDrop = false,
    maxFiles,
    maxFileSize,
    onError,
    status = "idle",
    className,
    style,
}: PromptInputProps) {
    const [files, setFiles] = useState<AttachmentFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textRef = useRef<string>("");
    const [isDragging, setIsDragging] = useState(false);

    // ── File helpers ────────────────────────────────────────────────────────────

    const addFiles = useCallback(
        (incoming: File[]) => {
            const newFiles: AttachmentFile[] = [];
            for (const file of incoming) {
                if (maxFileSize && file.size > maxFileSize) {
                    onError?.(`File "${file.name}" exceeds the size limit.`);
                    continue;
                }
                if (maxFiles && files.length + newFiles.length >= maxFiles) {
                    onError?.(`Maximum ${maxFiles} files allowed.`);
                    break;
                }
                const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
                const af: AttachmentFile = { id, file };
                if (file.type.startsWith("image/")) {
                    const reader = new FileReader();
                    reader.onload = (e) =>
                        setFiles((prev) =>
                            prev.map((f) =>
                                f.id === id ? { ...f, preview: e.target?.result as string } : f
                            )
                        );
                    reader.readAsDataURL(file);
                }
                newFiles.push(af);
            }
            setFiles((prev) => [...prev, ...newFiles]);
        },
        [files.length, maxFileSize, maxFiles, onError]
    );

    const remove = useCallback((id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    }, []);

    const clear = useCallback(() => setFiles([]), []);

    const openFileDialog = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    // ── Global drag-and-drop ────────────────────────────────────────────────────

    useEffect(() => {
        if (!globalDrop) return;
        const onDragOver = (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(true);
        };
        const onDragLeave = () => setIsDragging(false);
        const onDrop = (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const dropped = Array.from(e.dataTransfer?.files ?? []);
            if (dropped.length) addFiles(dropped);
        };
        document.addEventListener("dragover", onDragOver);
        document.addEventListener("dragleave", onDragLeave);
        document.addEventListener("drop", onDrop);
        return () => {
            document.removeEventListener("dragover", onDragOver);
            document.removeEventListener("dragleave", onDragLeave);
            document.removeEventListener("drop", onDrop);
        };
    }, [globalDrop, addFiles]);

    // ── Submit ──────────────────────────────────────────────────────────────────

    const handleSubmit = useCallback(
        (msg: PromptInputMessage) => {
            onSubmit?.(msg);
        },
        [onSubmit]
    );

    const attachmentsValue: AttachmentsContextValue = {
        files,
        add: addFiles,
        remove,
        clear,
        openFileDialog,
        fileInputRef,
        accept,
        multiple,
        maxFiles,
        maxFileSize,
    };

    const submitValue: SubmitContextValue = {
        onSubmit: handleSubmit,
        status,
        getText: () => textRef.current,
    };

    return (
        <AttachmentsContext.Provider value={attachmentsValue}>
            <SubmitContext.Provider value={submitValue}>
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    style={{ display: "none" }}
                    onChange={(e) => {
                        const selected = Array.from(e.target.files ?? []);
                        if (selected.length) addFiles(selected);
                        e.target.value = "";
                    }}
                />

                <div
                    data-slot="prompt-input"
                    data-dragging={isDragging || undefined}
                    className={className}
                    style={{
                        position: "relative",
                        background: "var(--bg)",
                        border: "1px solid rgba(0, 0, 0, 0.12)",
                        borderRadius: "0.75rem",
                        fontFamily: "inherit",
                        transition: "border-color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1), box-shadow 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)",
                        ...(isDragging && {
                            borderColor: "var(--accent)",
                            boxShadow: "0 0 0 3px rgba(79,70,229,0.15)",
                        }),
                        ...style,
                    }}
                >
                    {/* Drag overlay */}
                    {isDragging && (
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: "0.75rem",
                                background: "rgba(79,70,229,0.06)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 10,
                                pointerEvents: "none",
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "0.875rem",
                                    color: "var(--accent)",
                                    fontWeight: 500,
                                }}
                            >
                                Drop files here
                            </span>
                        </div>
                    )}
                    {children}
                </div>
            </SubmitContext.Provider>
        </AttachmentsContext.Provider>
    );
}

// ─── PromptInputHeader ────────────────────────────────────────────────────────

interface PromptInputHeaderProps {
    children?: React.ReactNode;
    className?: string;
}

export function PromptInputHeader({ children, className }: PromptInputHeaderProps) {
    if (!children) return null;
    return (
        <div
            data-slot="prompt-input-header"
            className={className}
            style={{ padding: "0.75rem 0.75rem 0" }}
        >
            {children}
        </div>
    );
}

// ─── PromptInputBody ──────────────────────────────────────────────────────────

interface PromptInputBodyProps {
    children: React.ReactNode;
    className?: string;
}

export function PromptInputBody({ children, className }: PromptInputBodyProps) {
    return (
        <div
            data-slot="prompt-input-body"
            className={className}
            style={{ padding: "0.75rem 0.75rem" }}
        >
            {children}
        </div>
    );
}

// ─── PromptInputTextarea ──────────────────────────────────────────────────────

interface PromptInputTextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    onSubmitMessage?: (msg: PromptInputMessage) => void;
}

export function PromptInputTextarea({
    onSubmitMessage,
    style,
    onChange,
    onKeyDown,
    ...props
}: PromptInputTextareaProps) {
    const submitCtx = useContext(SubmitContext);
    const attachCtx = useContext(AttachmentsContext);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize
    const resize = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        resize();
        onChange?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const text = (e.currentTarget as HTMLTextAreaElement).value;
            const files = attachCtx?.files ?? [];
            if (!text.trim() && !files.length) return;
            const msg: PromptInputMessage = { text, files };
            submitCtx?.onSubmit(msg);
            onSubmitMessage?.(msg);
        }
        onKeyDown?.(e);
    };

    return (
        <textarea
            ref={textareaRef}
            data-slot="prompt-input-textarea"
            rows={1}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                fontFamily: "'PP Neue Montreal', system-ui, sans-serif",
                fontSize: "1rem",
                fontWeight: 400,
                color: "var(--fg)",
                lineHeight: 1.6,
                minHeight: "2.5rem",
                maxHeight: "12.5rem",
                overflowY: "auto",
                ...style,
            }}
            {...props}
        />
    );
}

// ─── PromptInputFooter ────────────────────────────────────────────────────────

interface PromptInputFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function PromptInputFooter({ children, className }: PromptInputFooterProps) {
    return (
        <div
            data-slot="prompt-input-footer"
            className={className}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 0.75rem",
                gap: "0.5rem",
                borderTop: "none",
            }}
        >
            {children}
        </div>
    );
}

// ─── PromptInputTools ─────────────────────────────────────────────────────────

interface PromptInputToolsProps {
    children: React.ReactNode;
    className?: string;
}

export function PromptInputTools({ children, className }: PromptInputToolsProps) {
    return (
        <div
            data-slot="prompt-input-tools"
            className={className}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                flexWrap: "wrap",
                flex: 1,
                minWidth: 0,
            }}
        >
            {children}
        </div>
    );
}

// ─── PromptInputButton ────────────────────────────────────────────────────────

interface PromptInputButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    tooltip?: string | TooltipConfig;
    variant?: "default" | "ghost" | "outline";
    active?: boolean;
}

export function PromptInputButton({
    tooltip,
    variant = "ghost",
    active,
    children,
    style,
    onMouseEnter,
    onMouseLeave,
    ...props
}: PromptInputButtonProps) {
    const [hovered, setHovered] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipContent =
        typeof tooltip === "string" ? tooltip : tooltip?.content;
    const tooltipShortcut =
        typeof tooltip === "object" ? tooltip?.shortcut : undefined;

    const baseStyle: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.375rem 0.625rem",
        borderRadius: "0.375rem",
        fontSize: "0.8125rem",
        fontWeight: 500,
        fontFamily: "inherit",
        cursor: "pointer",
        border: "1px solid rgba(0, 0, 0, 0.12)",
        transition: "all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)",
        position: "relative",
        whiteSpace: "nowrap",
    };

    const variantStyle: React.CSSProperties =
        variant === "default" || active
            ? {
                background: "rgba(79, 70, 229, 0.1)",
                color: "var(--fg)",
                border: "1px solid var(--accent, #4f46e5)",
            }
            : variant === "outline"
                ? {
                    background: "transparent",
                    color: "var(--fg)",
                    border: "1px solid rgba(0, 0, 0, 0.12)",
                }
                : {
                    background: hovered ? "rgba(0, 0, 0, 0.04)" : "transparent",
                    color: "var(--fg)",
                    border: hovered ? "1px solid rgba(0, 0, 0, 0.2)" : "1px solid rgba(0, 0, 0, 0.12)",
                };

    return (
        <button
            data-slot="prompt-input-button"
            type="button"
            style={{ ...baseStyle, ...variantStyle, ...style }}
            onMouseEnter={(e) => {
                setHovered(true);
                setShowTooltip(true);
                onMouseEnter?.(e);
            }}
            onMouseLeave={(e) => {
                setHovered(false);
                setShowTooltip(false);
                onMouseLeave?.(e);
            }}
            {...props}
        >
            {children}
            {showTooltip && tooltipContent && (
                <span
                    style={{
                        position: "absolute",
                        bottom: "calc(100% + 0.375rem)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "var(--fg)",
                        color: "var(--bg)",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.375rem",
                        fontSize: "0.75rem",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                        zIndex: 50,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                    }}
                >
                    {tooltipContent}
                    {tooltipShortcut && (
                        <kbd
                            style={{
                                background: "rgba(255,255,255,0.15)",
                                borderRadius: "0.25rem",
                                padding: "0 0.25rem",
                                fontSize: "0.7rem",
                            }}
                        >
                            {tooltipShortcut}
                        </kbd>
                    )}
                </span>
            )}
        </button>
    );
}

// ─── PromptInputSubmit ────────────────────────────────────────────────────────

interface PromptInputSubmitProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    status?: ChatStatus;
    onStop?: () => void;
}

export function PromptInputSubmit({
    status = "idle",
    onStop,
    disabled,
    style,
    ...props
}: PromptInputSubmitProps) {
    const submitCtx = useContext(SubmitContext);
    const attachCtx = useContext(AttachmentsContext);

    const isStreaming = status === "streaming" || status === "submitted";
    const isLoading = status === "submitted";
    const isDisabled = disabled || (!isStreaming && status === "idle");

    const handleClick = () => {
        if (isStreaming) {
            onStop?.();
            return;
        }
        // Trigger submit via context — the textarea's Enter handler is the primary path;
        // this button acts as a secondary trigger by dispatching a synthetic submit.
        // We read the textarea value from the DOM since we don't own the state here.
        const textarea = document.querySelector<HTMLTextAreaElement>(
            "[data-slot='prompt-input-textarea']"
        );
        const text = textarea?.value ?? "";
        const files = attachCtx?.files ?? [];
        if (!text.trim() && !files.length) return;
        submitCtx?.onSubmit({ text, files });
        if (textarea) textarea.value = "";
    };

    return (
        <button
            data-slot="prompt-input-submit"
            type="button"
            disabled={!isStreaming && !!disabled}
            onClick={handleClick}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "2rem",
                height: "2rem",
                borderRadius: "0.375rem",
                border: "none",
                cursor: isDisabled && !isStreaming ? "not-allowed" : "pointer",
                background: isStreaming
                    ? "var(--error)"
                    : isDisabled
                        ? "var(--loader-bg)"
                        : "var(--fg)",
                color: isDisabled && !isStreaming ? "var(--stroke)" : "var(--bg)",
                transition: "background 0.2s, transform 0.15s",
                flexShrink: 0,
                ...style,
            }}
            onMouseEnter={(e) => {
                if (!isDisabled || isStreaming)
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
            {...props}
        >
            {isStreaming ? (
                <Square size={14} fill="currentColor" />
            ) : isLoading ? (
                <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
                <Send size={14} />
            )}
        </button>
    );
}

// ─── PromptInputActionMenu ────────────────────────────────────────────────────

interface ActionMenuContextValue {
    open: boolean;
    setOpen: (v: boolean) => void;
}

const ActionMenuContext = createContext<ActionMenuContextValue>({
    open: false,
    setOpen: () => { },
});

interface PromptInputActionMenuProps {
    children: React.ReactNode;
}

export function PromptInputActionMenu({ children }: PromptInputActionMenuProps) {
    const [open, setOpen] = useState(false);
    return (
        <ActionMenuContext.Provider value={{ open, setOpen }}>
            <div style={{ position: "relative", display: "inline-flex" }}>
                {children}
            </div>
        </ActionMenuContext.Provider>
    );
}

// ─── PromptInputActionMenuTrigger ─────────────────────────────────────────────

interface PromptInputActionMenuTriggerProps {
    children?: React.ReactNode;
}

export function PromptInputActionMenuTrigger({
    children,
}: PromptInputActionMenuTriggerProps) {
    const { open, setOpen } = useContext(ActionMenuContext);
    return (
        <PromptInputButton
            onClick={() => setOpen(!open)}
            tooltip="Attach files"
            aria-label="Open attachment menu"
            style={{ padding: "0.25rem" }}
        >
            {children ?? <Paperclip size={15} />}
        </PromptInputButton>
    );
}

// ─── PromptInputActionMenuContent ─────────────────────────────────────────────

interface PromptInputActionMenuContentProps {
    children: React.ReactNode;
}

export function PromptInputActionMenuContent({
    children,
}: PromptInputActionMenuContentProps) {
    const { open, setOpen } = useContext(ActionMenuContext);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open, setOpen]);

    if (!open) return null;

    return (
        <div
            ref={ref}
            style={{
                position: "absolute",
                bottom: "calc(100% + 0.375rem)",
                left: 0,
                background: "var(--bg)",
                border: "1px solid var(--stroke)",
                borderRadius: "0.5rem",
                padding: "0.25rem",
                zIndex: 50,
                minWidth: "10rem",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}
        >
            {children}
        </div>
    );
}

// ─── PromptInputActionAddAttachments ─────────────────────────────────────────

interface PromptInputActionAddAttachmentsProps {
    label?: string;
}

export function PromptInputActionAddAttachments({
    label = "Upload file",
}: PromptInputActionAddAttachmentsProps) {
    const { openFileDialog } = usePromptInputAttachments();
    const { setOpen } = useContext(ActionMenuContext);

    return (
        <button
            type="button"
            onClick={() => {
                openFileDialog();
                setOpen(false);
            }}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.375rem",
                border: "none",
                background: "transparent",
                color: "var(--fg)",
                fontSize: "0.8125rem",
                fontFamily: "inherit",
                fontWeight: 500,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "var(--loader-bg)")
            }
            onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
            }
        >
            <Paperclip size={14} />
            {label}
        </button>
    );
}

// ─── PromptInputSelect ────────────────────────────────────────────────────────

interface SelectContextValue {
    value: string;
    onValueChange: (v: string) => void;
    open: boolean;
    setOpen: (v: boolean) => void;
    id: string;
}

const SelectContext = createContext<SelectContextValue | null>(null);

interface PromptInputSelectProps {
    value: string;
    onValueChange: (v: string) => void;
    children: React.ReactNode;
}

export function PromptInputSelect({
    value,
    onValueChange,
    children,
}: PromptInputSelectProps) {
    const [open, setOpen] = useState(false);
    const id = useId();
    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen, id }}>
            <div style={{ position: "relative", display: "inline-flex" }}>
                {children}
            </div>
        </SelectContext.Provider>
    );
}

// ─── PromptInputSelectTrigger ─────────────────────────────────────────────────

interface PromptInputSelectTriggerProps {
    children?: React.ReactNode;
}

export function PromptInputSelectTrigger({
    children,
}: PromptInputSelectTriggerProps) {
    const ctx = useContext(SelectContext);
    const [hovered, setHovered] = useState(false);

    return (
        <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={ctx?.open}
            onClick={() => ctx?.setOpen(!ctx.open)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.375rem",
                border: "none",
                background: hovered ? "var(--loader-bg)" : "transparent",
                color: "var(--fg)",
                fontSize: "0.8125rem",
                fontWeight: 500,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "background 0.15s",
            }}
        >
            {children}
            <ChevronDown
                size={12}
                style={{
                    transition: "transform 0.2s",
                    transform: ctx?.open ? "rotate(180deg)" : "rotate(0deg)",
                    opacity: 0.6,
                }}
            />
        </button>
    );
}

// ─── PromptInputSelectValue ───────────────────────────────────────────────────

export function PromptInputSelectValue() {
    const ctx = useContext(SelectContext);
    return <span>{ctx?.value ?? ""}</span>;
}

// ─── PromptInputSelectContent ─────────────────────────────────────────────────

interface PromptInputSelectContentProps {
    children: React.ReactNode;
}

export function PromptInputSelectContent({
    children,
}: PromptInputSelectContentProps) {
    const ctx = useContext(SelectContext);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ctx?.open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                ctx.setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [ctx]);

    if (!ctx?.open) return null;

    return (
        <div
            ref={ref}
            role="listbox"
            style={{
                position: "absolute",
                bottom: "calc(100% + 0.375rem)",
                left: 0,
                background: "var(--bg)",
                border: "1px solid var(--stroke)",
                borderRadius: "0.5rem",
                padding: "0.25rem",
                zIndex: 50,
                minWidth: "10rem",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}
        >
            {children}
        </div>
    );
}

// ─── PromptInputSelectItem ────────────────────────────────────────────────────

interface PromptInputSelectItemProps {
    value: string;
    children: React.ReactNode;
}

export function PromptInputSelectItem({
    value,
    children,
}: PromptInputSelectItemProps) {
    const ctx = useContext(SelectContext);
    const isSelected = ctx?.value === value;
    const [hovered, setHovered] = useState(false);

    return (
        <button
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={() => {
                ctx?.onValueChange(value);
                ctx?.setOpen(false);
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.375rem",
                border: "none",
                background: isSelected
                    ? "var(--loader-bg)"
                    : hovered
                        ? "var(--loader-bg)"
                        : "transparent",
                color: "var(--fg)",
                fontSize: "0.8125rem",
                fontWeight: isSelected ? 500 : 400,
                fontFamily: "inherit",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s",
            }}
        >
            {children}
        </button>
    );
}

// ─── CSS keyframe injection ───────────────────────────────────────────────────
// Inject the spin keyframe once for the loading spinner in PromptInputSubmit

if (typeof document !== "undefined") {
    const styleId = "prompt-input-keyframes";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
        document.head.appendChild(style);
    }
}
