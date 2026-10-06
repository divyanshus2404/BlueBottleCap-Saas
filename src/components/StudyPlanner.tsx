"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check, ChevronDown, Download, Upload, RotateCcw, Info, ArrowRight,
  Shield, Flame, Target,
} from "lucide-react";
import { SYLLABUS, STAGES, type ExamTrack, type StageKey } from "@/src/data/syllabus";
import {
  loadPlanner, savePlanner, toggleStage, subjectProgress, overallProgress,
  stageTotals, suggestNext, exportPlanner, importPlanner, resetPlanner,
  STORED_KEYS, type PlannerState,
} from "@/src/lib/plannerStore";

const Bar: React.FC<{ pct: number; tone?: "blue" | "green" }> = ({ pct, tone = "blue" }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
    <div
      className={`h-full rounded-full transition-[width] duration-500 ${tone === "green" ? "bg-emerald-500" : "bg-[var(--color-blue-ink)]"}`}
      style={{ width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` }}
    />
  </div>
);

export const StudyPlanner: React.FC = () => {
  const [state, setState] = useState<PlannerState | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Load once on mount. Rendering null until then avoids a hydration mismatch
  // between the server (no localStorage) and the client.
  useEffect(() => {
    const s = loadPlanner();
    setState(s);
    setOpen(SYLLABUS[s.track][0]?.subject ?? null);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const update = (next: PlannerState) => { setState(next); savePlanner(next); };

  const overall = useMemo(() => (state ? overallProgress(state) : { done: 0, total: 0, pct: 0 }), [state]);
  const stages = useMemo(() => (state ? stageTotals(state) : { learn: 0, practice: 0, revise: 0 }), [state]);
  const nextUp = useMemo(() => (state ? suggestNext(state) : []), [state]);

  if (!state) {
    return (
      <div className="bbc min-h-screen bg-white">
        <div className="mx-auto max-w-[1000px] px-6 py-16">
          <div className="h-8 w-56 animate-pulse rounded bg-[var(--color-line)]" />
          <div className="mt-4 h-4 w-80 animate-pulse rounded bg-[var(--color-line)]" />
        </div>
      </div>
    );
  }

  const setTrack = (track: ExamTrack) => {
    update({ ...state, track });
    setOpen(SYLLABUS[track][0]?.subject ?? null);
  };

  const onExport = () => {
    const blob = new Blob([exportPlanner(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bluebottlecap-planner.json";
    a.click();
    URL.revokeObjectURL(url);
    setToast("Planner saved to your downloads");
  };

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = importPlanner(String(reader.result));
      if (!parsed) { setToast("That file could not be read as a planner"); return; }
      update(parsed);
      setOpen(SYLLABUS[parsed.track][0]?.subject ?? null);
      setToast("Planner restored");
    };
    reader.readAsText(file);
  };

  const onReset = () => {
    if (!window.confirm("Clear every tick in your planner? This cannot be undone.")) return;
    resetPlanner();
    const fresh = loadPlanner();
    setState(fresh);
    setToast("Planner cleared");
  };

  return (
    <div className="bbc min-h-screen bg-white">
      <div className="mx-auto max-w-[1000px] px-6 py-12">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-[var(--color-blue-wash)] px-3 py-1 text-[11.5px] font-bold uppercase tracking-[.12em] text-[var(--color-blue-ink)]">
              Planner
            </span>
            <h1 className="mt-3 text-[clamp(26px,3.4vw,38px)] font-bold leading-[1.1] tracking-[-.03em] text-[var(--color-ink)]">
              Your syllabus, chapter by chapter.
            </h1>
            <p className="mt-2 max-w-[54ch] text-[15px] leading-[1.6] text-[var(--color-ink-soft)]">
              Tick what you have learnt, practised and revised. Progress saves on this device
              as you go — no sign-in needed.
            </p>
          </div>

          <div className="flex rounded-full border border-[var(--color-line)] p-1">
            {(["JEE", "NEET"] as ExamTrack[]).map((t) => (
              <button
                key={t}
                onClick={() => setTrack(t)}
                aria-pressed={state.track === t}
                className={`inline-flex min-h-[44px] items-center justify-center rounded-full px-4 py-1.5 text-[13.5px] font-semibold transition ${
                  state.track === t ? "bg-[var(--color-blue-ink)] text-white" : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Overall */}
        <div className="mt-8 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-[var(--color-ink-soft)]">Syllabus covered</p>
              <p className="mt-1 text-[34px] font-bold leading-none tracking-[-.03em] text-[var(--color-ink)]">
                {overall.pct}%
              </p>
            </div>
            <p className="text-[13px] text-[var(--color-ink-faint)]">
              {overall.done} of {overall.total} chapters practised
            </p>
          </div>
          <div className="mt-4"><Bar pct={overall.pct} /></div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {STAGES.map((s) => (
              <div key={s.key} className="rounded-xl border border-[var(--color-line)] bg-white p-3">
                <p className="text-[11.5px] font-semibold text-[var(--color-ink-faint)]">{s.label}</p>
                <p className="mt-1 text-[19px] font-bold leading-none text-[var(--color-ink)]">
                  {stages[s.key]}
                  <span className="ml-1 text-[12px] font-medium text-[var(--color-ink-faint)]">/ {overall.total}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestion */}
        {nextUp.length > 0 && (
          <div className="mt-4 rounded-2xl border border-[var(--color-line)] bg-white p-5">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[var(--color-blue-ink)]" />
              <h2 className="text-[14px] font-bold text-[var(--color-ink)]">Do these next</h2>
              <span className="text-[12px] text-[var(--color-ink-faint)]">— high-weightage chapters you have not practised</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {nextUp.map((c) => (
                <span key={c.id} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-paper-card)] px-3 py-1.5 text-[12.5px] text-[var(--color-ink-soft)]">
                  {c.started && <Flame className="h-3.5 w-3.5 text-amber-500" />}
                  <strong className="font-semibold text-[var(--color-ink)]">{c.name}</strong>
                  <span className="text-[var(--color-ink-faint)]">· {c.subject}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Subjects */}
        <div className="mt-4 space-y-3">
          {SYLLABUS[state.track].map((s) => {
            const p = subjectProgress(state, s.subject);
            const isOpen = open === s.subject;
            return (
              <div key={s.subject} className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
                <button
                  onClick={() => setOpen(isOpen ? null : s.subject)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[var(--color-paper-card)]"
                >
                  <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--color-ink-faint)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  <span className="w-[108px] shrink-0 text-[15px] font-bold text-[var(--color-ink)]">{s.subject}</span>
                  <span className="hidden flex-1 sm:block"><Bar pct={p.pct} tone={p.pct === 100 ? "green" : "blue"} /></span>
                  <span className="ml-auto shrink-0 text-[12.5px] font-semibold text-[var(--color-ink-faint)]">
                    {p.done}/{p.total}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-[var(--color-line)]">
                    <div className="hidden items-center gap-3 px-5 py-2 text-[10.5px] font-bold uppercase tracking-[.1em] text-[var(--color-ink-faint)] sm:flex">
                      <span className="flex-1">Chapter</span>
                      {STAGES.map((st) => <span key={st.key} className="w-[76px] text-center" title={st.hint}>{st.label}</span>)}
                    </div>
                    <ul>
                      {s.chapters.map((c) => {
                        const m = state.marks[c.id] || {};
                        return (
                          <li key={c.id} className="flex flex-wrap items-center gap-3 border-t border-[var(--color-line)] px-5 py-2.5">
                            <span className="flex-1 text-[13.5px] text-[var(--color-ink)]">
                              {c.name}
                              {c.weight === "high" && (
                                <span className="ml-2 rounded bg-amber-50 px-1.5 py-px text-[9.5px] font-bold uppercase tracking-wide text-amber-700">
                                  High weight
                                </span>
                              )}
                            </span>
                            {STAGES.map((st) => {
                              const on = Boolean(m[st.key as StageKey]);
                              return (
                                <button
                                  key={st.key}
                                  onClick={() => update(toggleStage(state, c.id, st.key as StageKey))}
                                  aria-label={`${st.label} — ${c.name}`}
                                  aria-pressed={on}
                                  title={st.hint}
                                  className="flex min-h-[44px] w-[76px] items-center justify-center"
                                >
                                  <span className={`flex h-6 w-6 items-center justify-center rounded-md border transition ${
                                    on
                                      ? "border-[var(--color-blue-ink)] bg-[var(--color-blue-ink)] text-white"
                                      : "border-[var(--color-line-strong)] bg-white text-transparent hover:border-[var(--color-blue-ink)]"
                                  }`}>
                                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                  </span>
                                </button>
                              );
                            })}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Data + transparency */}
        <div className="mt-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-5">
          <button
            onClick={() => setShowPrivacy((v) => !v)}
            aria-expanded={showPrivacy}
            className="flex min-h-[44px] w-full items-center gap-2 text-left"
          >
            <Shield className="h-4 w-4 shrink-0 text-[var(--color-blue-ink)]" />
            <span className="text-[14px] font-bold text-[var(--color-ink)]">How your progress is tracked</span>
            <ChevronDown className={`ml-auto h-4 w-4 text-[var(--color-ink-faint)] transition-transform ${showPrivacy ? "rotate-180" : ""}`} />
          </button>

          <p className="mt-2 text-[13px] leading-[1.6] text-[var(--color-ink-soft)]">
            Everything is stored in this browser only. No account, no upload, no tracking across sites.
          </p>

          {showPrivacy && (
            <div className="mt-4 space-y-3 border-t border-[var(--color-line)] pt-4">
              <p className="text-[12.5px] leading-[1.6] text-[var(--color-ink-soft)]">
                Your progress is saved to your browser&apos;s local storage under these keys. It never
                leaves this device, so nobody — including us — can read it:
              </p>
              <ul className="space-y-1.5">
                {STORED_KEYS.map((k) => (
                  <li key={k.key} className="text-[12px] leading-snug text-[var(--color-ink-soft)]">
                    <code className="rounded bg-white px-1.5 py-0.5 text-[11px] text-[var(--color-ink)]">{k.key}</code>
                    <span className="ml-2">{k.what}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
                <p className="text-[12px] leading-[1.55] text-amber-900">
                  Because there is no account yet, clearing your browser data or switching device
                  loses your ticks. Use <strong>Save a backup</strong> below to keep a copy.
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={onExport} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line-strong)] bg-white min-h-[44px] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-blue-ink)] hover:text-[var(--color-blue-ink)]">
              <Download className="h-3.5 w-3.5" /> Save a backup
            </button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--color-line-strong)] bg-white min-h-[44px] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-blue-ink)] hover:text-[var(--color-blue-ink)]">
              <Upload className="h-3.5 w-3.5" /> Restore
              <input type="file" accept="application/json" className="sr-only" onChange={onImport} />
            </label>
            <button onClick={onReset} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line-strong)] bg-white min-h-[44px] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--color-ink-soft)] transition hover:border-red-400 hover:text-red-600">
              <RotateCcw className="h-3.5 w-3.5" /> Clear all
            </button>
          </div>
        </div>

        <p className="mt-6 text-[13px] text-[var(--color-ink-faint)]">
          Practised a chapter?{" "}
          <Link href="/mock-test" className="font-semibold text-[var(--color-blue-ink)] hover:underline">
            Test it with a mock <ArrowRight className="inline h-3.5 w-3.5" />
          </Link>
        </p>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--color-ink)] px-4 py-2.5 text-[13px] font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};
