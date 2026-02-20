"use client";

import { motion } from "framer-motion";
import { Download, Plus, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReportsHero() {
  const router = useRouter();

  return (
    <motion.section
      className="reports-hero"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* LEFT — label + title + subtitle */}
      <div className="hero-left">
        <div className="hero-eyebrow">
          <BarChart3 size={12} />
          <span>Analytics Suite</span>
        </div>
        <h1 className="hero-title">Reports &amp; Insights</h1>
        <p className="hero-subtitle">
          Deep dive into your transaction DNA, anomaly patterns, and operational metrics.
        </p>
      </div>

      {/* RIGHT — stat pills + actions */}
      <div className="hero-right">
        {/* Quick stats */}
        <div className="hero-stats">
          <div className="stat-chip stat-up">
            <TrendingUp size={11} />
            <span>+8.5% growth</span>
          </div>
          <div className="stat-chip stat-warn">
            <AlertTriangle size={11} />
            <span>3 alerts</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="hero-actions">
          <button className="secondary-btn">
            <Download size={14} />
            <span>Export All</span>
          </button>
          <button className="primary-btn" onClick={() => router.push('/connect')}>
            <Plus size={14} />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .reports-hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--stroke);
          margin-bottom: 2rem;
          gap: 2rem;
        }

        /* LEFT */
        .hero-left {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 0.125rem;
        }

        .hero-title {
          font-size: 2.25rem;
          font-weight: 500;
          color: var(--fg);
          letter-spacing: -0.04em;
          margin: 0;
          line-height: 1.05;
        }

        .hero-subtitle {
          font-size: 0.9375rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.5;
          max-width: 440px;
          font-weight: 400;
        }

        /* RIGHT */
        .hero-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.875rem;
          flex-shrink: 0;
        }

        /* Stat chips */
        .hero-stats {
          display: flex;
          gap: 0.5rem;
        }

        .stat-chip {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.3rem 0.625rem;
          border-radius: 9999px;
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          border: 1px solid transparent;
        }

        .stat-up {
          background: rgba(45, 80, 22, 0.1);
          color: var(--accent-green, #2d5016);
          border-color: rgba(45, 80, 22, 0.2);
        }

        .stat-warn {
          background: rgba(217, 119, 6, 0.1);
          color: var(--warning, #d97706);
          border-color: rgba(217, 119, 6, 0.2);
        }

        /* Action buttons */
        .hero-actions {
          display: flex;
          gap: 0.625rem;
        }

        .secondary-btn,
        .primary-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.625rem 1.125rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s, border-color 0.2s;
        }

        .secondary-btn {
          background: var(--bg);
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
          opacity: 0.88;
        }

        @media (max-width: 768px) {
          .reports-hero {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          .hero-right {
            align-items: flex-start;
            width: 100%;
          }
          .hero-actions {
            width: 100%;
          }
          .secondary-btn,
          .primary-btn {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </motion.section>
  );
}
