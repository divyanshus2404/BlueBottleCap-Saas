"use client";

import React from "react";

// Last-resort boundary: catches errors in the root layout itself. It replaces
// the whole document, so it renders its own <html>/<body> and uses inline
// styles (app CSS may not be available here). Kept minimal but on-brand.

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f4ef", fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif", color: "#181A1F" }}>
        <div style={{ maxWidth: 460, padding: "0 28px", textAlign: "center" }}>
          <div style={{ height: 5, width: 44, margin: "0 auto 20px", borderRadius: 3, background: "#1B3FCB" }} />
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 10px" }}>Something went wrong.</h1>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#55585e", margin: "0 0 22px" }}>
            An unexpected error interrupted the page. Please try again.
          </p>
          <button
            onClick={reset}
            style={{ background: "#1B3FCB", color: "#fff", border: 0, borderRadius: 10, fontWeight: 600, fontSize: 14, padding: "11px 24px", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
