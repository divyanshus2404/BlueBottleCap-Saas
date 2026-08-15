"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RotateCcw, ChevronLeft, ChevronRight, Brain, CheckCircle, Layers } from "lucide-react";
import { type SRCard, type Grade, initSRCard, reviewCard, getDueCards } from "@/src/lib/spacedRepetition";
import { flashcardsData } from "@/src/data/flashcardsData";
import { useAuth } from "@/src/context/AuthContext";
import { trackEvent } from "@/src/lib/analytics";
import { StreakChip } from "./StreakChip";

const STORAGE_KEY = "bbc_sr_cards";

function loadCards(): SRCard[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: SRCard[] = JSON.parse(saved);
      const savedIds = new Set(parsed.map((c) => c.id));
      const newCards = flashcardsData
        .filter((f) => !savedIds.has(f.id))
        .map((f) => initSRCard({ id: f.id, question: f.question, answer: f.answer, category: f.category }));
      return [...parsed, ...newCards];
    }
  } catch {
    // corrupted storage, start fresh
  }
  return flashcardsData.map((f) => initSRCard({ id: f.id, question: f.question, answer: f.answer, category: f.category }));
}

function saveCards(cards: SRCard[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {}
}

const GRADE_BUTTONS: { grade: Grade; label: string; color: string; key: string }[] = [
  { grade: 0, label: "Again", color: "bg-red-100 text-red-700 hover:bg-red-200", key: "1" },
  { grade: 2, label: "Hard", color: "bg-amber-100 text-amber-700 hover:bg-amber-200", key: "2" },
  { grade: 3, label: "Good", color: "bg-green-100 text-green-700 hover:bg-green-200", key: "3" },
  { grade: 5, label: "Easy", color: "bg-blue-100 text-blue-700 hover:bg-blue-200", key: "4" },
];

export function FlashcardDeck() {
  const { currentUser } = useAuth();
  const [allCards, setAllCards] = useState<SRCard[]>([]);
  const [dueCards, setDueCards] = useState<SRCard[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    async function init() {
      let cards = loadCards();
      if (currentUser?.uid) {
        try {
          const { loadFlashcardsFromFirestore } = await import("@/src/lib/firestoreSync");
          const remote = await loadFlashcardsFromFirestore(currentUser.uid);
          if (remote && remote.length > 0 && !cancelled) {
            const remoteMap = new Map(remote.map((c) => [c.id, c]));
            cards = cards.map((c) => remoteMap.get(c.id) ?? c);
            const localIds = new Set(cards.map((c) => c.id));
            for (const rc of remote) {
              if (!localIds.has(rc.id)) cards.push(rc);
            }
            saveCards(cards);
          }
        } catch {}
      }
      if (!cancelled) {
        setAllCards(cards);
        setDueCards(getDueCards(cards));
      }
    }
    init();
    return () => { cancelled = true; };
  }, [currentUser]);

  const categories = ["all", ...Array.from(new Set(allCards.map((c) => c.category)))];

  const filteredDue = category === "all" ? dueCards : dueCards.filter((c) => c.category === category);
  const card = filteredDue[idx];

  const handleGrade = useCallback((grade: Grade) => {
    if (!card) return;
    const updated = reviewCard(card, grade);
    const newAll = allCards.map((c) => (c.id === updated.id ? updated : c));
    setAllCards(newAll);
    saveCards(newAll);
    if (currentUser?.uid) {
      import("@/src/lib/firestoreSync").then((m) => m.syncFlashcardsToFirestore(currentUser.uid, newAll)).catch(() => {});
    }
    trackEvent("flashcard_reviewed", { cardId: card.id, grade, category: card.category });
    const newDue = getDueCards(newAll);
    setDueCards(newDue);
    setReviewed((r) => r + 1);
    setFlipped(false);
    const filtered = category === "all" ? newDue : newDue.filter((c) => c.category === category);
    if (idx >= filtered.length) setIdx(Math.max(0, filtered.length - 1));
  }, [card, allCards, category, idx, currentUser]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped((f) => !f); }
      if (flipped && e.key >= "1" && e.key <= "4") {
        const btn = GRADE_BUTTONS[parseInt(e.key) - 1];
        if (btn) handleGrade(btn.grade);
      }
      if (e.key === "ArrowRight") { setIdx((i) => Math.min(filteredDue.length - 1, i + 1)); setFlipped(false); }
      if (e.key === "ArrowLeft") { setIdx((i) => Math.max(0, i - 1)); setFlipped(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, handleGrade, filteredDue.length]);

  if (allCards.length === 0) {
    return (
      <div className="bbc mx-auto max-w-[720px] px-7 py-12 text-center">
        <Brain className="mx-auto h-12 w-12 text-[var(--color-ink-faint)]" />
        <h2 className="bbc-serif mt-4 text-[24px]">Loading flashcards...</h2>
      </div>
    );
  }

  if (filteredDue.length === 0) {
    return (
      <div className="bbc mx-auto max-w-[720px] px-7 py-12">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="bbc-serif mt-4 text-[24px] text-green-800">All caught up!</h2>
          <p className="mt-2 text-[15px] text-green-700">
            {reviewed > 0
              ? `You reviewed ${reviewed} card${reviewed > 1 ? "s" : ""} today. Come back tomorrow for more.`
              : "No cards due for review right now. Check back later!"}
          </p>
          <div className="mt-4 flex justify-center gap-3 text-[13px] text-green-600">
            <span className="flex items-center gap-1"><Layers className="h-4 w-4" /> {allCards.length} total cards</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bbc mx-auto max-w-[720px] px-7 py-12">
      <div className="flex items-center justify-between gap-3">
        <p className="bbc-eyebrow">Flashcards</p>
        <StreakChip />
      </div>
      <h1 className="bbc-serif mt-3 text-[clamp(28px,4vw,42px)] leading-[1.08] tracking-[-.02em]">
        Spaced Repetition
      </h1>
      <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
        {filteredDue.length} cards due · {reviewed} reviewed today
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setIdx(0); setFlipped(false); }}
            className={`rounded-full px-3 py-1 text-[12px] font-semibold transition ${
              category === cat
                ? "bg-[var(--color-blue-ink)] text-white"
                : "bg-[var(--color-paper-card)] border border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-blue-ink)]"
            }`}
          >
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      {/* Session progress */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-[var(--color-line)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-blue-ink)] transition-all duration-500"
            style={{ width: `${Math.min(100, (reviewed / (reviewed + filteredDue.length)) * 100)}%` }}
          />
        </div>
        <span className="text-[11px] font-semibold text-[var(--color-ink-faint)] whitespace-nowrap">
          {reviewed}/{reviewed + filteredDue.length}
        </span>
      </div>

      <div className="mt-6">
        <button
          onClick={() => setFlipped((f) => !f)}
          className="w-full cursor-pointer perspective-[1000px]"
        >
          <div
            className={`relative min-h-[280px] rounded-2xl border-2 p-8 transition-all duration-500 ${
              flipped
                ? "border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)]"
                : "border-[var(--color-line)] bg-[var(--color-paper-card)] hover:border-[var(--color-blue-ink)] hover:shadow-lg"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="rounded-full bg-[var(--color-blue-wash)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-blue-ink)]">
                {card.category}
              </span>
              <span className="text-[11px] font-bold text-[var(--color-ink-faint)]">
                {idx + 1} / {filteredDue.length}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center min-h-[180px]">
              {!flipped ? (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[var(--color-ink-faint)] mb-3">Question</p>
                  <p className="bbc-serif text-[20px] leading-[1.4] text-center text-[var(--color-ink)]">{card.question}</p>
                  <p className="mt-4 text-[12px] text-[var(--color-ink-faint)]">Tap to reveal answer · Space/Enter</p>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[var(--color-blue-ink)] mb-3">Answer</p>
                  <p className="bbc-serif text-[20px] leading-[1.4] text-center text-[var(--color-ink)]">{card.answer}</p>
                </>
              )}
            </div>
          </div>
        </button>

        {flipped && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {GRADE_BUTTONS.map((btn) => (
              <button
                key={btn.grade}
                onClick={() => handleGrade(btn.grade)}
                className={`rounded-xl py-3 text-[13px] font-bold transition ${btn.color}`}
              >
                {btn.label}
                <span className="block text-[10px] opacity-60 mt-0.5">({btn.key})</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => { setIdx((i) => Math.max(0, i - 1)); setFlipped(false); }}
            disabled={idx === 0}
            className="flex items-center gap-1 text-[13px] font-semibold text-[var(--color-ink-soft)] disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <button
            onClick={() => setFlipped(false)}
            className="flex items-center gap-1 text-[12px] font-semibold text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <button
            onClick={() => { setIdx((i) => Math.min(filteredDue.length - 1, i + 1)); setFlipped(false); }}
            disabled={idx === filteredDue.length - 1}
            className="flex items-center gap-1 text-[13px] font-semibold text-[var(--color-ink-soft)] disabled:opacity-30"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
