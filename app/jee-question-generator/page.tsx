import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Free JEE Past 10-Yr Practice Hub & AI Socratic Teacher | BlueBottleCap AI",
  description: "Access chapterwise and subjectwise past 10 years of JEE Mains & Advanced questions, complete with Socratic hints, timed test modes, marks calculators, and AI mistake audits.",
};

export default function JeeQuestionGeneratorLanding() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-12">
      <div className="space-y-4 text-center">
        <span className="rounded-full bg-blue-50 border border-blue-150 px-3 py-1 text-xs font-bold text-brand-cobalt uppercase tracking-widest font-mono">
          Flagship Academic Tool
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-black text-brand-navy tracking-tight leading-none">
          JEE 10-Yr Practice Hub & AI Teacher
        </h1>
        <p className="text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
          Solve subjectwise & chapterwise past JEE Mains and Advanced PYQs. Practice with timed countdowns, get step-by-step Socratic hints, or let our AI Teacher audit your handwritten solving steps.
        </p>
        <div className="pt-4">
          <Link
            href="/?tool=jee-pyq-hub"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-navy hover:bg-brand-cobalt text-white px-6 py-3.5 text-sm font-bold transition shadow-md leading-none"
          >
            <span>Launch Practice Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid gap-6 md:grid-cols-3 pt-8 border-t border-slate-100">
        <div className="space-y-2 bg-white rounded-2xl p-6 border border-slate-150 shadow-3xs">
          <div className="text-xl">🎯</div>
          <h3 className="font-display font-extrabold text-brand-navy text-sm">Socratic AI Teacher</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Upload rough-work photos or type your steps. Our AI points out the exact step where you went wrong, guiding you like a personal tutor without spoiling the answer.
          </p>
        </div>
        <div className="space-y-2 bg-white rounded-2xl p-6 border border-slate-150 shadow-3xs">
          <div className="text-xl">⏱️</div>
          <h3 className="font-display font-extrabold text-brand-navy text-sm">Timed OMR Test Mode</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Simulate actual exam pressure. Turn on the timed test mode, mark answers on the interactive OMR grid, and get a detailed scorecard with the +4 / -1 marking scheme.
          </p>
        </div>
        <div className="space-y-2 bg-white rounded-2xl p-6 border border-slate-150 shadow-3xs">
          <div className="text-xl">⭐</div>
          <h3 className="font-display font-extrabold text-brand-navy text-sm">Smart Question Flags</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Mark questions as "Important", "Solved", or "Needs Revision". Filter and revisit complex questions before exam night to lock in your preparation.
          </p>
        </div>
      </div>
    </div>
  );
}
