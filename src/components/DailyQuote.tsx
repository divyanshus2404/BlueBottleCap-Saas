"use client";

import React, { useState, useEffect } from "react";
import { getDailyQuote, getSecondsUntilMidnight } from "@/src/lib/dailyQuote";

function pad(n: number) { return String(n).padStart(2, "0"); }

export function DailyQuote() {
  const { text, author, day } = getDailyQuote();
  const [secs, setSecs] = useState(() => getSecondsUntilMidnight());

  useEffect(() => {
    const id = setInterval(() => setSecs(getSecondsUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  return (
    <div className="mx-auto max-w-[1180px] px-7 py-[80px]">
      <div className="bbc-reveal relative mx-auto max-w-[780px] overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-paper-card)] px-8 py-12 text-center sm:px-14 sm:py-16">
        {/* Decorative large quotation mark */}
        <div className="pointer-events-none absolute -top-2 left-6 select-none sm:left-10">
          <span className="bbc-serif text-[160px] leading-none text-[var(--color-blue-ink)] opacity-[.06]">&ldquo;</span>
        </div>

        {/* Day badge */}
        <div className="relative z-[1] mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-4 py-1.5">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-blue-ink)]" />
          <span className="bbc-mono text-[10.5px] uppercase tracking-[.18em] text-[var(--color-ink-faint)]">Day {day} — Daily spark</span>
        </div>

        {/* Quote */}
        <blockquote className="bbc-serif relative z-[1] text-[clamp(20px,3vw,30px)] leading-[1.4] tracking-[-.01em] text-[var(--color-ink)]">
          &ldquo;{text}&rdquo;
        </blockquote>

        {/* Author */}
        <p className="relative z-[1] mt-5 text-[15px] font-semibold text-[var(--color-blue-ink)]">— {author}</p>

        {/* Separator line */}
        <div className="relative z-[1] mx-auto mt-8 h-px w-16 bg-[var(--color-line)]" />

        {/* Countdown */}
        <div className="relative z-[1] mt-6 flex flex-col items-center gap-2">
          <span className="text-[11.5px] text-[var(--color-ink-faint)]">Tomorrow&apos;s quote drops in</span>
          <div className="flex items-center gap-1.5">
            {[
              { val: pad(h), label: "h" },
              { val: pad(m), label: "m" },
              { val: pad(s), label: "s" },
            ].map((u) => (
              <React.Fragment key={u.label}>
                <div className="flex flex-col items-center rounded-[8px] bg-white px-3 py-1.5 shadow-sm">
                  <span className="bbc-mono text-[20px] tabular-nums font-semibold text-[var(--color-ink)]">{u.val}</span>
                  <span className="bbc-mono text-[9px] uppercase tracking-[.15em] text-[var(--color-ink-faint)]">{u.label}</span>
                </div>
                {u.label !== "s" && <span className="text-[18px] font-bold text-[var(--color-ink-faint)]">:</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
