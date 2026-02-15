"use client";



export default function ContactPage() {
  return (
    <div className="contact-page">
      {/* GlobalHeader is persistent in RootLayout */}
      <main className="contact-content">
        <h1>Contact</h1>
        <p className="contact-subtitle">Get in touch with the InsightX team.</p>
      </main>
      <style jsx>{`
        .contact-page {
          width: 100vw;
          min-height: 100vh;
          background-color: var(--bg);
          color: var(--fg);
        }
        .contact-content {
          padding: 2rem;
          max-width: 600px;
          margin: 0 auto;
        }
        .contact-content h1 {
          font-size: 2rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: var(--fg);
        }
        .contact-subtitle {
          font-size: 1rem;
          color: var(--text-muted);
          margin: 0;
        }
      `}</style>
    </div>
  );
}
