// Streak accounting utilities. Kept dateless-string-first so the same logic
// works on both server (Vercel Europe) and client (student's phone in
// Bhopal) without a timezone tangle — we treat "today" as the user's
// local YYYY-MM-DD.

export const STREAK_SAVE_PRICE = 19;
export const STREAK_SAVE_PRICE_PAISE = 1900;

/**
 * Format a Date (or "now") as YYYY-MM-DD in the local timezone.
 */
export function todayStr(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Format a Date (or "now") as YYYY-MM in the local timezone. Used to track
 * the one-free-save-per-month allowance.
 */
export function monthStr(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * One free streak save per calendar month. `lastFreeSaveMonth` is the
 * YYYY-MM the user last used it ("" = never).
 */
export function isFreeSaveAvailable(lastFreeSaveMonth: string, now: Date = new Date()): boolean {
  return lastFreeSaveMonth !== monthStr(now);
}

function parseYMD(s: string): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function daysBetween(a: Date, b: Date): number {
  const MS = 24 * 60 * 60 * 1000;
  const ad = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bd = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((bd - ad) / MS);
}

export type StreakStatus =
  | "no-streak"            // streak == 0, nothing to save
  | "active-today"         // logged in today, streak safe
  | "at-risk"              // haven't logged today, but yesterday was fine — still savable
  | "broken";              // gap > 1 day, streak has already reset

export interface StreakSnapshot {
  status: StreakStatus;
  streakDays: number;
  lastLoggedDate: string;
  today: string;
  /** True when the "Save streak" button should be surfaced. */
  saveable: boolean;
}

export function evaluateStreak(streakDays: number, lastLoggedDate: string, now: Date = new Date()): StreakSnapshot {
  const today = todayStr(now);
  if (streakDays <= 0) {
    return { status: "no-streak", streakDays, lastLoggedDate, today, saveable: false };
  }
  const last = parseYMD(lastLoggedDate);
  if (!last) {
    // No stored date but streak > 0 — treat as active today so we don't
    // panic-prompt every fresh session on a brand-new device.
    return { status: "active-today", streakDays, lastLoggedDate: today, today, saveable: false };
  }
  const gap = daysBetween(last, now);
  if (gap <= 0) {
    return { status: "active-today", streakDays, lastLoggedDate, today, saveable: false };
  }
  if (gap === 1) {
    // Yesterday was the last log. Streak still counts today if they act, but
    // this is the "danger zone" where the save-my-streak prompt lands best.
    return { status: "at-risk", streakDays, lastLoggedDate, today, saveable: true };
  }
  // gap >= 2 — the streak has already broken. Offering a save here would be
  // dishonest ("save the streak that already ended"), so keep saveable=false
  // and let the UI encourage a fresh start instead.
  return { status: "broken", streakDays, lastLoggedDate, today, saveable: false };
}
