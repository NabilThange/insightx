"use client";

import React, { createContext, useContext } from "react";
import { X, FileText, Image, File } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AttachmentFile {
    id: string;
    file: File;
    preview?: string; // data-URL for images
}

interface AttachmentContextValue {
    data: AttachmentFile;
    onRemove?: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AttachmentContext = createContext<AttachmentContextValue | null>(null);

function useAttachmentContext() {
    const ctx = useContext(AttachmentContext);
    if (!ctx) throw new Error("Attachment sub-components must be used inside <Attachment>");
    return ctx;
}

// ─── Attachments (container) ──────────────────────────────────────────────────

interface AttachmentsProps {
    children: React.ReactNode;
    variant?: "inline" | "grid";
    className?: string;
}

export function Attachments({ children, variant = "inline", className }: AttachmentsProps) {
    return (
        <div
            data-slot="attachments"
            data-variant={variant}
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                padding: "0.5rem 0",
            }}
            className={className}
        >
            {children}
        </div>
    );
}

// ─── Attachment (single item) ─────────────────────────────────────────────────

interface AttachmentProps {
    data: AttachmentFile;
    onRemove?: (id: string) => void;
    children: React.ReactNode;
}

export function Attachment({ data, onRemove, children }: AttachmentProps) {
    return (
        <AttachmentContext.Provider value={{ data, onRemove }}>
            <div
                data-slot="attachment"
                style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    background: "var(--loader-bg)",
                    border: "1px solid var(--stroke)",
                    borderRadius: "0.375rem",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.75rem",
                    color: "var(--fg)",
                    fontFamily: "inherit",
                    maxWidth: "10rem",
                }}
            >
                {children}
            </div>
        </AttachmentContext.Provider>
    );
}

// ─── AttachmentPreview ────────────────────────────────────────────────────────

export function AttachmentPreview() {
    const { data } = useAttachmentContext();
    const isImage = data.file.type.startsWith("image/");

    if (isImage && data.preview) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={data.preview}
                alt={data.file.name}
                style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    objectFit: "cover",
                    borderRadius: "0.25rem",
                    flexShrink: 0,
                }}
            />
        );
    }

    const Icon = isImage ? Image : data.file.type === "application/pdf" ? FileText : File;

    return (
        <Icon
            size={14}
            style={{ flexShrink: 0, opacity: 0.7 }}
        />
    );
}

// ─── AttachmentName ───────────────────────────────────────────────────────────

export function AttachmentName() {
    const { data } = useAttachmentContext();
    const name = data.file.name;
    const truncated = name.length > 16 ? name.slice(0, 13) + "…" : name;

    return (
        <span
            style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "7rem",
            }}
            title={name}
        >
            {truncated}
        </span>
    );
}

// ─── AttachmentRemove ─────────────────────────────────────────────────────────

export function AttachmentRemove() {
    const { data, onRemove } = useAttachmentContext();

    return (
        <button
            type="button"
            aria-label={`Remove ${data.file.name}`}
            onClick={() => onRemove?.(data.id)}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.125rem",
                borderRadius: "9999px",
                color: "var(--fg)",
                opacity: 0.6,
                transition: "opacity 0.2s",
                flexShrink: 0,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.6")}
        >
            <X size={12} />
        </button>
    );
}
