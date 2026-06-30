"use client";

import React, { useEffect, useState } from "react";
import { Lock, Sparkles, Zap, Shield, ArrowRight, Layers, BookOpen, CalendarDays } from "lucide-react";

interface PaywallProps {
  featureName: string;
  onUpgradeClick: () => void;
}

const EXAM_DATE_KEY = "bluebottlecap_exam_date";

function daysUntil(iso: string): number | null {
  const target = new Date(iso + "T00:00:00");
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function ExamCountdown() {
  const [examDate, setExamDate] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(EXAM_DATE_KEY);
    if (saved) setExamDate(saved);
  }, []);

  const days = examDate ? daysUntil(examDate) : null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    localStorage.setItem(EXAM_DATE_KEY, draft);
    setExamDate(draft);
  };

  if (examDate && days !== null && days >= 0) {
    const formatted = new Date(examDate + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
    return (
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-[13px] font-semibold text-orange-800">
        <CalendarDays className="h-3.5 w-3.5" />
        Your exam is on {formatted} —
        <span className="rounded-md bg-orange-200/60 px-1.5 py-0.5 text-orange-900">
          {days} {days === 1 ? "day" : "days"} away
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="mb-5 inline-flex flex-wrap items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-[13px] text-orange-800">
      <CalendarDays className="h-3.5 w-3.5 text-orange-700" />
      <span className="font-semibold">When's your exam?</span>
      <input
        type="date"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="rounded-md border border-orange-200 bg-white px-2 py-0.5 text-[12.5px] text-orange-900 focus:outline-none"
        min={new Date().toISOString().slice(0, 10)}
      />
      <button
        type="submit"
        className="rounded-md bg-orange-800 px-2.5 py-0.5 text-[12px] font-bold text-white hover:bg-orange-900 disabled:opacity-50"
        disabled={!draft}
      >
        Save
      </button>
    </form>
  );
}

export const Paywall: React.FC<PaywallProps> = ({ featureName, onUpgradeClick }) => {
  const getFeatureIcon = () => {
    switch (featureName.toLowerCase()) {
      case "dashboard":
        return <Layers className="w-8 h-8 text-brand-cobalt" />;
      case "ai pdf reader":
      case "pdf-editor":
        return <BookOpen className="w-8 h-8 text-indigo-650" />;
      case "tools suite":
      case "tools":
        return <Sparkles className="w-8 h-8 text-purple-650" />;
      default:
        return <Zap className="w-8 h-8 text-amber-500" />;
    }
  };

  const getFeatureBenefits = () => {
    switch (featureName.toLowerCase()) {
      case "dashboard":
        return [
          { title: "Study Streaks & Metrics", desc: "Track how many study hours you save and analyze your focus periods." },
          { title: "Smart Resource Monitoring", desc: "Keep tabs on your AI queries and PDF annotations in real time." },
          { title: "Synced Learning Progress", desc: "Sync your recall schedules and academic dashboard across devices." }
        ];
      case "ai pdf reader":
      case "pdf-editor":
        return [
          { title: "Interactive Sidebar Co-Pilot", desc: "Converse with our Gemini-powered co-pilot to parse complex math & text." },
          { title: "Socratic Term Explainer", desc: "Highlight vocabulary or jargon in publications for instant definitions." },
          { title: "Spaced Spaced-Recall Flashcards", desc: "Extract and store critical concepts from research papers directly into flashcards." }
        ];
      case "tools suite":
      case "tools":
        return [
          { title: "12+ Advanced PDF Utilities", desc: "Merge, compress, convert, and stamp annotations onto readings in seconds." },
          { title: "Mathematical Visual OCR", desc: "Solve visual homework equations and convert handwritten symbols to clean LaTeX." },
          { title: "HTML5 Text-to-Speech Lecturer", desc: "Convert chapters or publications to audio and listen to them on the go." }
        ];
      default:
        return [
          { title: "Unlimited AI Co-Pilot Queries", desc: "Remove the 25-query soft limit and research without interruption." },
          { title: "Priority Processing Speeds", desc: "Connect directly to the fastest server-side Gemini flash models." },
          { title: "Enhanced Cloud Scholar Drive", desc: "Save up to 10 GB of annotated papers, textbooks, and notes safely." }
        ];
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:py-24 fade-in">
      <div className="relative overflow-hidden rounded-3xl border border-gray-150 bg-white p-8 md:p-12 shadow-xl">
        
        {/* Glow background effects */}
        <div className="absolute -top-24 -left-24 -z-10 h-72 w-72 rounded-full bg-brand-cobalt/5 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 -z-10 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl"></div>

        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-6">
          
          {/* Padlock Icon & Feature Icon Indicator */}
          <div className="relative flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 border border-gray-100 shadow-inner">
              {getFeatureIcon()}
            </div>
            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-tr from-brand-navy to-slate-800 text-white shadow-lg ring-4 ring-white">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          <div>
            <ExamCountdown />
            <h1 className="mt-1 font-display text-3xl font-black text-brand-navy md:text-4xl tracking-tight leading-tight">
              You've hit the free limit.
            </h1>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-xl">
              Free tier is 1 PDF and 5 chat messages — enough to feel what the product does, not enough to live on.
              Get unlimited PDFs, mocks, flashcards, and a personalized study plan for <strong className="text-brand-navy">₹199/mo</strong> — or lock a full year at <strong className="text-brand-navy">₹1,499</strong> (≈₹125/mo) before exam crunch.
            </p>
          </div>

          {/* Premium features checklist */}
          <div className="w-full text-left border-y border-gray-100 py-8 my-6">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 font-mono mb-4 text-center">
              What you get when you upgrade:
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {getFeatureBenefits().map((benefit, index) => (
                <div key={index} className="space-y-1 bg-slate-50/50 border border-gray-100/50 rounded-2xl p-4.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-brand-navy">
                    <Shield className="w-3.5 h-3.5 text-brand-cobalt fill-brand-cobalt/10 shrink-0" />
                    <span>{benefit.title}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-normal">
                    {benefit.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <button
              onClick={onUpgradeClick}
              className="group flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-brand-cobalt to-indigo-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-brand-cobalt/25 hover:opacity-95 hover:shadow-xl transition cursor-pointer text-sm w-full sm:w-auto"
            >
              <span>Upgrade to Pro — ₹199/mo</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center rounded-xl border border-gray-200 hover:bg-slate-50 bg-white text-gray-600 px-6 py-3.5 font-bold text-sm cursor-pointer w-full sm:w-auto"
            >
              Go Back
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
