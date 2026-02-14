'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { gsap } from 'gsap';

export type PillNavItem = {
    label: string;
    href: string;
    ariaLabel?: string;
};

export interface PillNavProps {
    items: PillNavItem[];
    activeHref?: string;
    className?: string;
    ease?: string;
    baseColor?: string;
    pillColor?: string;
    hoveredPillTextColor?: string;
    pillTextColor?: string;
    initialLoadAnimation?: boolean;
}

const PillNav: React.FC<PillNavProps> = ({
    items,
    activeHref,
    className = '',
    ease = 'power3.easeOut',
    baseColor = '#1f1f1f',
    pillColor = '#f5f3ef',
    hoveredPillTextColor = '#f5f3ef',
    pillTextColor,
    initialLoadAnimation = true
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const resolvedPillTextColor = pillTextColor ?? baseColor;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
    const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
    const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
    const hamburgerRef = useRef<HTMLButtonElement | null>(null);
    const mobileMenuRef = useRef<HTMLDivElement | null>(null);
    const navItemsRef = useRef<HTMLDivElement | null>(null);
    const logoRef = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
        const layout = () => {
            circleRefs.current.forEach(circle => {
                if (!circle?.parentElement) return;

                const pill = circle.parentElement as HTMLElement;
                const rect = pill.getBoundingClientRect();
                const { width: w, height: h } = rect;
                const R = ((w * w) / 4 + h * h) / (2 * h);
                const D = Math.ceil(2 * R) + 2;
                const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
                const originY = D - delta;

                circle.style.width = `${D}px`;
                circle.style.height = `${D}px`;
                circle.style.bottom = `-${delta}px`;

                gsap.set(circle, {
                    xPercent: -50,
                    scale: 0,
                    transformOrigin: `50% ${originY}px`
                });

                const label = pill.querySelector<HTMLElement>('.pill-label');
                const white = pill.querySelector<HTMLElement>('.pill-label-hover');

                if (label) gsap.set(label, { y: 0 });
                if (white) gsap.set(white, { y: h + 12, opacity: 0 });

                const index = circleRefs.current.indexOf(circle);
                if (index === -1) return;

                tlRefs.current[index]?.kill();
                const tl = gsap.timeline({ paused: true });

                tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

                if (label) {
                    tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
                }

                if (white) {
                    gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
                    tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
                }

                tlRefs.current[index] = tl;
            });
        };

        layout();

        const onResize = () => layout();
        window.addEventListener('resize', onResize);

        if (document.fonts) {
            document.fonts.ready.then(layout).catch(() => { });
        }

        const menu = mobileMenuRef.current;
        if (menu) {
            gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1, y: 0 });
        }

        if (initialLoadAnimation) {
            const logo = logoRef.current;
            const navItems = navItemsRef.current;

            if (logo) {
                gsap.set(logo, { scale: 0 });
                gsap.to(logo, {
                    scale: 1,
                    duration: 0.6,
                    ease
                });
            }

            if (navItems) {
                gsap.set(navItems, { width: 0, overflow: 'hidden' });
                gsap.to(navItems, {
                    width: 'auto',
                    duration: 0.6,
                    ease
                });
            }
        }

        return () => window.removeEventListener('resize', onResize);
    }, [items, ease, initialLoadAnimation]);

    const handleEnter = (i: number) => {
        const tl = tlRefs.current[i];
        if (!tl) return;
        activeTweenRefs.current[i]?.kill();
        activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
            duration: 0.3,
            ease,
            overwrite: 'auto'
        });
    };

    const handleLeave = (i: number) => {
        const tl = tlRefs.current[i];
        if (!tl) return;
        activeTweenRefs.current[i]?.kill();
        activeTweenRefs.current[i] = tl.tweenTo(0, {
            duration: 0.2,
            ease,
            overwrite: 'auto'
        });
    };

    const toggleMobileMenu = () => {
        const newState = !isMobileMenuOpen;
        setIsMobileMenuOpen(newState);

        const hamburger = hamburgerRef.current;
        const menu = mobileMenuRef.current;

        if (hamburger) {
            const lines = hamburger.querySelectorAll('.hamburger-line');
            if (newState) {
                gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
                gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
            } else {
                gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
                gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
            }
        }

        if (menu) {
            if (newState) {
                gsap.set(menu, { visibility: 'visible' });
                gsap.fromTo(
                    menu,
                    { opacity: 0, y: 10, scaleY: 1 },
                    {
                        opacity: 1,
                        y: 0,
                        scaleY: 1,
                        duration: 0.3,
                        ease,
                        transformOrigin: 'top center'
                    }
                );
            } else {
                gsap.to(menu, {
                    opacity: 0,
                    y: 10,
                    scaleY: 1,
                    duration: 0.2,
                    ease,
                    transformOrigin: 'top center',
                    onComplete: () => {
                        gsap.set(menu, { visibility: 'hidden' });
                    }
                });
            }
        }
    };

    const handleNavigation = (href: string) => {
        router.push(href);
    };

    const cssVars = {
        ['--base']: baseColor,
        ['--pill-bg']: pillColor,
        ['--hover-text']: hoveredPillTextColor,
        ['--pill-text']: resolvedPillTextColor,
        ['--nav-h']: '42px',
        ['--pill-pad-x']: '18px',
        ['--pill-gap']: '3px'
    } as React.CSSProperties;

    return (
        <div className="connect-nav-wrapper">
            <nav
                className={`connect-nav ${className}`}
                aria-label="Primary"
                style={cssVars}
            >
                <span
                    ref={logoRef}
                    onClick={() => handleNavigation('/')}
                    className="nav-logo"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleNavigation('/')}
                >
                    InsightX
                </span>

                <div ref={navItemsRef} className="nav-pills-container">
                    <ul role="menubar" className="nav-pills-list">
                        {items.map((item, i) => {
                            const isActive = activeHref === item.href || pathname === item.href;

                            const pillStyle: React.CSSProperties = {
                                background: 'var(--pill-bg)',
                                color: 'var(--pill-text)',
                                paddingLeft: 'var(--pill-pad-x)',
                                paddingRight: 'var(--pill-pad-x)'
                            };

                            return (
                                <li key={item.href} role="none" className="nav-pill-item">
                                    <button
                                        role="menuitem"
                                        onClick={() => handleNavigation(item.href)}
                                        className="nav-pill"
                                        style={pillStyle}
                                        aria-label={item.ariaLabel || item.label}
                                        onMouseEnter={() => handleEnter(i)}
                                        onMouseLeave={() => handleLeave(i)}
                                    >
                                        <span
                                            className="hover-circle"
                                            aria-hidden="true"
                                            ref={el => {
                                                circleRefs.current[i] = el;
                                            }}
                                        />
                                        <span className="label-stack">
                                            <span className="pill-label">{item.label}</span>
                                            <span className="pill-label-hover" aria-hidden="true">
                                                {item.label}
                                            </span>
                                        </span>
                                        {isActive && <span className="active-indicator" aria-hidden="true" />}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <button
                    ref={hamburgerRef}
                    onClick={toggleMobileMenu}
                    aria-label="Toggle menu"
                    aria-expanded={isMobileMenuOpen}
                    className="hamburger-btn"
                >
                    <span className="hamburger-line" />
                    <span className="hamburger-line" />
                </button>
            </nav>

            <div ref={mobileMenuRef} className="mobile-menu">
                <ul className="mobile-menu-list">
                    {items.map(item => (
                        <li key={item.href}>
                            <button
                                onClick={() => {
                                    handleNavigation(item.href);
                                    setIsMobileMenuOpen(false);
                                }}
                                className="mobile-menu-item"
                            >
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <style jsx>{`
        .connect-nav-wrapper {
          position: relative;
          width: 100%;
        }

        .connect-nav {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
          padding: 0 2rem;
          height: 4rem;
          border-bottom: 1px solid var(--stroke);
          background: var(--bg);
        }

        .nav-logo {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--fg);
          cursor: pointer;
          transition: opacity 0.2s;
          user-select: none;
        }

        .nav-logo:hover {
          opacity: 0.7;
        }

        .nav-pills-container {
          position: relative;
          display: none;
          align-items: center;
          border-radius: 50px;
          height: var(--nav-h);
          background: var(--base);
          margin-left: 1rem;
        }

        @media (min-width: 768px) {
          .nav-pills-container {
            display: flex;
          }
        }

        .nav-pills-list {
          list-style: none;
          display: flex;
          align-items: stretch;
          margin: 0;
          padding: 3px;
          height: 100%;
          gap: var(--pill-gap);
        }

        .nav-pill-item {
          display: flex;
          height: 100%;
        }

        .nav-pill {
          position: relative;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          border: none;
          text-decoration: none;
          border-radius: 50px;
          box-sizing: border-box;
          font-family: inherit;
          font-weight: 600;
          font-size: 0.875rem;
          line-height: 0;
          text-transform: uppercase;
          letter-spacing: 0.2px;
          white-space: nowrap;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s;
        }

        .hover-circle {
          position: absolute;
          left: 50%;
          bottom: 0;
          border-radius: 50%;
          z-index: 1;
          display: block;
          pointer-events: none;
          background: var(--base);
          will-change: transform;
        }

        .label-stack {
          position: relative;
          display: inline-block;
          line-height: 1;
          z-index: 2;
        }

        .pill-label {
          position: relative;
          z-index: 2;
          display: inline-block;
          line-height: 1;
          will-change: transform;
        }

        .pill-label-hover {
          position: absolute;
          left: 0;
          top: 0;
          z-index: 3;
          display: inline-block;
          color: var(--hover-text);
          will-change: transform, opacity;
        }

        .active-indicator {
          position: absolute;
          left: 50%;
          bottom: -6px;
          transform: translateX(-50%);
          width: 12px;
          height: 12px;
          border-radius: 50%;
          z-index: 4;
          background: var(--base);
        }

        .hamburger-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          padding: 0;
          position: relative;
          width: var(--nav-h);
          height: var(--nav-h);
          background: var(--base);
        }

        @media (min-width: 768px) {
          .hamburger-btn {
            display: none;
          }
        }

        .hamburger-line {
          width: 16px;
          height: 2px;
          border-radius: 2px;
          background: var(--pill-bg);
          transform-origin: center;
          transition: all 10ms cubic-bezier(0.25, 0.1, 0.25, 1);
        }

        .mobile-menu {
          display: block;
          position: absolute;
          top: 5rem;
          left: 1rem;
          right: 1rem;
          border-radius: 27px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          z-index: 998;
          transform-origin: top;
          background: var(--base);
        }

        @media (min-width: 768px) {
          .mobile-menu {
            display: none;
          }
        }

        .mobile-menu-list {
          list-style: none;
          margin: 0;
          padding: 3px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .mobile-menu-item {
          display: block;
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          font-weight: 500;
          border-radius: 50px;
          transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
          background: var(--pill-bg);
          color: var(--pill-text);
          border: none;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
        }

        .mobile-menu-item:hover {
          background: var(--base);
          color: var(--hover-text);
        }
      `}</style>
        </div>
    );
};

export default PillNav;
