"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { Message } from "@/store/chatStore";

interface ChatTimelineProps {
    messages: Message[];
    children: React.ReactNode;
}

export default function ChatTimeline({ messages, children }: ChatTimelineProps) {
    const timelineRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (timelineRef.current) {
            timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
        }
    }, [messages.length]);

    return (
        <div ref={timelineRef} className="chat-timeline">
            {children}

            <style jsx>{`
        .chat-timeline {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .chat-timeline::-webkit-scrollbar {
          width: 8px;
        }

        .chat-timeline::-webkit-scrollbar-track {
          background: var(--bg-base);
        }

        .chat-timeline::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }

        .chat-timeline::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }
      `}</style>
        </div>
    );
}
