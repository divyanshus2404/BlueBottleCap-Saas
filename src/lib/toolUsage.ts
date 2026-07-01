// Tiny localStorage-backed counter so the free tier sees a real daily limit
// without us needing a server round-trip per click. Pro skips this entirely.

const KEY = "bluebottlecap_tool_usage_v1";

interface UsageRecord {
  date: string; // YYYY-MM-DD
  counts: Record<string, number>; // toolId → count
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(): UsageRecord {
  if (typeof window === "undefined") return { date: todayStr(), counts: {} };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { date: todayStr(), counts: {} };
    const parsed = JSON.parse(raw) as UsageRecord;
    if (parsed.date !== todayStr()) return { date: todayStr(), counts: {} };
    return parsed;
  } catch {
    return { date: todayStr(), counts: {} };
  }
}

function write(rec: UsageRecord) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(rec));
  } catch {
    /* quota or private-mode — fall through, user just gets fresh counts */
  }
}

export function getToolRunsToday(toolId: string): number {
  return read().counts[toolId] ?? 0;
}

export function recordToolRun(toolId: string) {
  const rec = read();
  rec.counts[toolId] = (rec.counts[toolId] ?? 0) + 1;
  write(rec);
}
