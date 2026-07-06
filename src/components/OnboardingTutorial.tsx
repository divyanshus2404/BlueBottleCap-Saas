"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles, BookOpen, Layers, Map, Zap, FileText, Brain, Target, Trophy, Clock } from "lucide-react";

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  tip: string;
}

const STEPS: Step[] = [
  {
    icon: <Target className="h-7 w-7" />,
    title: "JEE Readiness Diagnostic",
    description: "Take a free 2-minute diagnostic to find out exactly where you stand. We use your results to personalize your entire study plan.",
    tip: "Go to /diagnostic anytime to retake it and track your progress.",
  },
  {
    icon: <Map className="h-7 w-7" />,
    title: "Your Dashboard",
    description: "Your command center — track streaks, view daily activity, monitor AI credits, and see your personalized study recommendations all in one place.",
    tip: "Visit daily to keep your streak alive and earn bonus credits!",
  },
  {
    icon: <Sparkles className="h-7 w-7" />,
    title: "PDF Copilot",
    description: "Upload any textbook PDF and chat with it using AI. Ask questions, get summaries, generate flashcards — it's like having a tutor for every chapter.",
    tip: "Free plan includes 3 PDF slots. Upgrade for unlimited.",
  },
  {
    icon: <Layers className="h-7 w-7" />,
    title: "Study Tools",
    description: "Access flashcard decks, formula sheets, previous year papers, and AI-powered practice questions — all organized by subject and topic.",
    tip: "Use the AI query tool to get step-by-step solutions instantly.",
  },
  {
    icon: <Clock className="h-7 w-7" />,
    title: "Timed Mock Tests",
    description: "Take JEE-style mock tests with real +4/-1 marking. Mini mocks (30 min) and full papers (60 min) with instant answer review and subject-wise breakdown.",
    tip: "Go to /mock-test to start. Track your scores and compete on the leaderboard!",
  },
  {
    icon: <Brain className="h-7 w-7" />,
    title: "Smart Streaks & Gamification",
    description: "Study every day to build your streak. Longer streaks unlock rewards. Miss a day? You get one free streak save per month — or buy a save to protect your run.",
    tip: "Streaks keep you consistent — the #1 predictor of JEE success.",
  },
  {
    icon: <Zap className="h-7 w-7" />,
    title: "Referrals & Rewards",
    description: "Invite friends and earn bonus AI credits for every sign-up. The more friends you bring, the more credits you unlock.",
    tip: "Share your referral link from the dashboard to start earning.",
  },
];

const STORAGE_KEY = "bluebottlecap_tutorial_done";

export function OnboardingTutorial() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setVisible(true);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Progress bar */}
        <div className="h-1 bg-[var(--color-line)]">
          <div
            className="h-1 bg-[var(--color-blue-ink)] transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Skip / Close */}
        <button
          onClick={dismiss}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="Skip tutorial"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="px-7 pb-6 pt-8">
          {/* Step counter */}
          <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[var(--color-ink-faint)]">
            {step + 1} of {STEPS.length}
          </p>

          {/* Icon */}
          <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]">
            {current.icon}
          </div>

          {/* Title & description */}
          <h2 className="mt-4 text-[22px] font-bold leading-tight tracking-[-.02em] text-[var(--color-ink)]">
            {current.title}
          </h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--color-ink-soft)]">
            {current.description}
          </p>

          {/* Tip */}
          <div className="mt-4 rounded-xl bg-[var(--color-blue-wash)] px-4 py-3">
            <p className="text-[13px] font-medium text-[var(--color-blue-ink)]">
              💡 {current.tip}
            </p>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-1 text-[13px] font-semibold text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)] disabled:opacity-0"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={dismiss}
                className="text-[13px] font-medium text-[var(--color-ink-faint)] transition hover:text-[var(--color-ink)]"
              >
                Skip all
              </button>
              <button
                onClick={() => {
                  if (isLast) {
                    dismiss();
                  } else {
                    setStep((s) => s + 1);
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl bg-[var(--color-blue-ink)] px-5 py-2.5 text-[13px] font-bold text-white transition hover:brightness-110"
              >
                {isLast ? "Get started" : "Next"}
                {!isLast && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 pb-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-[var(--color-blue-ink)]" : "w-1.5 bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
