"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MOCK_TESTS, scoreMockTest, saveMockResult, type MockTestConfig, type MockTestResult } from "@/src/lib/mockTest";
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle, Minus, BarChart3 } from "lucide-react";

type Phase = "select" | "test" | "result";

export function MockTest() {
  const [phase, setPhase] = useState<Phase>("select");
  const [test, setTest] = useState<MockTestConfig | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [result, setResult] = useState<MockTestResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const startTest = (t: MockTestConfig) => {
    setTest(t);
    setIdx(0);
    setAnswers({});
    setMarked(new Set());
    setTimeLeft(t.duration * 60);
    setStartTime(Date.now());
    setPhase("test");
  };

  const submitRef = useRef(() => {});
  submitRef.current = () => {
    if (!test) return;
    clearInterval(timerRef.current);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const r = scoreMockTest(test, answers, timeTaken);
    saveMockResult(r);
    setResult(r);
    setPhase("result");
  };
  const submitTest = useCallback(() => submitRef.current(), []);

  useEffect(() => {
    if (phase !== "test") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (phase === "select") {
    return (
      <div className="bbc mx-auto max-w-[720px] px-7 py-12">
        <p className="bbc-eyebrow">Mock Tests</p>
        <h1 className="bbc-serif mt-3 text-[clamp(28px,4vw,42px)] leading-[1.08] tracking-[-.02em]">
          Test yourself under real conditions
        </h1>
        <p className="mt-4 max-w-[50ch] text-[15px] text-[var(--color-ink-soft)]">
          Timed tests with JEE marking scheme (+4, -1). Pick a set and start — no pausing allowed.
        </p>

        <div className="mt-8 space-y-4">
          {MOCK_TESTS.map((t) => (
            <button
              key={t.id}
              onClick={() => startTest(t)}
              className="group w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-5 text-left transition hover:border-[var(--color-blue-ink)] hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[17px] font-bold text-[var(--color-ink)]">{t.name}</h3>
                  <p className="mt-1 text-[13px] text-[var(--color-ink-soft)]">
                    {t.questions.length} questions · {t.duration} min · +{t.marking.correct}/{t.marking.incorrect} marking
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)] transition group-hover:bg-[var(--color-blue-ink)] group-hover:text-white">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {["Physics", "Chemistry", "Maths"].map((s) => {
                  const count = t.questions.filter((q) => q.subject === s).length;
                  if (!count) return null;
                  return (
                    <span key={s} className="rounded-full bg-[var(--color-blue-wash)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-blue-ink)]">
                      {s}: {count}
                    </span>
                  );
                })}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "test" && test) {
    const q = test.questions[idx];
    const isUrgent = timeLeft < 120;
    const answered = Object.values(answers).filter((a) => a !== null && a !== undefined).length;

    return (
      <div className="bbc min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3">
          <div className="mx-auto flex max-w-[900px] items-center justify-between">
            <p className="text-[13px] font-bold text-[var(--color-ink)]">{test.name}</p>
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-bold ${isUrgent ? "bg-red-100 text-red-600 animate-pulse" : "bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]"}`}>
              <Clock className="h-3.5 w-3.5" />
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={submitTest}
              className="rounded-xl bg-[var(--color-blue-ink)] px-4 py-2 text-[12px] font-bold text-white transition hover:brightness-110"
            >
              Submit Test
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-[900px] px-4 py-6">
          <div className="flex gap-6">
            {/* Question panel */}
            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[12px] font-bold uppercase tracking-[.14em] text-[var(--color-ink-faint)]">
                  Q{idx + 1} of {test.questions.length} · {q.subject} · {q.topic}
                </p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${q.difficulty === "hard" ? "bg-red-100 text-red-600" : q.difficulty === "medium" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                  {q.difficulty}
                </span>
              </div>

              <h2 className="bbc-serif text-[20px] leading-[1.35]">{q.prompt}</h2>

              <div className="mt-5 space-y-2.5">
                {q.options.map((opt, i) => {
                  const selected = answers[q.id] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: selected ? null : i }))}
                      className={`w-full rounded-xl border p-4 text-left text-[14px] transition ${
                        selected
                          ? "border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)] font-semibold text-[var(--color-ink)]"
                          : "border-[var(--color-line)] bg-[var(--color-paper-card)] text-[var(--color-ink-soft)] hover:border-[var(--color-line-strong)]"
                      }`}
                    >
                      <span className="mr-3 text-[11px] font-bold text-[var(--color-ink-faint)]">{String.fromCharCode(65 + i)}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setIdx((i) => Math.max(0, i - 1))}
                  disabled={idx === 0}
                  className="flex items-center gap-1 text-[13px] font-semibold text-[var(--color-ink-soft)] disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <button
                  onClick={() => setMarked((prev) => { const s = new Set(prev); s.has(q.id) ? s.delete(q.id) : s.add(q.id); return s; })}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${marked.has(q.id) ? "bg-amber-100 text-amber-700" : "text-[var(--color-ink-faint)] hover:bg-[var(--color-paper-card)]"}`}
                >
                  <Flag className="h-3.5 w-3.5" /> {marked.has(q.id) ? "Marked" : "Mark for review"}
                </button>
                <button
                  onClick={() => setIdx((i) => Math.min(test.questions.length - 1, i + 1))}
                  disabled={idx === test.questions.length - 1}
                  className="flex items-center gap-1 text-[13px] font-semibold text-[var(--color-ink-soft)] disabled:opacity-30"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Question palette - desktop only */}
            <div className="hidden w-[200px] shrink-0 md:block">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[.14em] text-[var(--color-ink-faint)]">Questions</p>
              <div className="grid grid-cols-5 gap-1.5">
                {test.questions.map((tq, i) => {
                  const isAnswered = answers[tq.id] !== null && answers[tq.id] !== undefined;
                  const isMarked = marked.has(tq.id);
                  const isCurrent = i === idx;
                  return (
                    <button
                      key={tq.id}
                      onClick={() => setIdx(i)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold transition ${
                        isCurrent ? "ring-2 ring-[var(--color-blue-ink)]" : ""
                      } ${
                        isMarked ? "bg-amber-100 text-amber-700" :
                        isAnswered ? "bg-[var(--color-blue-ink)] text-white" :
                        "bg-[var(--color-paper-card)] text-[var(--color-ink-faint)] border border-[var(--color-line)]"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 space-y-1.5 text-[10px] text-[var(--color-ink-faint)]">
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-[var(--color-blue-ink)]" /> Answered ({answered})</div>
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-amber-100" /> Marked ({marked.size})</div>
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded border border-[var(--color-line)] bg-[var(--color-paper-card)]" /> Not visited</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "result" && result && test) {
    const pct = Math.round((result.score / result.maxScore) * 100);
    return (
      <div className="bbc mx-auto max-w-[720px] px-7 py-12">
        <p className="bbc-eyebrow">Test Complete</p>
        <h1 className="bbc-serif mt-3 text-[clamp(28px,4vw,40px)] leading-[1.1] tracking-[-.02em]">
          You scored <em className="italic font-medium text-[var(--color-blue-ink)]">{result.score}/{result.maxScore}</em>
        </h1>
        <p className="mt-2 text-[15px] text-[var(--color-ink-soft)]">
          {result.testName} · Completed in {formatTime(result.timeTaken)}
        </p>

        {/* Score summary cards */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
            <CheckCircle className="mx-auto h-5 w-5 text-green-600" />
            <p className="mt-1 text-[22px] font-bold text-green-700">{result.correct}</p>
            <p className="text-[11px] text-green-600">Correct</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
            <XCircle className="mx-auto h-5 w-5 text-red-500" />
            <p className="mt-1 text-[22px] font-bold text-red-600">{result.incorrect}</p>
            <p className="text-[11px] text-red-500">Incorrect</p>
          </div>
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-4 text-center">
            <Minus className="mx-auto h-5 w-5 text-[var(--color-ink-faint)]" />
            <p className="mt-1 text-[22px] font-bold text-[var(--color-ink)]">{result.unanswered}</p>
            <p className="text-[11px] text-[var(--color-ink-faint)]">Skipped</p>
          </div>
        </div>

        {/* Subject breakdown */}
        <div className="mt-8">
          <h3 className="flex items-center gap-2 text-[14px] font-bold text-[var(--color-ink)]">
            <BarChart3 className="h-4 w-4 text-[var(--color-blue-ink)]" /> Subject Breakdown
          </h3>
          <div className="mt-4 space-y-3">
            {result.subjectBreakdown.map((s) => {
              const subPct = Math.round((s.correct / s.total) * 100);
              return (
                <div key={s.subject}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-semibold text-[var(--color-ink)]">{s.subject}</span>
                    <span className="font-bold text-[var(--color-blue-ink)]">{s.correct}/{s.total} ({subPct}%)</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--color-line)]">
                    <div className="h-2 rounded-full bg-[var(--color-blue-ink)] transition-all" style={{ width: `${subPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Answer review */}
        <div className="mt-8">
          <h3 className="text-[14px] font-bold text-[var(--color-ink)]">Answer Key</h3>
          <div className="mt-4 space-y-3">
            {test.questions.map((q, i) => {
              const userAns = result.answers[q.id];
              const isCorrect = userAns === q.correct;
              const isSkipped = userAns === null || userAns === undefined;
              return (
                <div key={q.id} className={`rounded-xl border p-4 ${isCorrect ? "border-green-200 bg-green-50/50" : isSkipped ? "border-[var(--color-line)] bg-[var(--color-paper-card)]" : "border-red-200 bg-red-50/50"}`}>
                  <p className="text-[12px] font-bold text-[var(--color-ink-faint)]">Q{i + 1} · {q.subject} · {q.topic}</p>
                  <p className="mt-1 text-[14px] font-medium text-[var(--color-ink)]">{q.prompt}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
                    <span className={`rounded-full px-2 py-0.5 font-bold ${isCorrect ? "bg-green-100 text-green-700" : isSkipped ? "bg-gray-100 text-gray-500" : "bg-red-100 text-red-600"}`}>
                      {isCorrect ? "✓ Correct" : isSkipped ? "— Skipped" : `✗ You: ${String.fromCharCode(65 + (userAns ?? 0))}`}
                    </span>
                    {!isCorrect && <span className="rounded-full bg-green-100 px-2 py-0.5 font-bold text-green-700">Answer: {String.fromCharCode(65 + q.correct)}</span>}
                  </div>
                  <p className="mt-2 text-[12px] text-[var(--color-ink-soft)]">{q.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex gap-3">
          <button onClick={() => setPhase("select")} className="bbc-btn bbc-btn-primary flex-1 justify-center py-3 text-[14px]">
            Take Another Test
          </button>
        </div>
      </div>
    );
  }

  return null;
}
