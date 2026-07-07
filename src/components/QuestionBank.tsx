"use client";

import React, { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, CheckCircle, XCircle, Filter, BookOpen } from "lucide-react";
import { PHYSICS_QUESTIONS, CHEMISTRY_QUESTIONS, MATHS_QUESTIONS, BIOLOGY_QUESTIONS, type MockQuestion } from "@/src/lib/questionExports";

type Difficulty = "all" | "easy" | "medium" | "hard";

const ALL_QUESTIONS: MockQuestion[] = [
  ...PHYSICS_QUESTIONS,
  ...CHEMISTRY_QUESTIONS,
  ...MATHS_QUESTIONS,
  ...BIOLOGY_QUESTIONS,
];

const SUBJECTS = ["All", "Physics", "Chemistry", "Maths", "Biology"] as const;

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-red-100 text-red-700",
};

function QuestionCard({ q, index }: { q: MockQuestion; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (optIdx: number) => {
    if (revealed) return;
    setSelected(optIdx);
    setRevealed(true);
  };

  const reset = () => {
    setSelected(null);
    setRevealed(false);
  };

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] overflow-hidden transition hover:border-[var(--color-line-strong)]">
      <button
        onClick={() => { setExpanded(!expanded); if (!expanded) reset(); }}
        className="w-full px-5 py-4 text-left flex items-start gap-3"
      >
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--color-blue-wash)] text-[11px] font-bold text-[var(--color-blue-ink)]">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="rounded-full bg-[var(--color-blue-wash)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-blue-ink)]">{q.subject}</span>
            <span className="rounded-full bg-[var(--color-paper)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-ink-faint)]">{q.topic}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${DIFFICULTY_COLORS[q.difficulty]}`}>{q.difficulty}</span>
          </div>
          <p className="text-[14px] font-medium text-[var(--color-ink)] leading-snug">{q.prompt}</p>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-[var(--color-ink-faint)] mt-1" /> : <ChevronDown className="h-4 w-4 shrink-0 text-[var(--color-ink-faint)] mt-1" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-[var(--color-line)] pt-4">
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correct;
              const isSelected = i === selected;
              let cls = "border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink-soft)] hover:border-[var(--color-line-strong)] cursor-pointer";
              if (revealed) {
                if (isCorrect) cls = "border-green-300 bg-green-50 text-green-800";
                else if (isSelected && !isCorrect) cls = "border-red-300 bg-red-50 text-red-700";
                else cls = "border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink-faint)] opacity-60";
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={revealed}
                  className={`w-full rounded-xl border p-3 text-left text-[13px] transition flex items-center gap-2 ${cls}`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold bg-[var(--color-paper)] border border-[var(--color-line)]">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {revealed && isCorrect && <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />}
                  {revealed && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {revealed && (
            <div className="mt-4 rounded-xl bg-[var(--color-blue-wash)] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[var(--color-blue-ink)] mb-1">Explanation</p>
              <p className="text-[13px] leading-relaxed text-[var(--color-ink)]">{q.explanation}</p>
            </div>
          )}

          <div className="mt-3 flex justify-end">
            <button onClick={reset} className="text-[12px] font-semibold text-[var(--color-ink-faint)] hover:text-[var(--color-blue-ink)] transition">
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function QuestionBank() {
  const [subject, setSubject] = useState<string>("All");
  const [difficulty, setDifficulty] = useState<Difficulty>("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const topics = useMemo(() => {
    const qs = subject === "All" ? ALL_QUESTIONS : ALL_QUESTIONS.filter((q) => q.subject === subject);
    return Array.from(new Set(qs.map((q) => q.topic))).sort();
  }, [subject]);

  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  const filtered = useMemo(() => {
    let qs = ALL_QUESTIONS;
    if (subject !== "All") qs = qs.filter((q) => q.subject === subject);
    if (difficulty !== "all") qs = qs.filter((q) => q.difficulty === difficulty);
    if (selectedTopic !== "all") qs = qs.filter((q) => q.topic === selectedTopic);
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      qs = qs.filter((q) => q.prompt.toLowerCase().includes(s) || q.topic.toLowerCase().includes(s));
    }
    return qs;
  }, [subject, difficulty, selectedTopic, search]);

  return (
    <div className="bbc mx-auto max-w-[820px] px-7 py-12">
      <p className="bbc-eyebrow">Question Bank</p>
      <h1 className="bbc-serif mt-3 text-[clamp(28px,4vw,42px)] leading-[1.08] tracking-[-.02em]">
        Browse questions by topic
      </h1>
      <p className="mt-3 max-w-[50ch] text-[15px] text-[var(--color-ink-soft)]">
        {ALL_QUESTIONS.length} questions across Physics, Chemistry, Maths & Biology. Click any question to practice.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-ink-faint)]" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] pl-9 pr-4 py-2.5 text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] outline-none focus:border-[var(--color-blue-ink)]"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-[12px] font-semibold transition ${
            showFilters ? "border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]" : "border-[var(--color-line)] text-[var(--color-ink-soft)]"
          }`}
        >
          <Filter className="h-3.5 w-3.5" /> Filters
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {SUBJECTS.map((s) => (
          <button
            key={s}
            onClick={() => { setSubject(s); setSelectedTopic("all"); }}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
              subject === s
                ? "bg-[var(--color-blue-ink)] text-white"
                : "border border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-blue-ink)]"
            }`}
          >
            {s} {s !== "All" && `(${ALL_QUESTIONS.filter((q) => q.subject === s).length})`}
          </button>
        ))}
      </div>

      {showFilters && (
        <div className="mt-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-4 space-y-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[var(--color-ink-faint)] mb-2">Difficulty</p>
            <div className="flex gap-1.5">
              {(["all", "easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`rounded-lg px-3 py-1 text-[11px] font-semibold transition ${
                    difficulty === d ? "bg-[var(--color-blue-ink)] text-white" : "bg-[var(--color-paper)] text-[var(--color-ink-soft)]"
                  }`}
                >
                  {d === "all" ? "All" : d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[var(--color-ink-faint)] mb-2">Topic</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedTopic("all")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  selectedTopic === "all" ? "bg-[var(--color-blue-ink)] text-white" : "bg-[var(--color-paper)] text-[var(--color-ink-soft)]"
                }`}
              >
                All Topics
              </button>
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTopic(t)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                    selectedTopic === t ? "bg-[var(--color-blue-ink)] text-white" : "bg-[var(--color-paper)] text-[var(--color-ink-soft)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="mt-6 text-[12px] font-semibold text-[var(--color-ink-faint)]">
        {filtered.length} question{filtered.length !== 1 ? "s" : ""} found
      </p>

      <div className="mt-3 space-y-3">
        {filtered.map((q, i) => (
          <QuestionCard key={q.id} q={q} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-[var(--color-ink-faint)]" />
          <p className="mt-3 text-[15px] text-[var(--color-ink-soft)]">No questions match your filters.</p>
        </div>
      )}
    </div>
  );
}
