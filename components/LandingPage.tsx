"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Flip } from "gsap/dist/Flip";
import { SplitText } from "gsap/dist/SplitText";
import Image from "next/image";
import Link from "next/link";

// ✅ Register plugins at module level — safe in "use client" files
gsap.registerPlugin(Flip, SplitText);

export default function LandingPage() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    // ✅ Scoped gsap context — all animations auto-cleaned on unmount
    const ctx = gsap.context(() => {

      // ─── Text Splitting ────────────────────────────────────────────────
      const setupTextSplitting = () => {
        const textElements = hero.querySelectorAll("h1, h2, p, a, .cta-wrapper a");
        textElements.forEach((element) => {
          SplitText.create(element, {
            type: "lines",
            linesClass: "line",
          });
          const lines = element.querySelectorAll(".line");
          lines.forEach((line) => {
            const textContent = line.textContent || "";
            line.innerHTML = `<span>${textContent}</span>`;
          });
        });
      };

      // ─── Counter Digits ────────────────────────────────────────────────
      const createCounterDigits = () => {
        const counter1 = hero.querySelector(".counter-1");
        const counter2 = hero.querySelector(".counter-2");
        const counter3 = hero.querySelector(".counter-3");

        if (!counter1 || !counter2 || !counter3) return;

        // Counter 1: shows "0" → "1"
        const num0 = document.createElement("div");
        num0.className = "num";
        num0.textContent = "0";
        counter1.appendChild(num0);

        const num1 = document.createElement("div");
        num1.className = "num num1offset1";
        num1.textContent = "1";
        counter1.appendChild(num1);

        // Counter 2: 0–9 then 0 again
        for (let i = 0; i <= 10; i++) {
          const numDiv = document.createElement("div");
          numDiv.className = i === 1 ? "num num1offset2" : "num";
          numDiv.textContent = i === 10 ? "0" : String(i);
          counter2.appendChild(numDiv);
        }

        // Counter 3: 0–9 cycling × 3 then 0
        for (let i = 0; i < 30; i++) {
          const numDiv = document.createElement("div");
          numDiv.className = "num";
          numDiv.textContent = String(i % 10);
          counter3.appendChild(numDiv);
        }
        const finalNum = document.createElement("div");
        finalNum.className = "num";
        finalNum.textContent = "0";
        counter3.appendChild(finalNum);
      };

      // ─── Counter Animation ─────────────────────────────────────────────
      const animateCounter = (
        counter: Element,
        duration: number,
        delay = 0
      ) => {
        const firstNum = counter.querySelector(".num") as HTMLElement | null;
        if (!firstNum) return;

        const numHeight = firstNum.clientHeight;
        if (!numHeight) return;

        const totalDistance =
          (counter.querySelectorAll(".num").length - 1) * numHeight;

        gsap.to(counter, {
          y: -totalDistance,
          duration,
          delay,
          ease: "power2.inOut",
        });
      };

      // ─── Image Flip Animation ──────────────────────────────────────────
      // ✅ Uses real Flip plugin — matches original script.js exactly
      const animateImages = () => {
        const images = hero.querySelectorAll(".img");

        // Remove animate-out so images are in start position
        images.forEach((img) => img.classList.remove("animate-out"));

        // ✅ Capture state BEFORE adding the class
        const state = Flip.getState(images);

        // Move images to end position via CSS class
        images.forEach((img) => img.classList.add("animate-out"));

        const mainTimeline = gsap.timeline();

        // ✅ Flip.from animates from captured state → current (animate-out) state
        mainTimeline.add(
          Flip.from(state, {
            duration: 1,
            stagger: 0.1,
            ease: "power3.inOut",
          })
        );

        // Scale punch per image
        images.forEach((img, index) => {
          const scaleTimeline = gsap.timeline();
          scaleTimeline
            .to(img, { scale: 2.5, duration: 0.45, ease: "power3.in" }, 0.025)
            .to(img, { scale: 1, duration: 0.45, ease: "power3.out" }, 0.5);
          mainTimeline.add(scaleTimeline, index * 0.1);
        });

        return mainTimeline;
      };

      // ─── Init ──────────────────────────────────────────────────────────
      setupTextSplitting();
      createCounterDigits();

      const counter1 = hero.querySelector(".counter-1");
      const counter2 = hero.querySelector(".counter-2");
      const counter3 = hero.querySelector(".counter-3");

      if (counter1 && counter2 && counter3) {
        animateCounter(counter3, 2.5);
        animateCounter(counter2, 3);
        animateCounter(counter1, 2, 1.5);
      }

      // ─── Main Timeline ─────────────────────────────────────────────────
      const tl = gsap.timeline();

      // ✅ Scope to hero element directly — avoids targeting .img on other pages
      gsap.set(hero.querySelectorAll(".img"), { scale: 0 });

      tl.to(".hero-bg", {
        scaleY: "100%",
        duration: 3,
        ease: "power2.inOut",
        delay: 0.25,
      });

      tl.to(
        ".img",
        {
          scale: 1,
          duration: 1,
          stagger: 0.125,
          ease: "power3.out",
        },
        "<"
      );

      tl.to(".counter", {
        opacity: 0,
        duration: 0.3,
        ease: "power3.out",
        delay: 0.3,
        onStart: () => {
          animateImages();
        },
      });

      tl.to(".sidebar .divider", {
        scaleY: "100%",
        duration: 1,
        ease: "power3.inOut",
        delay: 1.25,
      });

      tl.to(
        ["nav .divider", ".site-info .divider"],
        {
          scaleX: "100%",
          duration: 1,
          stagger: 0.5,
          ease: "power3.inOut",
        },
        "<"
      );

      tl.to(
        ".logo",
        {
          scale: 1,
          duration: 1,
          ease: "power4.inOut",
        },
        "<"
      );

      tl.to(
        [".logo-name a span", ".links a span, .links p span", ".cta a span"],
        {
          y: "0%",
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
          delay: 0.5,
        },
        "<"
      );

      tl.to(
        [".contact-btn", ".cta-wrapper a"],
        {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        },
        ">"
      );

      tl.to(
        [".header h1 span", ".header .cta-wrapper span", ".site-info span"],
        {
          y: "0%",
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
        },
        "<"
      );

    }, heroRef); // ✅ Scope context to heroRef — selectors resolve inside it

    // ✅ Cleanup: kills all tweens, ScrollTriggers, event listeners
    return () => ctx.revert();
  }, []);

  return (
    <>
      {/*
        ✅ Global styles go in globals.css or a <style> tag at layout level.
           CSS variables and the .line/.num styles must be global because
           they are injected by JavaScript at runtime — JSX scoped styles
           can't reach dynamically created DOM nodes.
      */}
      <style>{`
        :root {
          --bg: #f1efe7;
          --fg: #1f1f1f;
          --loader-bg: #e0e0d8;
          --stroke: rgba(0, 0, 0, 0.2);
        }

        body {
          font-family: "PP Neue Montreal", sans-serif;
          color: var(--fg);
        }

        /* ✅ Must be global — injected by SplitText at runtime */
        .line {
          overflow: hidden;
        }
        .line span {
          position: relative;
          display: block;
          transform: translateY(125%);
          will-change: transform;
        }

        /* ✅ Must be global — injected by createCounterDigits at runtime */
        .num {
          /* inherits font-size/line-height from .counter */
        }
        .num1offset1 {
          position: relative;
          right: -30px;
        }
        .num1offset2 {
          position: relative;
          right: -15px;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        h1 {
          font-size: 6rem;
          font-weight: 500;
          letter-spacing: -0.1rem;
          line-height: 1.1;
        }

        h2 {
          font-size: 1.75rem;
          font-weight: 500;
          letter-spacing: -0.02rem;
          line-height: 1.1;
        }

        a, p {
          color: var(--fg);
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          overflow: hidden;
          line-height: 1;
        }

        .divider {
          background-color: var(--stroke);
        }

        /* ✅ THE FIX: .img position MUST live in CSS, not inline styles.
           Flip.getState() reads CSS-computed positions.
           Inline style={{ top, left }} overrides class styles via specificity,
           so Flip sees no difference between default and .animate-out state. */
        .images-container .img {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          width: 20%;
          aspect-ratio: 5/3;
          border-radius: 0.75rem;
          overflow: hidden;
        }

        /* ✅ This is the TARGET state Flip animates TO */
        .images-container .img.animate-out {
          top: unset;
          left: unset;
          bottom: 1.5rem;
          right: 1.5rem;
        }

        .contact-btn:hover {
          background-color: var(--fg);
          color: var(--bg) !important;
        }

        @media (max-width: 1000px) {
          h1 {
            font-size: 2.5rem;
            letter-spacing: -0.05rem;
          }
          h2 {
            font-size: 1.5rem;
          }
          nav .links {
            display: none;
          }
          .images-container .img {
            width: 30%;
          }
          .header {
            top: 25%;
            width: calc(100% - 12.5rem);
          }
          .site-info {
            width: calc(100% - 12.5rem);
            right: unset;
            left: 7.5rem;
          }
        }
      `}</style>

      <section ref={heroRef} className="hero" style={{
        position: "relative",
        width: "100%",
        height: "100svh",
        backgroundColor: "var(--bg)",
        overflow: "hidden",
      }}>

        <div className="hero-bg" style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%", height: "100%",
          backgroundColor: "var(--loader-bg)",
          transformOrigin: "bottom",
          transform: "scaleY(0%)",
        }} />

        {/* ── Counter ── */}
        <div className="counter" style={{
          position: "fixed",
          right: "3rem", bottom: "2rem",
          display: "flex",
          height: "120px",
          fontSize: "120px",
          lineHeight: "150px",
          WebkitTextStroke: "2px var(--fg)",
          clipPath: "polygon(0 0, 100% 0, 100% 120px, 0 120px)",
        }}>
          <div className="counter-1 digit" style={{ position: "relative", top: "-15px" }} />
          <div className="counter-2 digit" style={{ position: "relative", top: "-15px" }} />
          <div className="counter-3 digit" style={{ position: "relative", top: "-15px" }} />
        </div>

        {/* ── Images ── */}
        <div className="images-container" style={{
          position: "absolute", top: 0, left: 0,
          width: "100%", height: "100%",
        }}>
          {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
            // ✅ No inline position styles — position is fully controlled by
            //    .img and .img.animate-out CSS classes so Flip can read the diff
            <div key={num} className="img">
              <Image
                src={`/img${num}.jpg`}
                alt=""
                fill
                style={{ objectFit: "cover" }}
                priority={num <= 5}
              />
            </div>
          ))}
        </div>

        {/* ── Nav ── */}
        <nav style={{
          position: "relative",
          width: "100%", height: "5rem",
          padding: "1.5rem 1.5rem 1.5rem 7.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div className="logo-name">
            {/* ✅ Next.js Link renders <a> — SplitText will wrap it correctly */}
            <Link href="/" style={{ fontSize: "1.5rem", fontWeight: "600", letterSpacing: "-0.05rem" }}>InsightX</Link>
          </div>

          <div className="nav-items" style={{ display: "flex", alignItems: "center", gap: "7.5rem" }}>
            <div className="links" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Link href="/connect">Connect</Link>
              <p>/</p>
              <Link href="/workspace">Workspace</Link>
              <p>/</p>
              <Link href="/reports">Reports</Link>
            </div>
            <div className="cta">
              <Link
                href="/login"
                className="contact-btn"
                style={{
                  padding: "0.75rem 1.5rem",
                  border: "1px solid var(--fg)",
                  borderRadius: "2rem",
                  fontSize: "0.875rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05rem",
                  transition: "all 0.3s ease",
                  display: "inline-block",
                  lineHeight: "1",
                  opacity: 0,
                }}
              >
                Login
              </Link>
            </div>
          </div>

          {/* ✅ nav .divider — scaleX driven by GSAP */}
          <div className="divider" style={{
            position: "absolute",
            left: 0, bottom: 0,
            width: "100%", height: "1px",
            transformOrigin: "left",
            transform: "scaleX(0%)",
          }} />
        </nav>

        {/* ── Sidebar ── */}
        <div className="sidebar" style={{
          position: "absolute", top: 0, left: 0,
          width: "5rem", height: "100svh",
          paddingTop: "1.5rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}>
          {/* ✅ .logo starts at scale(0) — GSAP animates it to scale(1) */}
          <div className="logo" style={{
            width: "2rem", aspectRatio: "1",
            transform: "scale(0)",
            position: "relative",
          }}>
            <Image src="/logo.png" alt="Logo" fill style={{ objectFit: "contain" }} priority />
          </div>

          <div className="divider" style={{
            position: "absolute",
            right: 0, top: 0,
            width: "1px", height: "100svh",
            transformOrigin: "top",
            transform: "scaleY(0%)",
          }} />
        </div>

        {/* ── Header ── */}
        <div className="header" style={{
          position: "absolute",
          top: "40%", left: "7.5rem",
          transform: "translateY(-50%)",
          width: "60%",
        }}>
          <h1>Your data knows the answer. Just ask.</h1>
          <div className="cta-wrapper" style={{ marginTop: "2.5rem" }}>
            <Link href="/connect" style={{
              display: "inline-block",
              padding: "1rem 2rem",
              backgroundColor: "var(--fg)",
              color: "var(--bg)",
              borderRadius: "0.375rem",
              fontWeight: "500",
              textDecoration: "none",
              fontSize: "1.125rem",
              position: "relative",
              opacity: 0,
            }}>
              Upload Your CSV →
            </Link>
          </div>
        </div>

        {/* ── Site Info ── */}
        <div className="site-info" style={{
          position: "absolute",
          right: "1.5rem", top: "60%",
          transform: "translateY(-50%)",
          width: "20%",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}>
          <h2>Upload any dataset. Ask in plain English — no SQL, no code, no delays</h2>

          <div className="divider" style={{
            width: "100%", height: "1px",
            transformOrigin: "left",
            transform: "scaleX(0%)",
          }} />

          <div className="site-info-copy" style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <p>Any dataset. Any question.</p>
            <p>Instant answers.</p>
          </div>
        </div>

        {/* ── Footer ── */}

      </section>



      {/* ── Section 12: Footer ── */}
      <footer style={{
        padding: "4rem 7.5rem 2rem",
        backgroundColor: "var(--loader-bg)",
        borderTop: "1px solid var(--stroke)",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: "3rem",
          marginBottom: "3rem",
        }}>
          {/* Brand */}
          <div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
              InsightX
            </h3>
            <p style={{ opacity: 0.7, lineHeight: "1.6" }}>
              AI-powered data analysis that thinks like an analyst, codes like an engineer, and explains like a teacher.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 style={{ fontWeight: "500", marginBottom: "1rem" }}>Product</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li><Link href="/connect" style={{ opacity: 0.7, textDecoration: "none" }}>Get Started</Link></li>
              <li><Link href="/workspace" style={{ opacity: 0.7, textDecoration: "none" }}>Workspace</Link></li>
              <li><Link href="/reports" style={{ opacity: 0.7, textDecoration: "none" }}>Reports</Link></li>
              <li><Link href="/pricing" style={{ opacity: 0.7, textDecoration: "none" }}>Pricing</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 style={{ fontWeight: "500", marginBottom: "1rem" }}>Resources</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li><Link href="/docs" style={{ opacity: 0.7, textDecoration: "none" }}>Documentation</Link></li>
              <li><Link href="/blog" style={{ opacity: 0.7, textDecoration: "none" }}>Blog</Link></li>
              <li><Link href="/examples" style={{ opacity: 0.7, textDecoration: "none" }}>Examples</Link></li>
              <li><Link href="/support" style={{ opacity: 0.7, textDecoration: "none" }}>Support</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ fontWeight: "500", marginBottom: "1rem" }}>Legal</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li><Link href="/privacy" style={{ opacity: 0.7, textDecoration: "none" }}>Privacy</Link></li>
              <li><Link href="/terms" style={{ opacity: 0.7, textDecoration: "none" }}>Terms</Link></li>
              <li><Link href="/security" style={{ opacity: 0.7, textDecoration: "none" }}>Security</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: "2rem",
          borderTop: "1px solid var(--stroke)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <p style={{ opacity: 0.6, fontSize: "0.875rem" }}>
            © 2026 InsightX. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="https://github.com" style={{ opacity: 0.6, textDecoration: "none" }}>GitHub</Link>
            <Link href="https://twitter.com" style={{ opacity: 0.6, textDecoration: "none" }}>Twitter</Link>
            <Link href="https://linkedin.com" style={{ opacity: 0.6, textDecoration: "none" }}>LinkedIn</Link>
          </div>
        </div>
      </footer>
    </>
  );
}