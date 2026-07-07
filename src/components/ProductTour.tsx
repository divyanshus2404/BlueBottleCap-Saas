"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, FileText, Brain, Timer, BarChart3, BookOpen, Newspaper, CheckCircle, Flame, Clock, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";

const SLIDES = [
  { id: "intro", label: "Welcome" },
  { id: "mocks", label: "Mock Tests" },
  { id: "tools", label: "AI Tools" },
  { id: "flashcards", label: "Flashcards" },
  { id: "progress", label: "Progress" },
  { id: "pyq", label: "Past Papers" },
  { id: "cta", label: "Get Started" },
];

const Slide = ({ index, cur, children }: { index: number; cur: number; children: React.ReactNode }) => (
  <div
    className={`absolute inset-0 flex flex-col items-center justify-center px-6 sm:px-10 py-10 transition-all duration-500 ${
      cur === index ? "opacity-100 translate-x-0" : index < cur ? "opacity-0 -translate-x-16" : "opacity-0 translate-x-16"
    }`}
    style={{ pointerEvents: cur === index ? "auto" : "none" }}
  >
    {children}
  </div>
);

export function ProductTour() {
  const [cur, setCur] = useState(0);
  const [auto, setAuto] = useState(true);
  const [flashRevealed, setFlashRevealed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const [counters, setCounters] = useState({ streak: 0, score: 0, hours: 0, pct: 0 });
  const animatedRef = useRef(false);

  const goTo = useCallback((i: number) => {
    if (i < 0 || i >= SLIDES.length) return;
    setCur(i);
    setFlashRevealed(false);
    animatedRef.current = false;
  }, []);

  useEffect(() => {
    if (!auto) return;
    timerRef.current = setInterval(() => {
      setCur((c) => {
        if (c >= SLIDES.length - 1) {
          setAuto(false);
          return c;
        }
        setFlashRevealed(false);
        animatedRef.current = false;
        return c + 1;
      });
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [auto]);

  useEffect(() => {
    if (cur === 3) {
      const t = setTimeout(() => setFlashRevealed(true), 1000);
      return () => clearTimeout(t);
    }
  }, [cur]);

  useEffect(() => {
    if (cur === 4 && !animatedRef.current) {
      animatedRef.current = true;
      const targets = { streak: 12, score: 76, hours: 48, pct: 70 };
      let frame = 0;
      const iv = setInterval(() => {
        frame++;
        setCounters({
          streak: Math.min(Math.round((frame / 30) * targets.streak), targets.streak),
          score: Math.min(Math.round((frame / 30) * targets.score), targets.score),
          hours: Math.min(Math.round((frame / 30) * targets.hours), targets.hours),
          pct: Math.min(Math.round((frame / 30) * targets.pct), targets.pct),
        });
        if (frame >= 30) clearInterval(iv);
      }, 40);
      return () => clearInterval(iv);
    }
  }, [cur]);

  const dots = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
    left: `${10 + Math.random() * 80}%`,
    top: `${10 + Math.random() * 80}%`,
    animation: `float ${6 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 4}s`,
  })), []);

  return (
    <div className="bbc mx-auto max-w-[820px] px-4 py-8 sm:py-12">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-xl" style={{ minHeight: 500 }}>
        {/* Decorative dots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {dots.map((style, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[var(--color-blue-ink)] opacity-[0.07]"
              style={style}
            />
          ))}
        </div>

        {/* Autoplay toggle */}
        <button
          onClick={() => setAuto((a) => !a)}
          className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-paper)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition cursor-pointer"
        >
          {auto ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {auto ? "Pause" : "Play"}
        </button>

        {/* Slide 0: Intro */}
        <Slide cur={cur} index={0}>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-blue-wash)] mb-6">
            <span className="text-4xl">🧪</span>
          </div>
          <h1 className="bbc-serif text-center text-[clamp(24px,4vw,36px)] leading-[1.1] tracking-[-0.02em]">
            Welcome to <span className="text-[var(--color-blue-ink)]">BlueBottleCap</span>
          </h1>
          <p className="mt-3 max-w-md text-center text-[15px] text-[var(--color-ink-soft)] leading-relaxed">
            Your AI-powered exam prep companion for <strong>JEE</strong> and <strong>NEET</strong>.
            Practice smarter, track progress, and crack your dream entrance exam.
          </p>
        </Slide>

        {/* Slide 1: Mock Tests */}
        <Slide cur={cur} index={1}>
          <h2 className="bbc-serif text-center text-[clamp(22px,3.5vw,30px)] leading-[1.1] tracking-[-0.02em] mb-1">
            <FileText className="inline w-6 h-6 text-[var(--color-blue-ink)] mr-2 -mt-1" />
            Real <span className="text-[var(--color-blue-ink)]">Mock Tests</span>
          </h2>
          <p className="text-[13px] text-[var(--color-ink-soft)] text-center mb-5">Timed tests with actual JEE/NEET marking (+4, −1)</p>
          <div className="w-full max-w-md rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-5 text-left">
            <p className="text-[13px] font-semibold text-[var(--color-ink)] leading-snug mb-4">
              If a ball is thrown vertically upward with velocity u, the maximum height reached is:
            </p>
            {["u/2g", "u²/g", "u²/2g", "2u²/g"].map((opt, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 mb-2 text-[13px] transition-all duration-500 ${
                  i === 2
                    ? "border-emerald-400 bg-emerald-50 font-semibold text-emerald-800"
                    : "border-[var(--color-line)] text-[var(--color-ink-soft)]"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  i === 2 ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
                }`}>
                  {i === 2 && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                {opt}
              </div>
            ))}
            <div className="mt-3 h-1 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-[var(--color-blue-ink)] animate-[timerGo_4s_linear_forwards]" />
            </div>
          </div>
        </Slide>

        {/* Slide 2: AI Tools */}
        <Slide cur={cur} index={2}>
          <h2 className="bbc-serif text-center text-[clamp(22px,3.5vw,30px)] leading-[1.1] tracking-[-0.02em] mb-1">
            🤖 AI-Powered <span className="text-[var(--color-blue-ink)]">Study Tools</span>
          </h2>
          <p className="text-[13px] text-[var(--color-ink-soft)] text-center mb-5">From PDF analysis to AI tutoring — tools that actually help</p>
          <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
            {[
              { icon: <FileText className="w-6 h-6" />, label: "PDF Copilot", sub: "Chat with PDFs" },
              { icon: <Brain className="w-6 h-6" />, label: "Flashcards", sub: "Spaced repetition" },
              { icon: <Timer className="w-6 h-6" />, label: "Study Timer", sub: "Pomodoro mode" },
              { icon: <BarChart3 className="w-6 h-6" />, label: "Progress", sub: "Track everything" },
              { icon: <BookOpen className="w-6 h-6" />, label: "Question Bank", sub: "By topic & level" },
              { icon: <Newspaper className="w-6 h-6" />, label: "Study Blog", sub: "Tips & strategies" },
            ].map((t, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="text-[var(--color-blue-ink)] mb-2">{t.icon}</div>
                <p className="text-[12px] font-semibold text-[var(--color-ink)]">{t.label}</p>
                <p className="text-[10px] text-[var(--color-ink-faint)] mt-0.5">{t.sub}</p>
              </div>
            ))}
          </div>
        </Slide>

        {/* Slide 3: Flashcards */}
        <Slide cur={cur} index={3}>
          <h2 className="bbc-serif text-center text-[clamp(22px,3.5vw,30px)] leading-[1.1] tracking-[-0.02em] mb-1">
            <Brain className="inline w-6 h-6 text-[var(--color-blue-ink)] mr-2 -mt-1" />
            Smart <span className="text-[var(--color-blue-ink)]">Flashcards</span>
          </h2>
          <p className="text-[13px] text-[var(--color-ink-soft)] text-center mb-5">SM-2 spaced repetition — reviews cards right when you're about to forget</p>
          <div className="w-full max-w-md rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-5 text-center">
            <p className="text-[11px] font-semibold text-[var(--color-ink-faint)] uppercase tracking-wider mb-2">Physics → Thermodynamics</p>
            <p className="text-[17px] font-bold text-[var(--color-ink)] leading-snug mb-4">What is the first law of thermodynamics?</p>
            <div
              className={`rounded-lg bg-[var(--color-blue-wash)] p-4 text-[13px] text-[var(--color-ink)] leading-relaxed transition-all duration-500 ${
                flashRevealed ? "opacity-100 max-h-24" : "opacity-0 max-h-0 overflow-hidden"
              }`}
            >
              Energy can neither be created nor destroyed — it can only change form. <strong>ΔU = Q − W</strong>
            </div>
            <div className="flex gap-2 mt-4 justify-center">
              {[
                { label: "Again", color: "bg-red-500" },
                { label: "Hard", color: "bg-amber-500" },
                { label: "Good", color: "bg-emerald-500" },
                { label: "Easy", color: "bg-[var(--color-blue-ink)]" },
              ].map((b) => (
                <span key={b.label} className={`${b.color} text-white px-4 py-1.5 rounded-lg text-[11px] font-bold`}>
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </Slide>

        {/* Slide 4: Progress */}
        <Slide cur={cur} index={4}>
          <h2 className="bbc-serif text-center text-[clamp(22px,3.5vw,30px)] leading-[1.1] tracking-[-0.02em] mb-1">
            📈 Track Your <span className="text-[var(--color-blue-ink)]">Progress</span>
          </h2>
          <p className="text-[13px] text-[var(--color-ink-soft)] text-center mb-5">Streaks, scores, and study hours at a glance</p>
          <div className="flex gap-4 justify-center flex-wrap">
            {[
              { icon: <Flame className="w-5 h-5 text-amber-500" />, val: counters.streak, label: "Day Streak", color: "text-amber-600" },
              { icon: <Trophy className="w-5 h-5 text-emerald-500" />, val: counters.score, label: "Avg Score %", color: "text-emerald-600" },
              { icon: <Clock className="w-5 h-5 text-[var(--color-blue-ink)]" />, val: counters.hours, label: "Study Hours", color: "text-[var(--color-blue-ink)]" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] px-5 py-4 text-center min-w-[110px]">
                <div className="flex justify-center mb-2">{s.icon}</div>
                <p className={`text-3xl font-extrabold tabular-nums ${s.color}`}>{s.val}</p>
                <p className="text-[10px] font-semibold text-[var(--color-ink-faint)] uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="relative mt-6" style={{ width: 120, height: 120 }}>
            <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-line)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke="var(--color-blue-ink)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={2 * Math.PI * 52 * (1 - counters.pct / 100)}
                style={{ transition: "stroke-dashoffset 0.3s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-[var(--color-ink)]">
              {counters.pct}%
            </div>
          </div>
        </Slide>

        {/* Slide 5: PYQ */}
        <Slide cur={cur} index={5}>
          <h2 className="bbc-serif text-center text-[clamp(22px,3.5vw,30px)] leading-[1.1] tracking-[-0.02em] mb-1">
            📋 Previous Year <span className="text-[var(--color-blue-ink)]">Papers</span>
          </h2>
          <p className="text-[13px] text-[var(--color-ink-soft)] text-center mb-5">Practice with actual JEE Mains & NEET papers</p>
          <div className="flex gap-3 flex-wrap justify-center">
            {[
              { icon: "📝", label: "JEE Mains 2025", sub: "15 questions" },
              { icon: "📝", label: "JEE Mains 2024", sub: "9 questions" },
              { icon: "🧬", label: "NEET 2025", sub: "10 questions" },
            ].map((p) => (
              <div key={p.label} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4 text-center min-w-[140px] transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="text-2xl">{p.icon}</span>
                <p className="text-[12px] font-semibold text-[var(--color-ink)] mt-2">{p.label}</p>
                <p className="text-[10px] text-[var(--color-ink-faint)] mt-0.5">{p.sub}</p>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-[var(--color-ink-faint)] mt-4">More papers added regularly.</p>
        </Slide>

        {/* Slide 6: CTA */}
        <Slide cur={cur} index={6}>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-blue-wash)] mb-6">
            <span className="text-4xl">🚀</span>
          </div>
          <h1 className="bbc-serif text-center text-[clamp(24px,4vw,36px)] leading-[1.1] tracking-[-0.02em]">
            Start Preparing <span className="text-[var(--color-blue-ink)]">Today</span>
          </h1>
          <p className="mt-3 max-w-md text-center text-[15px] text-[var(--color-ink-soft)] leading-relaxed">
            Free to start. No credit card required. Join thousands of JEE & NEET aspirants already using BlueBottleCap.
          </p>
          <Link
            href="/mock-test"
            className="bbc-btn bbc-btn-primary mt-6 px-7 py-3 text-[15px] justify-center gap-2"
          >
            Take a Free Mock Test <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-[11px] text-[var(--color-ink-faint)] mt-3">Free plan · 3 mock tests · All study tools</p>
        </Slide>

        {/* Navigation controls */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 z-10">
          <button
            onClick={() => goTo(cur - 1)}
            disabled={cur === 0}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-blue-ink)] transition disabled:opacity-30 disabled:cursor-default cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === cur ? "w-6 bg-[var(--color-blue-ink)]" : "w-2 bg-[var(--color-line)] hover:bg-[var(--color-ink-faint)]"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => goTo(cur + 1)}
            disabled={cur === SLIDES.length - 1}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-blue-ink)] transition disabled:opacity-30 disabled:cursor-default cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide labels */}
      <div className="mt-4 flex justify-center gap-2 flex-wrap">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition cursor-pointer ${
              i === cur
                ? "bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]"
                : "text-[var(--color-ink-faint)] hover:text-[var(--color-ink-soft)]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-30px) translateX(10px); }
        }
        @keyframes timerGo {
          from { width: 0%; }
          to { width: 72%; }
        }
      `}</style>
    </div>
  );
}
