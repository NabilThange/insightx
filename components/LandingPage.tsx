"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
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
                href="/contact"
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
                Contact Us
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

      {/* ── Section 3: Social Proof / Logos ── */}
      <section style={{
        padding: "4rem 7.5rem",
        backgroundColor: "var(--bg)",
        borderBottom: "1px solid var(--stroke)",
      }}>
        <p style={{
          textAlign: "center",
          fontSize: "0.875rem",
          textTransform: "uppercase",
          letterSpacing: "0.1rem",
          marginBottom: "2rem",
          opacity: 0.7,
        }}>
          Built for payment platforms and fintech teams
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "3rem",
          alignItems: "center",
          justifyItems: "center",
        }}>
          {["UPI Platforms", "Digital Wallets", "Payment Gateways", "Neobanks", "Fintech SaaS"].map((company, i) => (
            <div key={i} style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              opacity: 0.6,
              letterSpacing: "-0.02rem",
            }}>
              {company}
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 4: Problem → Solution ── */}
      <section style={{
        padding: "6rem 7.5rem",
        backgroundColor: "var(--loader-bg)",
      }}>
        <h2 style={{
          fontSize: "3rem",
          fontWeight: "500",
          letterSpacing: "-0.05rem",
          marginBottom: "4rem",
          textAlign: "center",
        }}>
          The old way vs InsightX way
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
        }}>
          {/* Old Way */}
          <div style={{
            padding: "2rem",
            border: "1px solid var(--stroke)",
            borderRadius: "0.75rem",
            backgroundColor: "var(--bg)",
          }}>
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: "500",
              marginBottom: "1.5rem",
              opacity: 0.5,
            }}>
              The Old Way
            </h3>
            <ul style={{
              listStyle: "none",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}>
              {[
                "Wait days for analyst reports",
                "Write SQL queries yourself",
                "One dataset at a time",
                "No context between queries",
                "Manual data exports"
              ].map((item, i) => (
                <li key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  opacity: 0.7,
                }}>
                  <span style={{ fontSize: "1.25rem" }}>✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* InsightX Way */}
          <div style={{
            padding: "2rem",
            border: "2px solid var(--fg)",
            borderRadius: "0.75rem",
            backgroundColor: "var(--bg)",
          }}>
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: "500",
              marginBottom: "1.5rem",
            }}>
              The InsightX Way
            </h3>
            <ul style={{
              listStyle: "none",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}>
              {[
                "Ask in plain English",
                "Works on ANY CSV",
                "Gets smarter every query",
                "Context-aware learning",
                "27x faster on complex queries"
              ].map((item, i) => (
                <li key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                }}>
                  <span style={{ fontSize: "1.25rem" }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Section 5: USP #1 - Exploratory-First ── */}
      <section style={{
        padding: "6rem 7.5rem",
        backgroundColor: "var(--bg)",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
        }}>
          <div>
            <h2 style={{
              fontSize: "3rem",
              fontWeight: "500",
              letterSpacing: "-0.05rem",
              marginBottom: "1.5rem",
            }}>
              Upload any CSV.<br />We scan it for you.
            </h2>
            <p style={{
              fontSize: "1.125rem",
              lineHeight: "1.6",
              opacity: 0.8,
              marginBottom: "2rem",
            }}>
              No schema required. No setup. Drop your data and InsightX automatically profiles every column, detects patterns, finds anomalies, and builds a "Data DNA" artifact that guides every query.
            </p>
            <Link href="/connect" style={{
              display: "inline-block",
              padding: "1rem 2rem",
              backgroundColor: "var(--fg)",
              color: "var(--bg)",
              borderRadius: "0.375rem",
              fontWeight: "500",
              textDecoration: "none",
            }}>
              Try it now →
            </Link>
          </div>
          <div style={{
            border: "1px solid var(--stroke)",
            borderRadius: "0.75rem",
            padding: "2rem",
            backgroundColor: "var(--loader-bg)",
            minHeight: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{ textAlign: "center", opacity: 0.6 }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📊</div>
              <p>Auto-scan visualization placeholder</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 6: USP #2 - Multi-Agent Orchestration ── */}
      <section style={{
        padding: "6rem 7.5rem",
        backgroundColor: "var(--loader-bg)",
      }}>
        <h2 style={{
          fontSize: "3rem",
          fontWeight: "500",
          letterSpacing: "-0.05rem",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}>
          Multi-Agent Orchestration
        </h2>
        <p style={{
          fontSize: "1.125rem",
          textAlign: "center",
          opacity: 0.8,
          marginBottom: "3rem",
          maxWidth: "800px",
          margin: "0 auto 3rem",
        }}>
          One question. Three execution paths. The orchestrator decides whether to use SQL, Python, or both—automatically.
        </p>
        <div style={{
          border: "1px solid var(--stroke)",
          borderRadius: "0.75rem",
          padding: "3rem",
          backgroundColor: "var(--bg)",
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            width: "100%",
            maxWidth: "600px",
          }}>
            <div style={{
              textAlign: "center",
              padding: "1rem",
              border: "2px solid var(--fg)",
              borderRadius: "0.75rem",
              fontWeight: "500",
            }}>
              🧠 Orchestrator
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1rem",
            }}>
              {[
                { icon: "🐘", label: "SQL Agent", desc: "Fast aggregations" },
                { icon: "🐍", label: "Python Agent", desc: "Complex analysis" },
                { icon: "🔄", label: "Hybrid", desc: "SQL → Python" }
              ].map((agent, i) => (
                <div key={i} style={{
                  padding: "1.5rem 1rem",
                  border: "1px solid var(--stroke)",
                  borderRadius: "0.75rem",
                  textAlign: "center",
                  backgroundColor: "var(--loader-bg)",
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{agent.icon}</div>
                  <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>{agent.label}</div>
                  <div style={{ fontSize: "0.875rem", opacity: 0.7 }}>{agent.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 7: USP #3 - Context-Aware Learning ── */}
      <section style={{
        padding: "6rem 7.5rem",
        backgroundColor: "var(--bg)",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
        }}>
          <div style={{
            border: "1px solid var(--stroke)",
            borderRadius: "0.75rem",
            padding: "2rem",
            backgroundColor: "var(--loader-bg)",
            minHeight: "300px",
          }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}>
              {[
                { time: "Query 1", text: "Baseline failure rate: 2.3%" },
                { time: "Query 2", text: "Remembers baseline, compares to 4G" },
                { time: "Query 3", text: "Uses both insights for trend analysis" }
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "flex-start",
                }}>
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "var(--fg)",
                    marginTop: "0.5rem",
                    flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>{item.time}</div>
                    <div style={{ opacity: 0.7, fontSize: "0.875rem" }}>{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 style={{
              fontSize: "3rem",
              fontWeight: "500",
              letterSpacing: "-0.05rem",
              marginBottom: "1.5rem",
            }}>
              Gets smarter<br />over time
            </h2>
            <p style={{
              fontSize: "1.125rem",
              lineHeight: "1.6",
              opacity: 0.8,
            }}>
              Every query updates the "Data DNA" artifact. Baselines, anomalies, and insights accumulate—so the system remembers what you've learned and builds on it.
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 8: Live Demo Block ── */}
      <section style={{
        padding: "6rem 7.5rem",
        backgroundColor: "var(--loader-bg)",
      }}>
        <h2 style={{
          fontSize: "3rem",
          fontWeight: "500",
          letterSpacing: "-0.05rem",
          marginBottom: "3rem",
          textAlign: "center",
        }}>
          See it in action
        </h2>
        <div style={{
          border: "1px solid var(--stroke)",
          borderRadius: "0.75rem",
          overflow: "hidden",
          backgroundColor: "var(--bg)",
        }}>
          {/* Query */}
          <div style={{
            padding: "1.5rem",
            borderBottom: "1px solid var(--stroke)",
            backgroundColor: "var(--loader-bg)",
          }}>
            <div style={{ fontSize: "0.875rem", opacity: 0.7, marginBottom: "0.5rem" }}>You:</div>
            <div style={{ fontSize: "1.125rem" }}>
              Which age group has the highest transaction failure rate during peak hours?
            </div>
          </div>

          {/* Response */}
          <div style={{ padding: "2rem" }}>
            <div style={{ fontSize: "0.875rem", opacity: 0.7, marginBottom: "1rem" }}>
              🧠 Orchestrator → 🐘 SQL Agent → 🐍 Python Agent
            </div>

            <div style={{
              padding: "1.5rem",
              backgroundColor: "var(--loader-bg)",
              borderRadius: "0.75rem",
              marginBottom: "1.5rem",
            }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "500", marginBottom: "0.75rem" }}>
                The 18-25 age group shows 7.8% failure rate during peak hours
              </h3>
              <p style={{ opacity: 0.8 }}>
                Analysis of 250K transactions reveals this is 40% higher than the 4.2% baseline. Primary drivers: 64% using 4G network (vs 5G/WiFi), Android devices showing 2.1x higher failure vs iOS, and concentration during 8-9 PM peak hours.
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}>
              <div style={{
                padding: "1rem",
                border: "1px solid var(--stroke)",
                borderRadius: "0.75rem",
              }}>
                <div style={{ fontSize: "0.75rem", opacity: 0.7, marginBottom: "0.5rem" }}>SQL</div>
                <code style={{ fontSize: "0.875rem", fontFamily: "monospace" }}>
                  SELECT age_group, COUNT(*) as failures...
                </code>
              </div>
              <div style={{
                padding: "1rem",
                border: "1px solid var(--stroke)",
                borderRadius: "0.75rem",
              }}>
                <div style={{ fontSize: "0.75rem", opacity: 0.7, marginBottom: "0.5rem" }}>Python</div>
                <code style={{ fontSize: "0.875rem", fontFamily: "monospace" }}>
                  df.groupby(['age', 'hour', 'device'])...
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 9: Performance Stats ── */}
      <section style={{
        padding: "6rem 7.5rem",
        backgroundColor: "var(--bg)",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "3rem",
        }}>
          {[
            { stat: "27x", label: "Faster than manual analysis" },
            { stat: "250K", label: "Rows analyzed in <1s" },
            { stat: "3", label: "Execution paths (SQL/Python/Hybrid)" }
          ].map((item, i) => (
            <div key={i} style={{
              textAlign: "center",
              padding: "2rem",
              border: "1px solid var(--stroke)",
              borderRadius: "0.75rem",
            }}>
              <div style={{
                fontSize: "4rem",
                fontWeight: "500",
                letterSpacing: "-0.1rem",
                marginBottom: "0.5rem",
              }}>
                {item.stat}
              </div>
              <div style={{
                fontSize: "1rem",
                opacity: 0.8,
              }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 10: Pricing ── */}
      <section style={{
        padding: "6rem 7.5rem",
        backgroundColor: "var(--loader-bg)",
      }}>
        <h2 style={{
          fontSize: "3rem",
          fontWeight: "500",
          letterSpacing: "-0.05rem",
          marginBottom: "3rem",
          textAlign: "center",
        }}>
          Pricing
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          maxWidth: "900px",
          margin: "0 auto",
        }}>
          {/* Free Tier */}
          <div style={{
            padding: "2rem",
            border: "1px solid var(--stroke)",
            borderRadius: "0.75rem",
            backgroundColor: "var(--bg)",
          }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "500", marginBottom: "0.5rem" }}>Free</h3>
            <div style={{ fontSize: "3rem", fontWeight: "500", marginBottom: "1.5rem" }}>$0</div>
            <ul style={{
              listStyle: "none",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginBottom: "2rem",
            }}>
              {[
                "Up to 100K rows",
                "5 datasets",
                "Basic SQL + Python agents",
                "7-day history",
                "Community support"
              ].map((feature, i) => (
                <li key={i} style={{ display: "flex", gap: "0.5rem" }}>
                  <span>✓</span>
                  <span style={{ opacity: 0.8 }}>{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/connect" style={{
              display: "block",
              textAlign: "center",
              padding: "1rem",
              border: "1px solid var(--fg)",
              borderRadius: "0.375rem",
              fontWeight: "500",
              textDecoration: "none",
            }}>
              Get Started
            </Link>
          </div>

          {/* Pro Tier */}
          <div style={{
            padding: "2rem",
            border: "2px solid var(--fg)",
            borderRadius: "0.75rem",
            backgroundColor: "var(--bg)",
            position: "relative",
          }}>
            <div style={{
              position: "absolute",
              top: "-12px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "var(--fg)",
              color: "var(--bg)",
              padding: "0.25rem 1rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: "500",
              textTransform: "uppercase",
            }}>
              Popular
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "500", marginBottom: "0.5rem" }}>Pro</h3>
            <div style={{ fontSize: "3rem", fontWeight: "500", marginBottom: "1.5rem" }}>
              $49<span style={{ fontSize: "1rem", opacity: 0.7 }}>/month</span>
            </div>
            <ul style={{
              listStyle: "none",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginBottom: "2rem",
            }}>
              {[
                "Unlimited rows",
                "Unlimited datasets",
                "Advanced orchestration",
                "Unlimited history",
                "Priority support",
                "API access"
              ].map((feature, i) => (
                <li key={i} style={{ display: "flex", gap: "0.5rem" }}>
                  <span>✓</span>
                  <span style={{ opacity: 0.8 }}>{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/connect" style={{
              display: "block",
              textAlign: "center",
              padding: "1rem",
              backgroundColor: "var(--fg)",
              color: "var(--bg)",
              borderRadius: "0.375rem",
              fontWeight: "500",
              textDecoration: "none",
            }}>
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 11: FAQ ── */}
      <section style={{
        padding: "6rem 7.5rem",
        backgroundColor: "var(--bg)",
      }}>
        <h2 style={{
          fontSize: "3rem",
          fontWeight: "500",
          letterSpacing: "-0.05rem",
          marginBottom: "3rem",
          textAlign: "center",
        }}>
          Frequently Asked Questions
        </h2>
        <div style={{
          maxWidth: "800px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}>
          {[
            {
              q: "What file formats are supported?",
              a: "CSV, Excel (.xlsx), and direct database connections (PostgreSQL, MySQL, SQLite). Upload once and query forever."
            },
            {
              q: "Do I need SQL knowledge?",
              a: "No. Ask questions in plain English. The system automatically generates SQL, Python, or hybrid queries based on what's needed."
            },
            {
              q: "How does it get smarter over time?",
              a: "Every query updates the 'Data DNA' artifact with new insights, baselines, and patterns. Future queries leverage this accumulated knowledge for faster, more accurate responses."
            },
            {
              q: "Can I see the code?",
              a: "Yes. Every response includes the exact SQL and Python code used, which you can copy, modify, and run independently."
            },
            {
              q: "Is my data secure?",
              a: "Absolutely. All data is encrypted in transit and at rest. We never train models on your data. You can delete datasets anytime."
            }
          ].map((faq, i) => (
            <details key={i} style={{
              padding: "1.5rem",
              border: "1px solid var(--stroke)",
              borderRadius: "0.75rem",
              cursor: "pointer",
            }}>
              <summary style={{
                fontWeight: "500",
                fontSize: "1.125rem",
                cursor: "pointer",
              }}>
                {faq.q}
              </summary>
              <p style={{
                marginTop: "1rem",
                opacity: 0.8,
                lineHeight: "1.6",
              }}>
                {faq.a}
              </p>
            </details>
          ))}
        </div>
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