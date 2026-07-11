"use client";

import React, { useState } from "react";
import { FileText, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Award } from "lucide-react";
import { PYQ_PAPERS, type PYQPaper } from "@/src/data/previousYearQuestions";
import type { MockQuestion } from "@/src/lib/mockTest";

const EXAM_COLORS: Record<string, string> = {
  "JEE Mains": "bg-blue-100 text-blue-700",
  "JEE Advanced": "bg-purple-100 text-purple-700",
  NEET: "bg-green-100 text-green-700",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-red-100 text-red-700",
};

function PYQuestion({ q, index }: { q: MockQuestion; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (optIdx: number) => {
    if (revealed) return;
    setSelected(optIdx);
    setRevealed(true);
  };

  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] overflow-hidden">
      <button onClick={() => { setExpanded(!expanded); if (!expanded) { setSelected(null); setRevealed(false); } }} className="w-full px-4 py-3 text-left flex items-start gap-3">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]">{index + 1}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="rounded-full bg-[var(--color-blue-wash)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-blue-ink)]">{q.subject}</span>
            <span className="text-[10px] text-[var(--color-ink-faint)]">{q.topic}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${DIFFICULTY_COLORS[q.difficulty]}`}>{q.difficulty}</span>
          </div>
          <p className="text-[13px] font-medium text-[var(--color-ink)] leading-snug">{q.prompt}</p>
        </div>
        {expanded ? <ChevronUp className="h-3.5 w-3.5 shrink-0 text-[var(--color-ink-faint)] mt-1" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--color-ink-faint)] mt-1" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[var(--color-line)] pt-3">
          <div className="space-y-1.5">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correct;
              const isSelected = i === selected;
              let cls = "border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink-soft)] hover:border-[var(--color-line-strong)] cursor-pointer";
              if (revealed) {
                if (isCorrect) cls = "border-green-300 bg-green-50 text-green-800";
                else if (isSelected) cls = "border-red-300 bg-red-50 text-red-700";
                else cls = "border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink-faint)] opacity-50";
              }
              return (
                <button key={i} onClick={() => handleSelect(i)} disabled={revealed} className={`w-full rounded-lg border p-2.5 text-left text-[12px] transition flex items-center gap-2 ${cls}`}>
                  <span className="shrink-0 text-[10px] font-bold">{String.fromCharCode(65 + i)}</span>
                  <span className="flex-1">{opt}</span>
                  {revealed && isCorrect && <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" />}
                  {revealed && isSelected && !isCorrect && <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                </button>
              );
            })}
          </div>
          {revealed && (
            <div className="mt-3 rounded-lg bg-[var(--color-blue-wash)] p-3">
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[var(--color-blue-ink)] mb-1">Explanation</p>
              <p className="text-[12px] leading-relaxed text-[var(--color-ink)]">{q.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PaperCard({ paper }: { paper: PYQPaper }) {
  const [expanded, setExpanded] = useState(false);
  const subjects = Array.from(new Set(paper.questions.map((q) => q.subject)));

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full px-6 py-5 text-left flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-blue-wash)]">
          <FileText className="h-6 w-6 text-[var(--color-blue-ink)]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${EXAM_COLORS[paper.exam]}`}>{paper.exam}</span>
            <span className="text-[13px] font-bold text-[var(--color-ink)]">{paper.year}</span>
            {paper.session && <span className="text-[12px] text-[var(--color-ink-faint)]">{paper.session} Session</span>}
          </div>
          <div className="flex items-center gap-3 text-[12px] text-[var(--color-ink-soft)]">
            <span>{paper.questions.length} questions</span>
            <span className="flex items-center gap-1">{subjects.join(", ")}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {expanded ? <ChevronUp className="h-5 w-5 text-[var(--color-ink-faint)]" /> : <ChevronDown className="h-5 w-5 text-[var(--color-ink-faint)]" />}
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 border-t border-[var(--color-line)] pt-4 space-y-2.5">
          {paper.questions.map((q, i) => (
            <PYQuestion key={q.id} q={q} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PreviousYearPapers() {
  const [examFilter, setExamFilter] = useState<string>("all");

  const exams = ["all", ...Array.from(new Set(PYQ_PAPERS.map((p) => p.exam)))];
  const filtered = examFilter === "all" ? PYQ_PAPERS : PYQ_PAPERS.filter((p) => p.exam === examFilter);
  const totalQuestions = PYQ_PAPERS.reduce((sum, p) => sum + p.questions.length, 0);

  return (
    <div className="bbc mx-auto max-w-[820px] px-7 py-12">
      <p className="bbc-eyebrow">Previous Year Papers</p>
      <h1 className="bbc-serif mt-3 text-[clamp(28px,4vw,42px)] leading-[1.08] tracking-[-.02em]">
        Solve real exam questions
      </h1>
      <p className="mt-3 max-w-[55ch] text-[15px] text-[var(--color-ink-soft)]">
        Practice with actual JEE & NEET questions from previous years. {totalQuestions} questions with detailed solutions.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-4 text-center">
          <p className="text-[22px] font-bold text-[var(--color-blue-ink)]">{PYQ_PAPERS.length}</p>
          <p className="text-[11px] text-[var(--color-ink-faint)]">Papers</p>
        </div>
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-4 text-center">
          <p className="text-[22px] font-bold text-[var(--color-ink)]">{totalQuestions}</p>
          <p className="text-[11px] text-[var(--color-ink-faint)]">Questions</p>
        </div>
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <Award className="h-4 w-4 text-amber-500" />
            <p className="text-[22px] font-bold text-amber-600">{new Set(PYQ_PAPERS.map((p) => p.exam)).size}</p>
          </div>
          <p className="text-[11px] text-[var(--color-ink-faint)]">Exams</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {exams.map((exam) => (
          <button
            key={exam}
            onClick={() => setExamFilter(exam)}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
              examFilter === exam
                ? "bg-[var(--color-blue-ink)] text-white"
                : "border border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-blue-ink)]"
            }`}
          >
            {exam === "all" ? "All Exams" : exam}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {filtered.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-[var(--color-ink-faint)]" />
          <p className="mt-3 text-[15px] text-[var(--color-ink-soft)]">No papers found for this exam.</p>
        </div>
      )}
    </div>
  );
}
