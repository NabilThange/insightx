"use client";

import { motion } from "framer-motion";
import { Download, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReportsHero() {
    const router = useRouter();

    return (
        <motion.section
            className="reports-hero"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <div className="hero-left">
                <h1 className="hero-title">Reports & Insights</h1>
                <p className="hero-subtitle">
                    Deep dive into your transaction DNA, anomaly patterns, and operational metrics.
                </p>
            </div>

            <div className="hero-right">
                <button className="secondary-btn">
                    <Download size={16} />
                    <span>Export All</span>
                </button>
                <button className="primary-btn" onClick={() => router.push('/connect')}>
                    <Plus size={16} />
                    <span>New Analysis</span>
                </button>
            </div>

            <style jsx>{`
        .reports-hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--stroke);
          margin-bottom: 2rem;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-width: 600px;
        }

        .hero-title {
          font-size: 2rem; /* 32px */
          font-weight: 500; /* Medium weight like Connect page */
          color: var(--fg);
          letter-spacing: -0.02em;
          margin: 0;
          line-height: 1.1;
        }

        .hero-subtitle {
          font-size: 1rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.5;
          max-width: 480px;
        }

        .hero-right {
          display: flex;
          gap: 1rem;
        }

        button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .secondary-btn {
          background: var(--bg-surface);
          border: 1px solid var(--stroke);
          color: var(--fg);
        }

        .secondary-btn:hover {
          background: var(--bg-elevated);
          border-color: var(--fg);
          transform: translateY(-1px);
        }

        .primary-btn {
          background: var(--fg);
          border: 1px solid var(--fg);
          color: var(--bg);
        }

        .primary-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        @media (max-width: 768px) {
          .reports-hero {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          
          .hero-right {
            width: 100%;
          }
          
          button {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
        </motion.section>
    );
}
