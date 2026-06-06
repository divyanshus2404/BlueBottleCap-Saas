import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "AI Engineering & B.Tech Flashcard Maker | BlueBottleCap AI",
  description: "Convert your PDF slides, lecture notes, and engineering textbook chapters into interactive flashcard decks with socratic answer keys using academic AI.",
};

export default function EngineeringFlashcardMakerLanding() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-12">
      <div className="space-y-4 text-center">
        <span className="rounded-full bg-blue-50 border border-blue-150 px-3 py-1 text-xs font-bold text-brand-cobalt uppercase tracking-widest font-mono">
          Flagship Academic Tool
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-black text-brand-navy tracking-tight leading-none">
          Notes to Flashcards Generator
        </h1>
        <p className="text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
          Instantly convert long PDFs, presentation slides, or manual text notes into study flashcards for active recall revision session runs.
        </p>
        <div className="pt-4">
          <Link
            href="/?tool=notes-to-flashcards"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-navy hover:bg-brand-cobalt text-white px-6 py-3.5 text-sm font-bold transition shadow-md leading-none"
          >
            <span>Launch Flashcards Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid gap-6 md:grid-cols-3 pt-8 border-t border-slate-100">
        <div className="space-y-2 bg-white rounded-2xl p-6 border border-slate-150 shadow-3xs">
          <div className="text-xl">⚡</div>
          <h3 className="font-display font-extrabold text-brand-navy text-sm">Automatic Extraction</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Our AI scans your text notes to automatically isolate key formulas, definitions, and concepts into revision question cards.
          </p>
        </div>
        <div className="space-y-2 bg-white rounded-2xl p-6 border border-slate-150 shadow-3xs">
          <div className="text-xl">🔄</div>
          <h3 className="font-display font-extrabold text-brand-navy text-sm">3D Flip Decks</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Interact with your cards inside a beautiful, fluid 3D preview deck. Click cards to instantly flip and inspect correct explanations.
          </p>
        </div>
        <div className="space-y-2 bg-white rounded-2xl p-6 border border-slate-150 shadow-3xs">
          <div className="text-xl">📂</div>
          <h3 className="font-display font-extrabold text-brand-navy text-sm">Personal Study Bank</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Save individual flashcards directly into your personalized study bank deck for review sessions and mock exam prep.
          </p>
        </div>
      </div>
    </div>
  );
}
