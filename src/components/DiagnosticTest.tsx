"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  QUESTION_BANK,
  scoreDiagnostic,
  saveDiagnosticResult,
  type DiagnosticResult,
} from "@/src/lib/diagnostic";

type Phase = "intro" | "question" | "result";

export const DiagnosticTest: React.FC = () => {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const q = QUESTION_BANK[idx];
  const progress = ((idx + (picked === null ? 0 : 1)) / QUESTION_BANK.length) * 100;

  const submitPick = () => {
    if (picked === null) return;
    const nextAnswers = { ...answers, [q.id]: picked };
    setAnswers(nextAnswers);
    if (idx + 1 < QUESTION_BANK.length) {
      setIdx(idx + 1);
      // Restore the user's prior pick for that question if they're returning
      // to it via Next after a Back — same behavior as the Back handler.
      setPicked(nextAnswers[QUESTION_BANK[idx + 1].id] ?? null);
    } else {
      const r = scoreDiagnostic(nextAnswers);
      saveDiagnosticResult(r);
      submitToInstitute(r);
      setResult(r);
      setPhase("result");
    }
  };

  // If the student arrived via an institute-coded link (/diagnostic?inst=xyz),
  // send their per-topic scores so the institute's batch report can aggregate
  // them. Fire-and-forget and fully anonymous — never blocks the result screen.
  const submitToInstitute = (r: DiagnosticResult) => {
    if (typeof window === "undefined") return;
    const inst = new URLSearchParams(window.location.search).get("inst");
    if (!inst) return;
    fetch("/api/institute/diagnostic-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inst,
        readiness: r.readiness,
        topics: r.topicScores.map((t) => ({ topic: t.topic, subject: t.subject, correct: t.correct, total: t.total })),
      }),
    }).catch(() => {});
  };

  return (
    <div className="bbc mx-auto max-w-[720px] px-7 py-12 md:py-16">
      {phase === "intro" && (
        <div className="text-center">
          <p className="bbc-eyebrow">Diagnostic · 2 minutes</p>
          <h1 className="bbc-serif mt-3 text-[clamp(28px,4vw,42px)] leading-[1.08] tracking-[-.02em]">
            Where do you actually stand?
          </h1>
          <p className="mx-auto mt-4 max-w-[44ch] text-[16px] text-[var(--color-ink-soft)]">
            5 questions across Physics, Chemistry, and Maths. No login. We use it to
            personalize your daily plan and show how close you are to exam-ready.
          </p>
          <button
            onClick={() => setPhase("question")}
            className="bbc-btn bbc-btn-primary mt-7 px-7 py-3 text-[15px]"
          >
            Start diagnostic
          </button>
          <p className="mt-3 text-[12.5px] text-[var(--color-ink-faint)]">
            Honest answers only — wrong answers help us help you more.
          </p>
        </div>
      )}

      {phase === "question" && q && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="bbc-mono text-[11px] uppercase tracking-[.14em] text-[var(--color-ink-faint)]">
              Question {idx + 1} of {QUESTION_BANK.length}
            </p>
            <p className="bbc-mono text-[11px] text-[var(--color-ink-faint)]">
              {q.subject} · {q.topic}
            </p>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
            <div
              className="h-1 rounded-full bg-[var(--color-blue-ink)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h2 className="bbc-serif mt-7 text-[22px] leading-[1.3] tracking-[-.005em]">
            {q.prompt}
          </h2>

          <div className="mt-6 space-y-2.5">
            {q.options.map((opt, i) => {
              const selected = picked === i;
              return (
                <button
                  key={i}
                  onClick={() => setPicked(i)}
                  className={`w-full rounded-xl border p-4 text-left text-[14.5px] transition ${
                    selected
                      ? "border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)] text-[var(--color-ink)]"
                      : "border-[var(--color-line)] bg-white text-[var(--color-ink-soft)] hover:border-[var(--color-line-strong)]"
                  }`}
                >
                  <span className="bbc-mono mr-3 text-[11px] text-[var(--color-ink-faint)]">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="mt-7 flex items-center justify-between">
            <button
              onClick={() => {
                if (idx > 0) {
                  setIdx(idx - 1);
                  setPicked(answers[QUESTION_BANK[idx - 1].id] ?? null);
                }
              }}
              disabled={idx === 0}
              className="text-[13px] text-[var(--color-ink-faint)] disabled:opacity-40 hover:text-[var(--color-ink)]"
            >
              ← Back
            </button>
            <button
              onClick={submitPick}
              disabled={picked === null}
              className="bbc-btn bbc-btn-primary px-6 py-2.5 text-[14px] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {idx + 1 === QUESTION_BANK.length ? "See my readiness" : "Next →"}
            </button>
          </div>
        </div>
      )}

      {phase === "result" && result && (
        <div>
          <p className="bbc-eyebrow">Your starting line</p>
          <h2 className="bbc-serif mt-3 text-[clamp(28px,4vw,40px)] leading-[1.1] tracking-[-.02em]">
            You're <em className="italic font-medium text-[var(--color-blue-ink)]">{result.readiness}% ready</em> today.
          </h2>
          <p className="mt-4 text-[15px] text-[var(--color-ink-soft)]">
            Day-one number. It moves up as you study — and we'll show you exactly which
            topics to drill first to push it.
          </p>

          {result.weakTopics.length > 0 && (
            <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50/60 p-5">
              <p className="bbc-mono text-[10.5px] uppercase tracking-[.14em] text-orange-700">
                Drill these first
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {result.weakTopics.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-orange-200 bg-white px-3 py-1 text-[13px] font-semibold text-orange-800"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.strongTopics.length > 0 && (
            <div className="mt-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-5">
              <p className="bbc-mono text-[10.5px] uppercase tracking-[.14em] text-[var(--color-ink-faint)]">
                Already strong
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {result.strongTopics.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-[var(--color-line)] bg-white px-3 py-1 text-[13px] font-semibold text-[var(--color-blue-deep)]"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => router.push("/dashboard")}
              className="bbc-btn bbc-btn-primary justify-center px-6 py-3 text-[15px]"
            >
              Go to my plan
            </button>
            <button
              onClick={() => router.push("/pdf-editor")}
              className="bbc-btn bbc-btn-ghost justify-center px-6 py-3 text-[15px]"
            >
              Open PDF Copilot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
