"use client";

import React, { useState, useEffect } from "react";
import { getDailyQuote, getSecondsUntilMidnight } from "@/src/lib/dailyQuote";

function pad(n: number) { return String(n).padStart(2, "0"); }

export function DailyQuote({ variant = "landing" }: { variant?: "landing" | "dashboard" }) {
  const { text, author } = getDailyQuote();
  const [secs, setSecs] = useState(() => getSecondsUntilMidnight());

  useEffect(() => {
    const id = setInterval(() => setSecs(getSecondsUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  if (variant === "dashboard") {
    return (
      <div className="rounded-[14px] border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6">
        <p className="bbc-mono mb-3 text-[10.5px] uppercase tracking-[.18em] text-[var(--color-ink-faint)]">Quote of the day</p>
        <blockquote className="bbc-serif text-[18px] leading-[1.45] tracking-[-.01em] text-[var(--color-ink)]">
          &ldquo;{text}&rdquo;
        </blockquote>
        <p className="mt-3 text-[13.5px] font-medium text-[var(--color-ink-soft)]">— {author}</p>
        <div className="mt-4 flex items-center gap-2 border-t border-[var(--color-line)] pt-3">
          <span className="text-[12px] text-[var(--color-ink-faint)]">Next quote in</span>
          <span className="bbc-mono text-[13px] tabular-nums text-[var(--color-blue-ink)]">{pad(h)}:{pad(m)}:{pad(s)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] px-7 py-[72px]">
      <div className="bbc-reveal mx-auto max-w-[680px] text-center">
        <p className="bbc-mono text-[10.5px] uppercase tracking-[.2em] text-[var(--color-ink-faint)]">Daily motivation</p>
        <blockquote className="bbc-serif mt-5 text-[clamp(22px,3.2vw,34px)] leading-[1.35] tracking-[-.015em] text-[var(--color-ink)]">
          &ldquo;{text}&rdquo;
        </blockquote>
        <p className="mt-4 text-[15px] font-medium text-[var(--color-ink-soft)]">— {author}</p>
        <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-[var(--color-line)] bg-[var(--color-paper-card)] px-4 py-2">
          <span className="text-[12px] text-[var(--color-ink-faint)]">New quote in</span>
          <span className="bbc-mono text-[14px] tabular-nums text-[var(--color-blue-ink)]">{pad(h)}:{pad(m)}:{pad(s)}</span>
        </div>
      </div>
    </div>
  );
}
