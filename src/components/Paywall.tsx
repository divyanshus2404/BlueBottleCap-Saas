"use client";

import React from "react";
import { Lock, Sparkles, Zap, Shield, ArrowRight, Layers, BookOpen } from "lucide-react";

interface PaywallProps {
  featureName: string;
  onUpgradeClick: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({ featureName, onUpgradeClick }) => {
  const getFeatureIcon = () => {
    switch (featureName.toLowerCase()) {
      case "dashboard":
        return <Layers className="w-8 h-8 text-accent" />;
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
        <div className="absolute -top-24 -left-24 -z-10 h-72 w-72 rounded-full bg-accent/5 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 -z-10 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl"></div>

        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-6">
          
          {/* Padlock Icon & Feature Icon Indicator */}
          <div className="relative flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-solid border border-gray-100 shadow-inner">
              {getFeatureIcon()}
            </div>
            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-tr from-brand-navy to-slate-800 text-white shadow-lg ring-4 ring-white">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          <div>
            <span className="rounded-full bg-orange-50 border border-orange-100 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-orange-700">
              🔒 Premium Workspace Feature
            </span>
            <h1 className="mt-4 font-display text-3xl font-black text-white md:text-4xl tracking-tight leading-tight">
              Unlock the {featureName}
            </h1>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              This powerful tool is only available to subscribed students. Upgrade your plan to get full, unlimited access and accelerate your learning workflow.
            </p>
          </div>

          {/* Premium features checklist */}
          <div className="w-full text-left border-y border-gray-100 py-8 my-6">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 font-mono mb-4 text-center">
              What you get when you upgrade:
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {getFeatureBenefits().map((benefit, index) => (
                <div key={index} className="space-y-1 bg-surface-solid border border-gray-100/50 rounded-2xl p-4.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-white">
                    <Shield className="w-3.5 h-3.5 text-accent fill-brand-cobalt/10 shrink-0" />
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
              <span>View Subscription Plans</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center rounded-xl border border-gray-200 hover:bg-surface-solid bg-white text-gray-600 px-6 py-3.5 font-bold text-sm cursor-pointer w-full sm:w-auto"
            >
              Go Back
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
