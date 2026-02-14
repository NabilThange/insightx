"use client";

import { motion } from "framer-motion";

interface UserMessageProps {
    content: string;
}

export default function UserMessage({ content }: UserMessageProps) {
    return (
        <motion.div
            className="user-message"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="message-content">{content}</div>

            <style jsx>{`
        .user-message {
          display: flex;
          justify-content: flex-end;
        }

        .message-content {
          max-width: 70%;
          padding: 1rem 1.25rem;
          background-color: var(--accent-blue);
          color: white;
          border-radius: 1rem 1rem 0.25rem 1rem;
          font-size: 0.875rem;
          line-height: 1.5;
        }
      `}</style>
        </motion.div>
    );
}
