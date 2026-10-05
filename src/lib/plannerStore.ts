/**
 * Planner persistence.
 *
 * Everything lives in this browser's localStorage under a single key. Nothing
 * is uploaded, and no account is required — which is both a privacy property
 * worth stating plainly to the user and the reason the planner works at all
 * while sign-in is switched off.
 *
 * The trade-off is real and the UI says so: clearing site data or switching
 * device loses the ticks. Export/import below exists so that is recoverable
 * without an account.
 */
import { SYLLABUS, type ExamTrack, type StageKey, chapterCount } from "@/src/data/syllabus";

const KEY = "bluebottlecap_planner_v1";

/** chapterId -> the stages ticked for it. */
export type PlannerState = {
  track: ExamTrack;
  marks: Record<string, Partial<Record<StageKey, boolean>>>;
  updatedAt: string;
};

const EMPTY: PlannerState = { track: "JEE", marks: {}, updatedAt: "" };

export function loadPlanner(): PlannerState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as PlannerState;
    if (!parsed || typeof parsed !== "object" || !parsed.marks) return EMPTY;
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

export function savePlanner(state: PlannerState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }));
  } catch {
    /* quota or private mode — the UI keeps working, it just will not persist */
  }
}

export function toggleStage(state: PlannerState, chapterId: string, stage: StageKey): PlannerState {
  const current = state.marks[chapterId] || {};
  const next = { ...current, [stage]: !current[stage] };
  // Ticking a later stage implies the earlier ones. Nobody revises a chapter
  // they never read, and making students tick three boxes per chapter is how
  // trackers get abandoned.
  if (next[stage]) {
    if (stage === "revise") { next.learn = true; next.practice = true; }
    if (stage === "practice") { next.learn = true; }
  }
  return { ...state, marks: { ...state.marks, [chapterId]: next } };
}

export interface Progress {
  done: number;
  total: number;
  pct: number;
}

/** Counts a chapter as done once it has been practised — reading alone is not progress. */
export function subjectProgress(state: PlannerState, subject: string): Progress {
  const s = SYLLABUS[state.track].find((x) => x.subject === subject);
  if (!s) return { done: 0, total: 0, pct: 0 };
  const done = s.chapters.filter((c) => state.marks[c.id]?.practice).length;
  return { done, total: s.chapters.length, pct: s.chapters.length ? Math.round((done / s.chapters.length) * 100) : 0 };
}

export function overallProgress(state: PlannerState): Progress {
  const total = chapterCount(state.track);
  const done = SYLLABUS[state.track]
    .flatMap((s) => s.chapters)
    .filter((c) => state.marks[c.id]?.practice).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function stageTotals(state: PlannerState): Record<StageKey, number> {
  const all = SYLLABUS[state.track].flatMap((s) => s.chapters);
  return {
    learn: all.filter((c) => state.marks[c.id]?.learn).length,
    practice: all.filter((c) => state.marks[c.id]?.practice).length,
    revise: all.filter((c) => state.marks[c.id]?.revise).length,
  };
}

/**
 * What to do next: high-weightage chapters that have not been practised yet,
 * preferring ones already read. Ordering by exam weight rather than by
 * position in the syllabus is the whole point of the suggestion.
 */
export function suggestNext(state: PlannerState, limit = 3) {
  const out: { id: string; name: string; subject: string; started: boolean }[] = [];
  for (const s of SYLLABUS[state.track]) {
    for (const c of s.chapters) {
      if (state.marks[c.id]?.practice) continue;
      if (c.weight !== "high") continue;
      out.push({ id: c.id, name: c.name, subject: s.subject, started: Boolean(state.marks[c.id]?.learn) });
    }
  }
  out.sort((a, b) => Number(b.started) - Number(a.started));
  return out.slice(0, limit);
}

export function exportPlanner(state: PlannerState): string {
  return JSON.stringify(state, null, 2);
}

export function importPlanner(json: string): PlannerState | null {
  try {
    const parsed = JSON.parse(json) as PlannerState;
    if (!parsed?.marks || typeof parsed.marks !== "object") return null;
    if (parsed.track !== "JEE" && parsed.track !== "NEET") return null;
    return { ...EMPTY, ...parsed };
  } catch {
    return null;
  }
}

export function resetPlanner(): void {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

/** Every key this app writes, for the "what is stored" panel. Keep in sync. */
export const STORED_KEYS: { key: string; what: string }[] = [
  { key: KEY, what: "Your syllabus planner — which chapters you have learnt, practised and revised." },
  { key: "bluebottlecap_progress", what: "Daily activity: study minutes and flashcards reviewed." },
  { key: "bluebottlecap_mock_results", what: "Your mock test scores and answers." },
  { key: "bbc_study_log", what: "Focus-timer minutes per day." },
  { key: "bluebottlecap_scan_notes_log", what: "How many note scans you have used this week." },
  { key: "bluebottlecap_tool_usage_v1", what: "Daily file-tool usage, for the free-tier limit." },
  { key: "bluebottlecap_free_tests_taken", what: "How many free mock tests you have taken." },
];
