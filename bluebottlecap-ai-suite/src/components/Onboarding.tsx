"use client";

import React, { useState } from "react";
import { ActiveView, UserStats } from "../types";
import { Check, ArrowRight, Compass, Shield, Award, Sparkles, Star, Zap } from "lucide-react";
import { Logo } from "./Logo";

interface OnboardingProps {
  onComplete: () => void;
  userStats: UserStats;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, userStats }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const goals = [
    {
      id: "exams",
      title: "Prepare for Core Exams",
      desc: "Practice active recall via AI flashcards and dynamic notes summaries.",
      icon: "🎯",
    },
    {
      id: "papers",
      title: "Review Dense Research Papers",
      desc: "Read publications faster with an interactive sidebar AI co-pilot.",
      icon: "📚",
    },
    {
      id: "math",
      title: "Solve Equations & Diagrams",
      desc: "Upload screenshots of formulas and receive step-by-step LaTeX formatting.",
      icon: "📐",
    },
    {
      id: "voice",
      title: "Convert Notes to Audio Lecture",
      desc: "Play textbook chapters or paper extracts out loud while commuting.",
      icon: "🔊",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16 fade-in">
      {/* Onboarding progress tracking */}
      <div className="mb-8 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-cobalt">
          Step {step} of 3
        </span>
        <div className="flex gap-2">
          <div className={`h-1.5 w-12 rounded-full transition-all duration-300 ${step >= 1 ? "bg-brand-cobalt" : "bg-gray-200"}`}></div>
          <div className={`h-1.5 w-12 rounded-full transition-all duration-300 ${step >= 2 ? "bg-brand-cobalt" : "bg-gray-200"}`}></div>
          <div className={`h-1.5 w-12 rounded-full transition-all duration-300 ${step >= 3 ? "bg-brand-cobalt" : "bg-gray-200"}`}></div>
        </div>
      </div>

      {step === 1 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-10">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-brand-cobalt text-xl">
              🚀
            </div>
            <h1 className="font-display text-2.5xl font-bold tracking-tight text-brand-navy md:text-3xl">
              Welcome to BlueBottleCap!
            </h1>
            <p className="mt-2 text-gray-500">
              Let's tailor your AI-powered student assistant. Select your primary learning goals.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {goals.map((g) => {
              const active = selectedGoals.includes(g.id);
              return (
                <div
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`group relative cursor-pointer rounded-xl border p-5 transition-all hover:border-brand-cobalt hover:bg-slate-50/50 ${
                    active
                      ? "border-brand-cobalt bg-blue-50/10 shadow-sm"
                      : "border-gray-100"
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="text-2xl leading-none">{g.icon}</span>
                    <div>
                      <h3 className="font-semibold text-brand-navy">{g.title}</h3>
                      <p className="mt-1 text-xs text-gray-400 group-hover:text-gray-500 leading-normal">
                        {g.desc}
                      </p>
                    </div>
                  </div>
                  {active && (
                    <span className="absolute right-3 top-3 rounded-full bg-brand-cobalt p-0.5 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={selectedGoals.length === 0}
              className={`flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white shadow-sm transition-all ${
                selectedGoals.length > 0
                  ? "bg-brand-cobalt hover:bg-brand-navy cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-10 fade-in">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500 text-xl">
              ⚖️
            </div>
            <h1 className="font-display text-2.5xl font-bold tracking-tight text-brand-navy">
              Resource Allotments & Limits
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              To guarantee extreme performance and fair cloud availability, free student workspaces include clean soft limits. Take a quick look:
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-slate-50/50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="grow">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-brand-navy">25 Monthly AI Co-Pilot Queries</h3>
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                    25 / month
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Used when summarizing papers, translating texts, explaining difficult math structures, or using chat.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-slate-50/50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                <Compass className="w-5 h-5" />
              </div>
              <div className="grow">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-brand-navy">5 Interactive PDF Annotations</h3>
                  <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-bold text-teal-700">
                    5 files
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Used when highlighting elements inside our specialized scientific papers reading canvas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-slate-50/50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <Shield className="w-5 h-5" />
              </div>
              <div className="grow">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-brand-navy">500 MB Secure Cloud Storage</h3>
                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-700">
                    500 MB
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Holds your annotated research articles, active summarizations history, and scanned formulas safely in the cloud.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-rose-100 bg-rose-50/20 p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-rose-500 text-rose-500" />
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Premium Access Option</span>
              </div>
              <p className="mt-1 text-xs text-rose-700 leading-normal">
                Students requiring unrestricted query volumes, high-density storage (10 GB+), and prioritized Gemini 3.1 Pro integration can unlock Pro Access instantly at any point.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 rounded-xl bg-brand-cobalt px-6 py-2.5 font-semibold text-white shadow-sm hover:bg-brand-navy transition cursor-pointer text-sm"
            >
              <span>Unlock 25 Free Credits</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg md:p-12 fade-in">
          {/* Faux Confetti / Sparkles Animation floating backgrounds */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-[10%] top-[20%] h-3 w-3 rounded-full bg-pink-400 opacity-60 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="absolute right-[15%] top-[10%] h-4 w-4 rounded-full bg-amber-400 opacity-50 animate-ping" style={{ animationDelay: "0.5s" }}></div>
            <div className="absolute left-[20%] bottom-[30%] h-2 w-2 rounded-full bg-emerald-400 opacity-60 animate-pulse"></div>
            <div className="absolute right-[25%] bottom-[15%] h-3.5 w-3.5 rounded-full bg-blue-400 opacity-50 animate-bounce" style={{ animationDelay: "0.8s" }}></div>
          </div>

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600">
            <Award className="h-9 w-9 animate-pulse" />
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-brand-navy md:text-4xl">
            You are All Set!
          </h1>
          <p className="mt-3 text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
            We've successfully credited your new scholar profile with <strong className="text-brand-cobalt">25 high-speed AI queries</strong>. Your workspace is configured and ready.
          </p>

          <div className="my-8 rounded-xl border border-dashed border-teal-200 bg-teal-50/30 p-5 max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-800 text-lg font-bold">
                💡
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-teal-900">Scholar Quick Tip</h4>
                <p className="text-xs text-teal-800 leading-normal mt-0.5">
                  Try opening the <strong className="font-semibold text-brand-cobalt underline cursor-pointer" onClick={onComplete}>AI PDF Reader</strong> tab first to highlight and explain complex passages inside a preloaded review paper!
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={onComplete}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-linear-to-r from-brand-cobalt to-indigo-600 px-8 py-3.5 font-semibold text-white shadow-md shadow-brand-cobalt/20 hover:opacity-90 hover:shadow-lg transition duration-200 cursor-pointer text-sm"
            >
              <Logo className="w-4.5 h-4.5" transparent={true} />
              <span>Launch My Workspace Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
