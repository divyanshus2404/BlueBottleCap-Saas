// Aggregation for the institute batch weak-topic report. Pure and
// dependency-free so it can be unit-tested and reused by the API route.
//
// A "weak" topic for one student = accuracy below WEAK_THRESHOLD on that
// topic (mirrors the per-student diagnostic in src/lib/diagnostic.ts). The
// batch view reports, per topic, what fraction of the batch is weak in it —
// the "62% of your batch is weak in Mechanics" line that closes demos.

export const WEAK_THRESHOLD = 0.6;

export interface SubmittedTopic {
  topic: string;
  subject?: string;
  correct: number;
  total: number;
}

export interface DiagnosticSubmission {
  readiness: number;
  topics: SubmittedTopic[];
}

export interface TopicAggregate {
  topic: string;
  subject?: string;
  studentsAnswered: number;
  weakCount: number;
  /** 0–100: share of answering students who are weak in this topic. */
  weakPct: number;
  /** 0–100: mean per-student accuracy across the batch. */
  avgAccuracy: number;
}

export interface BatchReport {
  count: number;
  avgReadiness: number;
  topics: TopicAggregate[]; // weakest first
}

export function aggregateBatch(subs: DiagnosticSubmission[]): BatchReport {
  const count = subs.length;
  if (count === 0) return { count: 0, avgReadiness: 0, topics: [] };

  const avgReadiness = Math.round(subs.reduce((s, x) => s + (x.readiness || 0), 0) / count);

  type Acc = { subject?: string; students: number; weak: number; accSum: number };
  const byTopic = new Map<string, Acc>();

  for (const sub of subs) {
    for (const t of sub.topics) {
      if (!t || !t.topic || !t.total) continue;
      const acc = byTopic.get(t.topic) ?? { subject: t.subject, students: 0, weak: 0, accSum: 0 };
      const accuracy = t.correct / t.total;
      acc.students += 1;
      acc.accSum += accuracy;
      if (accuracy < WEAK_THRESHOLD) acc.weak += 1;
      if (!acc.subject && t.subject) acc.subject = t.subject;
      byTopic.set(t.topic, acc);
    }
  }

  const topics: TopicAggregate[] = [...byTopic.entries()].map(([topic, a]) => ({
    topic,
    subject: a.subject,
    studentsAnswered: a.students,
    weakCount: a.weak,
    weakPct: Math.round((a.weak / a.students) * 100),
    avgAccuracy: Math.round((a.accSum / a.students) * 100),
  }));

  // Weakest first (highest weakPct); tie-break by lower avg accuracy, then name.
  topics.sort((x, y) => y.weakPct - x.weakPct || x.avgAccuracy - y.avgAccuracy || x.topic.localeCompare(y.topic));

  return { count, avgReadiness, topics };
}

/** Minimum institute-code length. The report is unauthenticated, so a longer
 *  minimum makes the endpoint materially harder to enumerate. (A real fix is
 *  binding reports to an authenticated institute account — tracked for later.) */
export const MIN_INST_CODE_LEN = 6;

/** Institute codes are short slugs students never type — keep them URL-safe. */
export function normalizeInstCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
  return code.length >= MIN_INST_CODE_LEN ? code : null;
}
