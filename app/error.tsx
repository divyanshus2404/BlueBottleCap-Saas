"use client";

import React, { useEffect } from "react";
import { RotateCw, Home } from "lucide-react";

// Branded error boundary for route segments. Replaces the raw Next.js error
// overlay with an on-brand, reassuring screen and a one-tap retry.

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="bbc relative min-h-screen overflow-hidden">
      <div className="bbc-grid" aria-hidden="true" />
      <div className="relative z-[2] mx-auto flex min-h-screen max-w-[520px] flex-col items-center justify-center px-7 text-center">
        <p className="bbc-eyebrow">Something broke</p>
        <h1 className="bbc-serif mt-3 text-[clamp(28px,4vw,44px)] leading-[1.08] tracking-[-.02em]">
          This page hit a snag.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
          A rare glitch on our end — not you. Try again, or head home. If it keeps happening,
          tell us and we&apos;ll fix it fast.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button onClick={reset} className="bbc-btn bbc-btn-primary inline-flex items-center gap-2 px-6 py-3 text-[15px]">
            <RotateCw className="h-4 w-4" /> Try again
          </button>
          <a href="/" className="bbc-btn bbc-btn-ghost inline-flex items-center gap-2 px-6 py-3 text-[15px]">
            <Home className="h-4 w-4" /> Back home
          </a>
        </div>
      </div>
    </div>
  );
}
