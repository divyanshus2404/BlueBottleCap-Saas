import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "B.Tech Semester & Exam Timetable Study Planner | BlueBottleCap AI",
  description: "Create a customized daily prep schedule for engineering exams (JEE, NEET, B.Tech mid-sem) with hourly study allocation schedules based on academic AI.",
};

export default function BtechStudyPlannerLanding() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-12">
      <div className="space-y-4 text-center">
        <span className="rounded-full bg-blue-50 border border-blue-150 px-3 py-1 text-xs font-bold text-brand-cobalt uppercase tracking-widest font-mono">
          Flagship Academic Tool
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-black text-brand-navy tracking-tight leading-none">
          B.Tech & JEE Smart Study Planner
        </h1>
        <p className="text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
          Create structured daily study timetables based on exam deadlines, subject difficulty, daily availability, and weak topic focus parameters.
        </p>
        <div className="pt-4">
          <Link
            href="/?tool=study-planner"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-navy hover:bg-brand-cobalt text-white px-6 py-3.5 text-sm font-bold transition shadow-md leading-none"
          >
            <span>Launch Planner Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid gap-6 md:grid-cols-3 pt-8 border-t border-slate-100">
        <div className="space-y-2 bg-white rounded-2xl p-6 border border-slate-150 shadow-3xs">
          <div className="text-xl">📅</div>
          <h3 className="font-display font-extrabold text-brand-navy text-sm">Spaced Learning</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Timetables are organized into custom blocks that incorporate revision buffers and mock tests to maximize memory consolidation.
          </p>
        </div>
        <div className="space-y-2 bg-white rounded-2xl p-6 border border-slate-150 shadow-3xs">
          <div className="text-xl">⚖️</div>
          <h3 className="font-display font-extrabold text-brand-navy text-sm">Workload Balancing</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Enter your daily available hours to calibrate the workload so you can stay consistent without burning out.
          </p>
        </div>
        <div className="space-y-2 bg-white rounded-2xl p-6 border border-slate-150 shadow-3xs">
          <div className="text-xl">🎯</div>
          <h3 className="font-display font-extrabold text-brand-navy text-sm">Weak Area Focus</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Prioritize challenging chapters and concepts early in the study schedule so you master hard questions first.
          </p>
        </div>
      </div>
    </div>
  );
}
