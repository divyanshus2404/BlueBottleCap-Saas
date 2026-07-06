"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  getMockResults,
  MOCK_TESTS,
  type MockTestResult,
  type MockQuestion,
} from "@/src/lib/mockTest";
import { getProgressHistory, type DayEntry } from "@/src/lib/progressTracker";
import { useAuth } from "@/src/context/AuthContext";
import { useGlobalState } from "@/src/context/GlobalStateContext";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Flame,
  Clock,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  BookOpen,
  User,
  Lightbulb,
  ArrowRight,
  Shield,
  Star,
  ChevronRight,
} from "lucide-react";
import { useCountUp } from "@/src/hooks/useCountUp";

/* ── Helpers ─────────────────────────────────────────────────── */

const ALL_QUESTIONS: MockQuestion[] = MOCK_TESTS.flatMap((t) => t.questions);
const UNIQUE_QUESTIONS = Object.values(
  Object.fromEntries(ALL_QUESTIONS.map((q) => [q.id, q]))
);

interface TopicStat {
  topic: string;
  subject: string;
  attempted: number;
  correct: number;
  accuracy: number;
}

function analyseTopics(results: MockTestResult[]): TopicStat[] {
  const map: Record<string, { topic: string; subject: string; attempted: number; correct: number }> = {};

  for (const r of results) {
    const test = MOCK_TESTS.find((t) => t.id === r.testId);
    if (!test) continue;
    for (const q of test.questions) {
      const key = `${q.subject}::${q.topic}`;
      if (!map[key]) map[key] = { topic: q.topic, subject: q.subject, attempted: 0, correct: 0 };
      const ans = r.answers[q.id];
      if (ans !== null && ans !== undefined) {
        map[key].attempted++;
        if (ans === q.correct) map[key].correct++;
      }
    }
  }

  return Object.values(map)
    .filter((t) => t.attempted > 0)
    .map((t) => ({ ...t, accuracy: Math.round((t.correct / t.attempted) * 100) }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

function getSubjectAccuracy(results: MockTestResult[]) {
  const map: Record<string, { correct: number; total: number }> = {};
  for (const r of results) {
    for (const sb of r.subjectBreakdown) {
      if (!map[sb.subject]) map[sb.subject] = { correct: 0, total: 0 };
      map[sb.subject].correct += sb.correct;
      map[sb.subject].total += sb.total;
    }
  }
  return Object.entries(map).map(([subject, d]) => ({
    subject,
    accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
    correct: d.correct,
    total: d.total,
  }));
}

function getScoreTrend(results: MockTestResult[]) {
  return results.map((r) => ({
    label: new Date(r.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    pct: Math.round((r.score / r.maxScore) * 100),
    name: r.testName,
  }));
}

function generateRecommendations(
  topicStats: TopicStat[],
  results: MockTestResult[],
  subjectAcc: { subject: string; accuracy: number }[],
): { icon: React.ReactNode; title: string; body: string; action?: string; href?: string; priority: number }[] {
  const recs: { icon: React.ReactNode; title: string; body: string; action?: string; href?: string; priority: number }[] = [];

  const weakTopics = topicStats.filter((t) => t.accuracy < 40);
  const midTopics = topicStats.filter((t) => t.accuracy >= 40 && t.accuracy < 60);
  const weakSubject = subjectAcc.sort((a, b) => a.accuracy - b.accuracy)[0];

  if (weakTopics.length > 0) {
    const top3 = weakTopics.slice(0, 3);
    recs.push({
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      title: "Focus on weak topics first",
      body: `You're scoring below 40% in ${top3.map((t) => t.topic).join(", ")}. Revise these concepts and practice more questions before your next mock.`,
      action: "Take a Mock Test",
      href: "/mock-test",
      priority: 1,
    });
  }

  if (weakSubject && weakSubject.accuracy < 50) {
    recs.push({
      icon: <Target className="w-5 h-5 text-amber-500" />,
      title: `${weakSubject.subject} needs more attention`,
      body: `Your ${weakSubject.subject} accuracy is ${weakSubject.accuracy}%. Dedicate extra study sessions to this subject — it could make or break your rank.`,
      action: "Study with PDF Copilot",
      href: "/pdf-editor",
      priority: 2,
    });
  }

  if (results.length >= 2) {
    const last = results[results.length - 1];
    const prev = results[results.length - 2];
    const lastPct = Math.round((last.score / last.maxScore) * 100);
    const prevPct = Math.round((prev.score / prev.maxScore) * 100);
    if (lastPct < prevPct) {
      recs.push({
        icon: <TrendingDown className="w-5 h-5 text-red-500" />,
        title: "Score dip detected",
        body: `Your last score dropped from ${prevPct}% to ${lastPct}%. Don't worry — review the questions you got wrong and try again. Consistency beats perfection.`,
        action: "Retake Mock",
        href: "/mock-test",
        priority: 3,
      });
    } else if (lastPct > prevPct + 10) {
      recs.push({
        icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
        title: "Great improvement!",
        body: `You jumped from ${prevPct}% to ${lastPct}%! Keep this momentum going. Challenge yourself with a full-length mock next.`,
        priority: 8,
      });
    }
  }

  if (midTopics.length > 0) {
    recs.push({
      icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
      title: "Almost-there topics",
      body: `${midTopics.slice(0, 3).map((t) => t.topic).join(", ")} — you're close to mastering these (40-60%). A focused revision session can push them into your strengths.`,
      action: "Use Flashcards",
      href: "/tools",
      priority: 4,
    });
  }

  if (results.length > 0) {
    const latest = results[results.length - 1];
    const unansweredPct = Math.round((latest.unanswered / (latest.correct + latest.incorrect + latest.unanswered)) * 100);
    if (unansweredPct > 20) {
      recs.push({
        icon: <Clock className="w-5 h-5 text-blue-500" />,
        title: "Improve time management",
        body: `You left ${unansweredPct}% questions unanswered in your last test. Practice with timed mini mocks to build speed. Remember: even a guess is better than leaving it blank in JEE.`,
        action: "Practice Mini Mock",
        href: "/mock-test",
        priority: 5,
      });
    }

    const incorrectPct = Math.round((latest.incorrect / (latest.correct + latest.incorrect + latest.unanswered)) * 100);
    if (incorrectPct > 30) {
      recs.push({
        icon: <Shield className="w-5 h-5 text-orange-500" />,
        title: "Reduce negative marking",
        body: `${incorrectPct}% of your answers were wrong in the last test, costing you ${Math.abs(latest.incorrect)} marks in negative marking. Be more selective — skip questions you're unsure about.`,
        priority: 6,
      });
    }
  }

  if (results.length === 0) {
    recs.push({
      icon: <BookOpen className="w-5 h-5 text-[var(--color-blue-ink)]" />,
      title: "Take your first mock test",
      body: "Start with a 30-minute mini mock to benchmark yourself. Your strengths and weaknesses will appear here after your first attempt.",
      action: "Start Now",
      href: "/mock-test",
      priority: 0,
    });
  }

  return recs.sort((a, b) => a.priority - b.priority);
}

function computeReadiness(avgScore: number, streakDays: number, activeDays: number, testsCount: number): { score: number; label: string; color: string } {
  let score = 0;
  score += Math.min(avgScore * 0.5, 50);
  score += Math.min(streakDays * 2, 15);
  score += Math.min(activeDays * 0.5, 15);
  score += Math.min(testsCount * 5, 20);
  score = Math.round(Math.min(score, 100));
  const label = score >= 80 ? "Exam Ready" : score >= 60 ? "Getting There" : score >= 35 ? "Building Up" : "Just Starting";
  const color = score >= 80 ? "#10b981" : score >= 60 ? "var(--color-blue-ink)" : score >= 35 ? "#f59e0b" : "#ef4444";
  return { score, label, color };
}

const SUBJECT_COLORS: Record<string, string> = {
  Physics: "var(--color-blue-ink)",
  Chemistry: "#10b981",
  Maths: "#f59e0b",
};

const SUBJECT_BG: Record<string, string> = {
  Physics: "var(--color-blue-wash)",
  Chemistry: "rgba(16,185,129,.12)",
  Maths: "rgba(245,158,11,.12)",
};

/* ── Sub-components ──────────────────────────────────────────── */

function ProfileCard({ name, email, avatarSvg, streakDays, plan, readiness }: {
  name: string; email: string; avatarSvg?: string; streakDays: number; plan: string;
  readiness: { score: number; label: string; color: string };
}) {
  const initials = name ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (readiness.score / 100) * circumference;

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar + Readiness Ring */}
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 96 96" className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="48" cy="48" r="42" fill="none" stroke="var(--color-line)" strokeWidth="5" />
            <circle cx="48" cy="48" r="42" fill="none" stroke={readiness.color} strokeWidth="5"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-[6px] rounded-full bg-[var(--color-paper-card)] flex items-center justify-center overflow-hidden">
            {avatarSvg ? (
              <div dangerouslySetInnerHTML={{ __html: avatarSvg }} className="w-full h-full" />
            ) : (
              <span className="text-2xl font-bold text-[var(--color-blue-ink)]">{initials}</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-2xl font-extrabold text-[var(--color-ink)]">{name || "Student"}</h2>
          {email && <p className="text-sm text-[var(--color-ink-faint)] mt-0.5">{email}</p>}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300">
              <Flame className="w-3.5 h-3.5" /> {streakDays}-day streak
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]">
              <Star className="w-3.5 h-3.5" /> {plan} Plan
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: readiness.color + "18", color: readiness.color }}>
              <Target className="w-3.5 h-3.5" /> {readiness.score}% — {readiness.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-5 flex items-start gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]">
        {icon}
      </div>
      <div>
        <p className="text-sm text-[var(--color-ink-soft)]">{label}</p>
        <p className="text-2xl font-bold text-[var(--color-ink)] mt-0.5">{value}</p>
        {sub && <p className="text-xs text-[var(--color-ink-faint)] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SubjectBar({ subject, accuracy, correct, total }: { subject: string; accuracy: number; correct: number; total: number }) {
  const color = SUBJECT_COLORS[subject] || "var(--color-blue-ink)";
  const bg = SUBJECT_BG[subject] || "var(--color-blue-wash)";
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-[var(--color-ink)]">{subject}</span>
        <span className="text-sm font-bold" style={{ color }}>{accuracy}%</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: bg }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${accuracy}%`, background: color }} />
      </div>
      <p className="text-xs text-[var(--color-ink-faint)]">{correct}/{total} correct</p>
    </div>
  );
}

function TopicChip({ stat }: { stat: TopicStat }) {
  const isStrong = stat.accuracy >= 70;
  const isWeak = stat.accuracy < 40;
  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${isWeak ? "border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30" : isStrong ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30" : "border-[var(--color-line)] bg-[var(--color-paper-card)]"}`}>
      <div className="flex items-center gap-3 min-w-0">
        {isWeak ? <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" /> : isStrong ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> : <Target className="w-4 h-4 text-[var(--color-ink-faint)] shrink-0" />}
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-ink)] truncate">{stat.topic}</p>
          <p className="text-xs text-[var(--color-ink-faint)]">{stat.subject} · {stat.attempted} attempted</p>
        </div>
      </div>
      <span className={`text-sm font-bold tabular-nums ml-3 ${isWeak ? "text-red-600 dark:text-red-400" : isStrong ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--color-ink-soft)]"}`}>
        {stat.accuracy}%
      </span>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: { icon: React.ReactNode; title: string; body: string; action?: string; href?: string } }) {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{rec.icon}</div>
        <div>
          <h3 className="text-sm font-bold text-[var(--color-ink)]">{rec.title}</h3>
          <p className="text-sm text-[var(--color-ink-soft)] mt-1 leading-relaxed">{rec.body}</p>
        </div>
      </div>
      {rec.action && rec.href && (
        <Link href={rec.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-blue-ink)] hover:underline ml-8">
          {rec.action} <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function ScoreTrendChart({ data }: { data: { label: string; pct: number; name: string }[] }) {
  if (data.length === 0) return null;
  const max = 100;
  const chartH = 180;
  const barW = Math.min(40, 300 / data.length);
  const gap = 8;
  const totalW = data.length * (barW + gap);

  return (
    <div className="overflow-x-auto pb-2">
      <svg width={totalW + 40} height={chartH + 40} className="mx-auto">
        {data.map((d, i) => {
          const barH = (d.pct / max) * chartH;
          const x = 20 + i * (barW + gap);
          const y = chartH - barH + 10;
          const color = d.pct >= 60 ? "var(--color-blue-ink)" : d.pct >= 40 ? "#f59e0b" : "#ef4444";
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx={6} fill={color} opacity={0.85} />
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={11} fontWeight="700" fill="var(--color-ink)">{d.pct}%</text>
              <text x={x + barW / 2} y={chartH + 26} textAnchor="middle" fontSize={10} fill="var(--color-ink-faint)">{d.label}</text>
            </g>
          );
        })}
        <line x1={18} x2={totalW + 22} y1={chartH + 10} y2={chartH + 10} stroke="var(--color-line)" strokeWidth={1} />
      </svg>
    </div>
  );
}

function ActivityHeatmap({ history }: { history: DayEntry[] }) {
  const weeks = 12;
  const today = new Date();
  const cells: { date: string; minutes: number; col: number; row: number }[] = [];

  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    const col = Math.floor((weeks * 7 - 1 - i) / 7);
    cells.push({
      date: dateStr,
      minutes: history.find((e) => e.date === dateStr)?.studyMinutes || 0,
      col,
      row: dayOfWeek,
    });
  }

  const cellSize = 14;
  const gap = 3;

  function getColor(mins: number) {
    if (mins === 0) return "var(--color-line)";
    if (mins < 15) return "rgba(75,111,247,.25)";
    if (mins < 30) return "rgba(75,111,247,.45)";
    if (mins < 60) return "rgba(75,111,247,.65)";
    return "var(--color-blue-ink)";
  }

  return (
    <div className="overflow-x-auto">
      <svg width={(cellSize + gap) * weeks + 10} height={(cellSize + gap) * 7 + 10}>
        {cells.map((c, i) => (
          <rect
            key={i}
            x={c.col * (cellSize + gap) + 2}
            y={c.row * (cellSize + gap) + 2}
            width={cellSize}
            height={cellSize}
            rx={3}
            fill={getColor(c.minutes)}
          >
            <title>{c.date}: {c.minutes} min</title>
          </rect>
        ))}
      </svg>
      <div className="flex items-center gap-2 mt-2 text-xs text-[var(--color-ink-faint)]">
        <span>Less</span>
        {[0, 10, 20, 45, 90].map((m) => (
          <div key={m} className="w-3 h-3 rounded-sm" style={{ background: getColor(m) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

function EmptyState({ name }: { name: string }) {
  return (
    <div className="text-center py-20 px-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-[var(--color-blue-wash)] flex items-center justify-center mb-6">
        <User className="w-10 h-10 text-[var(--color-blue-ink)]" />
      </div>
      <h2 className="text-2xl font-bold text-[var(--color-ink)] mb-2">
        {name ? `Hey ${name.split(" ")[0]}, let's get started!` : "Let's get started!"}
      </h2>
      <p className="text-[var(--color-ink-soft)] max-w-md mx-auto mb-6">
        Take your first mock test. Your personalized strengths, weaknesses, and improvement plan will appear here.
      </p>
      <Link href="/mock-test" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-blue-ink)] text-white font-semibold hover:opacity-90 transition">
        <BookOpen className="w-4 h-4" /> Take a Mock Test
      </Link>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */

export function MyProgress() {
  const { currentUser, userProfile } = useAuth();
  const { userStats } = useGlobalState();

  const results = useMemo(() => getMockResults(), []);
  const history = useMemo(() => getProgressHistory(), []);

  const topicStats = useMemo(() => analyseTopics(results), [results]);
  const subjectAcc = useMemo(() => getSubjectAccuracy(results), [results]);
  const scoreTrend = useMemo(() => getScoreTrend(results), [results]);
  const recommendations = useMemo(() => generateRecommendations(topicStats, results, subjectAcc), [topicStats, results, subjectAcc]);

  const totalStudyMins = history.reduce((a, e) => a + e.studyMinutes, 0);
  const totalCards = history.reduce((a, e) => a + e.cardsReviewed, 0);
  const avgScore = results.length > 0 ? Math.round(results.reduce((a, r) => a + (r.score / r.maxScore) * 100, 0) / results.length) : 0;
  const bestScore = results.length > 0 ? Math.round(Math.max(...results.map((r) => (r.score / r.maxScore) * 100))) : 0;

  const latestResult = results[results.length - 1];
  const prevResult = results.length >= 2 ? results[results.length - 2] : null;
  const scoreDelta = latestResult && prevResult
    ? Math.round((latestResult.score / latestResult.maxScore) * 100) - Math.round((prevResult.score / prevResult.maxScore) * 100)
    : null;

  const strengths = topicStats.filter((t) => t.accuracy >= 70).reverse().slice(0, 5);
  const weaknesses = topicStats.filter((t) => t.accuracy < 50).slice(0, 5);
  const activeDays = history.filter((e) => e.studyMinutes > 0).length;

  const animAvg = useCountUp(avgScore, 1200);
  const animBest = useCountUp(bestScore, 1200);
  const animTests = useCountUp(results.length, 800);
  const animStudyH = useCountUp(Math.floor(totalStudyMins / 60), 1000);
  const animStudyM = useCountUp(totalStudyMins % 60, 1000);

  const displayName = userProfile?.displayName || userProfile?.name || currentUser?.displayName || "";
  const email = userProfile?.email || currentUser?.email || "";
  const avatarSvg = userProfile?.avatarSvg;

  const readiness = computeReadiness(avgScore, userStats.streakDays, activeDays, results.length);

  if (results.length === 0 && history.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <ProfileCard name={displayName} email={email} avatarSvg={avatarSvg} streakDays={userStats.streakDays} plan={userStats.activePlan} readiness={readiness} />
        <EmptyState name={displayName} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Profile Header */}
      <ProfileCard name={displayName} email={email} avatarSvg={avatarSvg} streakDays={userStats.streakDays} plan={userStats.activePlan} readiness={readiness} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Target className="w-5 h-5" />} label="Avg Score" value={`${animAvg}%`} sub={`Best: ${animBest}%`} />
        <StatCard icon={<Flame className="w-5 h-5" />} label="Tests Taken" value={`${animTests}`} sub={`${activeDays} active days`} />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Study Time" value={totalStudyMins >= 60 ? `${animStudyH}h ${animStudyM}m` : `${animStudyM}m`} sub={`${totalCards} cards reviewed`} />
        <StatCard
          icon={scoreDelta !== null && scoreDelta >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          label="Last vs Prev"
          value={scoreDelta !== null ? `${scoreDelta >= 0 ? "+" : ""}${scoreDelta}%` : "—"}
          sub={scoreDelta !== null ? (scoreDelta >= 0 ? "Improving!" : "Needs focus") : "Take 2+ tests"}
        />
      </div>

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-[var(--color-ink)] mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" /> Personalized Recommendations
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {recommendations.slice(0, 4).map((rec, i) => (
              <RecommendationCard key={i} rec={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Subject accuracy + Trend + Heatmap */}
        <div className="lg:col-span-2 space-y-6">
          {subjectAcc.length > 0 && (
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6">
              <h2 className="text-lg font-bold text-[var(--color-ink)] mb-5 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[var(--color-blue-ink)]" /> Subject Accuracy
              </h2>
              <div className="space-y-5">
                {subjectAcc.map((s) => (
                  <SubjectBar key={s.subject} {...s} />
                ))}
              </div>
            </div>
          )}

          {scoreTrend.length > 1 && (
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6">
              <h2 className="text-lg font-bold text-[var(--color-ink)] mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--color-blue-ink)]" /> Score Trend
              </h2>
              <ScoreTrendChart data={scoreTrend} />
            </div>
          )}

          {history.length > 0 && (
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6">
              <h2 className="text-lg font-bold text-[var(--color-ink)] mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" /> Study Activity — Last 12 Weeks
              </h2>
              <ActivityHeatmap history={history} />
            </div>
          )}
        </div>

        {/* Right: Strengths, Weaknesses, Recent Tests */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6">
            <h2 className="text-lg font-bold text-[var(--color-ink)] mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" /> Strengths
            </h2>
            {strengths.length > 0 ? (
              <div className="space-y-3">
                {strengths.map((s) => <TopicChip key={`${s.subject}::${s.topic}`} stat={s} />)}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-ink-faint)]">Take more tests to identify your strong topics.</p>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6">
            <h2 className="text-lg font-bold text-[var(--color-ink)] mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-500" /> Needs Improvement
            </h2>
            {weaknesses.length > 0 ? (
              <div className="space-y-3">
                {weaknesses.map((s) => <TopicChip key={`${s.subject}::${s.topic}`} stat={s} />)}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-ink-faint)]">No weak areas detected yet — keep going!</p>
            )}
          </div>

          {results.length > 0 && (
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6">
              <h2 className="text-lg font-bold text-[var(--color-ink)] mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--color-blue-ink)]" /> Recent Tests
              </h2>
              <div className="space-y-3">
                {results.slice(-5).reverse().map((r, i) => {
                  const pct = Math.round((r.score / r.maxScore) * 100);
                  return (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-[var(--color-line)] px-4 py-3 bg-[var(--color-paper)]">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--color-ink)] truncate">{r.testName}</p>
                        <p className="text-xs text-[var(--color-ink-faint)]">{new Date(r.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                      </div>
                      <span className={`text-sm font-bold tabular-nums ${pct >= 60 ? "text-emerald-600 dark:text-emerald-400" : pct >= 40 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                        {r.score}/{r.maxScore}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
