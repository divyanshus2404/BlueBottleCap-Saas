"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MOCK_TESTS, scoreMockTest, saveMockResult, type MockTestConfig, type MockTestResult } from "@/src/lib/mockTest";
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle, Minus, BarChart3, Share2, Lock, Sparkles } from "lucide-react";
import { Confetti } from "./Confetti";
import { WhatsAppShare } from "./WhatsAppShare";
import { useCountUp } from "@/src/hooks/useCountUp";
import { useAuth } from "@/src/context/AuthContext";
import { AuthModal } from "./AuthModal";
import { trackEvent } from "@/src/lib/analytics";

const FREE_TEST_LIMIT = 3;
const FREE_TESTS_KEY = "bluebottlecap_free_tests_taken";

type Phase = "select" | "test" | "result";

export function MockTest() {
  const { currentUser } = useAuth();
  const [phase, setPhase] = useState<Phase>("select");
  const [test, setTest] = useState<MockTestConfig | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [result, setResult] = useState<MockTestResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [freeTestsUsed, setFreeTestsUsed] = useState(0);

  useEffect(() => {
    setFreeTestsUsed(JSON.parse(localStorage.getItem(FREE_TESTS_KEY) || "0"));
  }, []);

  const recordFreeTest = () => {
    const next = freeTestsUsed + 1;
    setFreeTestsUsed(next);
    localStorage.setItem(FREE_TESTS_KEY, JSON.stringify(next));
  };

  const startTest = (t: MockTestConfig) => {
    if (!currentUser && freeTestsUsed >= FREE_TEST_LIMIT) {
      setShowAuthGate(true);
      trackEvent("auth_gate_shown", { trigger: "mock_test_limit", testsUsed: freeTestsUsed });
      return;
    }
    if (!currentUser) recordFreeTest();
    setTest(t);
    setIdx(0);
    setAnswers({});
    setMarked(new Set());
    setTimeLeft(t.duration * 60);
    setStartTime(Date.now());
    setPhase("test");
    trackEvent("test_started", { testId: t.id, questionCount: t.questions.length });
  };

  const submitRef = useRef(() => {});
  submitRef.current = () => {
    if (!test) return;
    clearInterval(timerRef.current);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const r = scoreMockTest(test, answers, timeTaken);
    saveMockResult(r, currentUser?.uid);
    setResult(r);
    setPhase("result");
    trackEvent("test_completed", { testId: test.id, score: r.score, maxScore: r.maxScore, pct: Math.round((r.score / r.maxScore) * 100) });
  };
  const submitTest = useCallback(() => submitRef.current(), []);

  const idxRef = useRef(idx);
  idxRef.current = idx;

  useEffect(() => {
    if (phase !== "test" || !test) return;
    const currentTest = test;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
      if (e.key >= "1" && e.key <= "4") {
        const optIdx = parseInt(e.key) - 1;
        const qId = currentTest.questions[idxRef.current].id;
        setAnswers((prev) => ({ ...prev, [qId]: prev[qId] === optIdx ? null : optIdx }));
      }
      if (e.key.toLowerCase() === "n" || e.key === "ArrowRight") setIdx((i) => Math.min(currentTest.questions.length - 1, i + 1));
      if (e.key.toLowerCase() === "p" || e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, test]);

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

        {/* Free test usage indicator */}
        {!currentUser && (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <Sparkles className="h-5 w-5 shrink-0 text-amber-500" />
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-amber-800">
                {freeTestsUsed >= FREE_TEST_LIMIT
                  ? "You've used all 3 free tests"
                  : `${FREE_TEST_LIMIT - freeTestsUsed} free test${FREE_TEST_LIMIT - freeTestsUsed === 1 ? "" : "s"} remaining`}
              </p>
              <p className="text-[11px] text-amber-600">
                {freeTestsUsed >= FREE_TEST_LIMIT
                  ? "Sign up to continue — it's free!"
                  : "Sign up for unlimited access to all mock tests."}
              </p>
            </div>
            {freeTestsUsed >= FREE_TEST_LIMIT && (
              <button
                onClick={() => setShowAuthGate(true)}
                className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-[12px] font-bold text-white transition hover:bg-amber-600"
              >
                Sign Up Free
              </button>
            )}
          </div>
        )}

        <div className="mt-8 space-y-4">
          {MOCK_TESTS.map((t) => {
            const isLocked = !currentUser && freeTestsUsed >= FREE_TEST_LIMIT;
            return (
              <button
                key={t.id}
                onClick={() => startTest(t)}
                className={`group w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-5 text-left transition ${isLocked ? "opacity-60" : "hover:border-[var(--color-blue-ink)] hover:shadow-lg"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[17px] font-bold text-[var(--color-ink)]">{t.name}</h3>
                    <p className="mt-1 text-[13px] text-[var(--color-ink-soft)]">
                      {t.questions.length} questions · {t.duration} min · +{t.marking.correct}/{t.marking.incorrect} marking
                    </p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${isLocked ? "bg-gray-100 text-gray-400" : "bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)] group-hover:bg-[var(--color-blue-ink)] group-hover:text-white"}`}>
                    {isLocked ? <Lock className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {["Physics", "Chemistry", "Maths", "Biology"].map((s) => {
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
            );
          })}
        </div>

        {/* Auth gate modal */}
        {showAuthGate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[420px] rounded-2xl bg-[var(--color-paper)] p-8 shadow-2xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-blue-wash)]">
                <Lock className="h-7 w-7 text-[var(--color-blue-ink)]" />
              </div>
              <h2 className="bbc-serif text-center text-[22px] leading-tight text-[var(--color-ink)]">
                You've used your 3 free tests
              </h2>
              <p className="mt-2 text-center text-[14px] text-[var(--color-ink-soft)]">
                Create a free account to unlock unlimited mock tests, progress tracking, and AI-powered study tools.
              </p>
              <ul className="mt-5 space-y-2">
                {["Unlimited mock tests (JEE + NEET)", "Track your progress across tests", "25 free AI tool credits", "Detailed performance analytics"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-[var(--color-ink-soft)]">
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { setShowAuthGate(false); setShowAuthModal(true); }}
                className="bbc-btn bbc-btn-primary mt-6 w-full justify-center py-3 text-[14px]"
              >
                Sign Up Free
              </button>
              <button
                onClick={() => setShowAuthGate(false)}
                className="mt-2 w-full py-2 text-center text-[12px] text-[var(--color-ink-faint)] hover:text-[var(--color-ink-soft)]"
              >
                Maybe later
              </button>
            </div>
          </div>
        )}
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
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

  const animatedScore = useCountUp(result?.score ?? 0, 1500, phase === "result");
  const animatedCorrect = useCountUp(result?.correct ?? 0, 1200, phase === "result");
  const animatedIncorrect = useCountUp(result?.incorrect ?? 0, 1200, phase === "result");
  const animatedUnanswered = useCountUp(result?.unanswered ?? 0, 1200, phase === "result");

  if (phase === "result" && result && test) {
    const pct = Math.round((result.score / result.maxScore) * 100);
    return (
      <div className="bbc mx-auto max-w-[720px] px-7 py-12">
        <Confetti active={phase === "result" && pct >= 40} />
        <p className="bbc-eyebrow">Test Complete</p>
        <h1 className="bbc-serif mt-3 text-[clamp(28px,4vw,40px)] leading-[1.1] tracking-[-.02em]">
          You scored <em className="italic font-medium text-[var(--color-blue-ink)]">{animatedScore}/{result.maxScore}</em>
        </h1>
        <p className="mt-2 text-[15px] text-[var(--color-ink-soft)]">
          {result.testName} · Completed in {formatTime(result.timeTaken)}
        </p>

        {/* Score summary cards */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
            <CheckCircle className="mx-auto h-5 w-5 text-green-600" />
            <p className="mt-1 text-[22px] font-bold text-green-700">{animatedCorrect}</p>
            <p className="text-[11px] text-green-600">Correct</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
            <XCircle className="mx-auto h-5 w-5 text-red-500" />
            <p className="mt-1 text-[22px] font-bold text-red-600">{animatedIncorrect}</p>
            <p className="text-[11px] text-red-500">Incorrect</p>
          </div>
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-4 text-center">
            <Minus className="mx-auto h-5 w-5 text-[var(--color-ink-faint)]" />
            <p className="mt-1 text-[22px] font-bold text-[var(--color-ink)]">{animatedUnanswered}</p>
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

        <div className="mt-10 flex flex-col gap-3">
          <div className="flex gap-3">
            <button onClick={() => setPhase("select")} className="bbc-btn bbc-btn-primary flex-1 justify-center py-3 text-[14px]">
              Take Another Test
            </button>
            <button
              onClick={() => {
                const text = `I scored ${result.score}/${result.maxScore} (${pct}%) on ${result.testName} at BlueBottleCap! 🎯\n\nSubject breakdown:\n${result.subjectBreakdown.map(s => `${s.subject}: ${s.correct}/${s.total}`).join("\n")}\n\nTry it yourself 👉 https://bluebottlecap.com/mock-test`;
                trackEvent("share_clicked", { method: "native", testId: result.testId });
                if (navigator.share) {
                  navigator.share({ title: "My Mock Test Score", text }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(text).then(() => {});
                }
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] px-4 py-3 text-[13px] font-bold text-[var(--color-ink-soft)] transition hover:border-[var(--color-blue-ink)] hover:text-[var(--color-blue-ink)]"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
          <WhatsAppShare
            text={`🎯 I scored ${result.score}/${result.maxScore} (${pct}%) on ${result.testName} at BlueBottleCap!\n\n📊 Subject breakdown:\n${result.subjectBreakdown.map(s => `• ${s.subject}: ${s.correct}/${s.total}`).join("\n")}\n\nPrepare for JEE/NEET free 👉 https://bluebottlecap.com/mock-test`}
            label="Share on WhatsApp"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-[14px] font-bold text-white transition hover:brightness-105"
          />
        </div>
      </div>
    );
  }

  return null;
}
