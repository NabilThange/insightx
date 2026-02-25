'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function GlobalHeader() {
  const pathname = usePathname();

  // Do not show navbar on landing page, login page, or workspace pages
  if (pathname === '/' || pathname === '/login' || pathname.startsWith('/workspace')) return null;

  return (
    <nav className="global-navbar">
      <div className="logo-name">
        <Link href="/">InsightX</Link>
      </div>

      <div className="nav-items">
        <div className="links">
          <Link href="/connect" className={pathname.startsWith('/connect') ? 'active' : ''}>Connect</Link>
          <p>/</p>
          <Link href="/workspace" className={pathname.startsWith('/workspace') ? 'active' : ''}>Workspace</Link>
          <p>/</p>
          <Link href="/reports" className={pathname.startsWith('/reports') ? 'active' : ''}>Reports</Link>
          <p>/</p>
          <Link href="/recents" className={pathname.startsWith('/recents') ? 'active' : ''}>Recents</Link>
        </div>
        <div className="cta">
          <Link href="/login" className="login-btn">
            Login
          </Link>
        </div>
      </div>

      <div className="divider" />

      <style jsx>{`
        .global-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          height: 5rem;
          padding: 1.5rem 1.5rem 1.5rem 7.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg);
        }

        .logo-name :global(a) {
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: -0.05rem;
          color: var(--fg);
          text-decoration: none;
        }

        .nav-items {
          display: flex;
          align-items: center;
          gap: 7.5rem;
        }

        .links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .links :global(a) {
          color: var(--fg);
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          opacity: 0.6;
          transition: opacity 0.2s ease, background 0.2s ease;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          display: flex;
          align-items: center;
        }

        .links :global(a:hover),
        .links :global(a.active) {
          opacity: 1;
        }
        
        .links :global(a:hover) {
          background: var(--loader-bg);
        }

        .links p {
          color: var(--fg);
          opacity: 0.3;
          margin: 0;
          font-weight: 400;
        }

        .login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 44px;
          padding: 0 20px;
          border: 1px solid var(--stroke);
          border-radius: 10px;
          font-size: 14px;
          transition: all 0.2s ease;
          color: var(--fg);
          text-decoration: none;
          font-weight: 500;
          background: transparent;
        }

        .login-btn:hover {
          background-color: var(--loader-bg);
          border-color: var(--fg);
        }

        .divider {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 1px;
          background-color: var(--stroke);
        }

        @media (max-width: 1000px) {
          .global-navbar {
            padding-left: 1.5rem;
          }
          .nav-items {
            gap: 2rem;
          }
          .links {
            gap: 0.25rem;
          }
        }
      `}</style>
    </nav>
  );
}
