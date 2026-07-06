const STORAGE_KEY = "bluebottlecap_progress";

export interface DayEntry {
  date: string;
  studyMinutes: number;
  cardsReviewed: number;
  aiQueries: number;
  readiness?: number;
}

export function getProgressHistory(): DayEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function logProgress(partial: Partial<DayEntry>) {
  if (typeof window === "undefined") return;
  const history = getProgressHistory();
  const today = new Date().toISOString().split("T")[0];
  const idx = history.findIndex((e) => e.date === today);
  const existing: DayEntry = idx >= 0
    ? history[idx]
    : { date: today, studyMinutes: 0, cardsReviewed: 0, aiQueries: 0 };

  const updated: DayEntry = {
    ...existing,
    studyMinutes: existing.studyMinutes + (partial.studyMinutes || 0),
    cardsReviewed: existing.cardsReviewed + (partial.cardsReviewed || 0),
    aiQueries: existing.aiQueries + (partial.aiQueries || 0),
    readiness: partial.readiness ?? existing.readiness,
  };

  if (idx >= 0) {
    history[idx] = updated;
  } else {
    history.push(updated);
  }

  // Keep last 90 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toISOString().split("T")[0];
  const trimmed = history.filter((e) => e.date >= cutoffStr);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getWeeklyStats(history: DayEntry[]): { label: string; minutes: number; cards: number }[] {
  const last7: { label: string; minutes: number; cards: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("en-IN", { weekday: "short" });
    const entry = history.find((e) => e.date === dateStr);
    last7.push({
      label: dayLabel,
      minutes: entry?.studyMinutes || 0,
      cards: entry?.cardsReviewed || 0,
    });
  }
  return last7;
}
