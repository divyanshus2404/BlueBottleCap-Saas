"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import { loadDiagnosticResult, type DiagnosticResult } from "@/src/lib/diagnostic";

const EXAM_DATE_KEY = "bluebottlecap_exam_date";

function daysUntil(iso: string): number | null {
  const target = new Date(iso + "T00:00:00");
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function todaysPlan(result: DiagnosticResult, daysLeft: number | null): string {
  const weak = result.weakTopics[0];
  const urgency =
    daysLeft === null
      ? ""
      : daysLeft <= 30
      ? " — exam crunch, double the drill."
      : daysLeft <= 90
      ? " — keep the pace."
      : "";
  return weak
    ? `45 min on ${weak} + 10 practice questions${urgency}`
    : `25 min review session + 1 timed mini-mock${urgency}`;
}

export const ReadinessCard: React.FC = () => {
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [examIso, setExamIso] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setResult(loadDiagnosticResult());
    if (typeof window !== "undefined") {
      setExamIso(localStorage.getItem(EXAM_DATE_KEY));
    }
    setHydrated(true);
  }, []);

  // Pre-hydration placeholder — keeps SSR markup consistent.
  if (!hydrated) {
    return (
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6 h-[200px] animate-pulse" />
    );
  }

  if (!result) {
    return (
      <div className="rounded-2xl border border-[var(--color-blue-ink)] bg-white p-6 shadow-[0_0_0_1px_var(--color-blue-ink)_inset]">
        <p className="bbc-eyebrow text-[var(--color-blue-ink)]">Start here</p>
        <h3 className="bbc-serif mt-2 text-[22px] tracking-[-.01em] text-[var(--color-ink)]">
          Where do you actually stand?
        </h3>
        <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
          Take a 2-minute diagnostic. We'll show your weak topics and a personalized
          daily plan instead of a generic dashboard.
        </p>
        <Link
          href="/diagnostic"
          className="bbc-btn bbc-btn-primary mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 text-[13.5px]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Take diagnostic
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  const daysLeft = examIso ? daysUntil(examIso) : null;
  const plan = todaysPlan(result, daysLeft);
  const examFormatted = examIso
    ? new Date(examIso + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="bbc-eyebrow">Readiness</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="bbc-serif text-[44px] leading-none tracking-[-.02em] text-[var(--color-ink)]">
              {result.readiness}%
            </span>
            <span className="text-[12.5px] text-[var(--color-ink-faint)]">
              ready
            </span>
          </div>
        </div>
        {examFormatted && daysLeft !== null && daysLeft >= 0 && (
          <div className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11.5px] font-semibold text-orange-800">
            <CalendarDays className="mr-1 inline h-3 w-3" />
            {daysLeft} days to {examFormatted}
          </div>
        )}
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
        <div
          className="h-2 rounded-full bg-[var(--color-blue-ink)] transition-all duration-700"
          style={{ width: `${result.readiness}%` }}
        />
      </div>

      <div className="mt-5 border-t border-[var(--color-line)] pt-4">
        <p className="bbc-mono text-[10.5px] uppercase tracking-[.14em] text-[var(--color-ink-faint)]">
          Today's plan
        </p>
        <p className="mt-1.5 text-[14.5px] text-[var(--color-ink)]">{plan}</p>

        {result.weakTopics.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="bbc-mono text-[10px] uppercase tracking-[.12em] text-[var(--color-ink-faint)]">
              Weak:
            </span>
            {result.weakTopics.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full border border-orange-200 bg-orange-50/60 px-2.5 py-0.5 text-[11.5px] font-semibold text-orange-800"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <Link
          href="/pdf-editor"
          className="bbc-btn bbc-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-[13px]"
        >
          Start today's session
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/diagnostic"
          className="text-[12px] text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
        >
          Retake diagnostic
        </Link>
      </div>
    </div>
  );
};
