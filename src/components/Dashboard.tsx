"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Sparkles, ArrowRight, Zap, FileText, BookOpen, Layers, Clock, Flame, Target,
  Camera, FlaskConical, Brain, ScrollText, BarChart3, Map, Crown, Search,
  Bell, Play, Plus, TrendingUp, ChevronDown, CheckCircle2, Circle, type LucideIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGlobalState } from "../context/GlobalStateContext";
import { getMockResults, MOCK_TESTS, type MockTestResult } from "../lib/mockTest";
import { ReadinessCard } from "./ReadinessCard";
import { StreakSaveBanner } from "./StreakSaveBanner";
import { evaluateStreak, isFreeSaveAvailable } from "../lib/streak";

/* ── Sidebar ────────────────────────────────────────────────────────────
   Contextual study nav. Deliberately lists real routes only — the global
   header stays for site-wide navigation, this is the working set. */
const SIDEBAR: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", Icon: Map },
  { href: "/mock-test", label: "Mock Tests", Icon: FileText },
  { href: "/question-bank", label: "Question Bank", Icon: BookOpen },
  { href: "/previous-year-papers", label: "Past Papers", Icon: ScrollText },
  { href: "/diagnostic", label: "Diagnostic", Icon: Target },
  { href: "/flashcards", label: "Flashcards", Icon: Brain },
  { href: "/pdf-editor", label: "PDF Copilot", Icon: Sparkles },
  { href: "/formula-sheet", label: "Formula Sheets", Icon: FlaskConical },
  { href: "/scan-notes", label: "Scan Notes", Icon: Camera },
  { href: "/tools", label: "File Tools", Icon: Layers },
  { href: "/study-timer", label: "Study Timer", Icon: Clock },
  { href: "/my-progress", label: "My Progress", Icon: BarChart3 },
];

const QUICK_LINKS = [
  { href: "/mock-test", label: "Take a mock", Icon: FileText },
  { href: "/formula-sheet", label: "Formula sheet", Icon: FlaskConical },
  { href: "/scan-notes", label: "Scan notes", Icon: Camera },
  { href: "/pdf-editor", label: "Ask a PDF", Icon: Sparkles },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** Per-subject accuracy across every completed mock. */
function subjectAccuracy(results: MockTestResult[]) {
  const acc: Record<string, { correct: number; total: number }> = {};
  results.forEach((r) => {
    const test = MOCK_TESTS.find((t) => t.id === r.testId);
    if (!test) return;
    test.questions.forEach((q) => {
      acc[q.subject] ||= { correct: 0, total: 0 };
      acc[q.subject].total++;
      if (r.answers[q.id] === q.correct) acc[q.subject].correct++;
    });
  });
  return Object.entries(acc)
    .map(([subject, v]) => ({ subject, pct: v.total ? Math.round((v.correct / v.total) * 100) : 0, ...v }))
    .sort((a, b) => a.pct - b.pct);
}

const StatCard: React.FC<{
  label: string; value: string; sub?: string; Icon: LucideIcon; tint: string; children?: React.ReactNode;
}> = ({ label, value, sub, Icon, tint, children }) => (
  <div className={`rounded-2xl border p-5 ${tint}`}>
    <div className="flex items-start justify-between">
      <p className="text-[13px] font-semibold text-[var(--color-ink-soft)]">{label}</p>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </span>
    </div>
    <p className="mt-3 text-[30px] font-bold leading-none tracking-[-.03em] text-[var(--color-ink)]">{value}</p>
    {sub && <p className="mt-2 text-[12px] text-[var(--color-ink-faint)]">{sub}</p>}
    {children}
  </div>
);

const Panel: React.FC<{ title: string; action?: { href: string; label: string }; children: React.ReactNode; className?: string }> =
  ({ title, action, children, className = "" }) => (
  <div className={`rounded-2xl border border-[var(--color-line)] bg-white p-5 ${className}`}>
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-[15px] font-bold tracking-[-.01em] text-[var(--color-ink)]">{title}</h2>
      {action && (
        <Link href={action.href} className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--color-blue-ink)] hover:underline">
          {action.label} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
    {children}
  </div>
);

export const Dashboard: React.FC = () => {
  const { userStats, recentActivities, todayReviewsCount, lastLoggedDate, saveStreakToday, freeStreakSaveMonth, showToast } = useGlobalState();
  const { currentUser, userProfile } = useAuth();
  const [results, setResults] = useState<MockTestResult[]>([]);

  useEffect(() => { setResults(getMockResults()); }, []);

  const name = (userProfile?.name || currentUser?.displayName || "").split(" ")[0] || "there";
  const initials = (userProfile?.name || currentUser?.email || "S").slice(0, 2).toUpperCase();
  const isPro = userStats.activePlan === "Pro";

  const stats = useMemo(() => {
    const scores = results.map((r) => Math.round((r.score / r.maxScore) * 100));
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const best = scores.length ? Math.max(...scores) : 0;
    return { count: results.length, avg, best, scores: scores.slice(-7) };
  }, [results]);

  const weakest = useMemo(() => subjectAccuracy(results).slice(0, 3), [results]);

  // Next actions are derived from real gaps, not a static list.
  const nextUp = useMemo(() => {
    const out: { label: string; href: string; why: string }[] = [];
    if (stats.count === 0) {
      out.push({ label: "Take the 2-minute diagnostic", href: "/diagnostic", why: "Find your weak topics first" });
      out.push({ label: "Try a JEE Mini Mock", href: "/mock-test", why: "10 questions, 30 minutes" });
    } else {
      const w = weakest[0];
      if (w && w.pct < 70) out.push({ label: `Revise ${w.subject}`, href: "/question-bank", why: `${w.pct}% accuracy so far` });
      out.push({ label: "Take another mock", href: "/mock-test", why: "Track your score trend" });
    }
    if (todayReviewsCount > 0) out.push({ label: `${todayReviewsCount} flashcards due`, href: "/flashcards", why: "Spaced repetition" });
    out.push({ label: "Build a formula sheet", href: "/formula-sheet", why: "One page per chapter" });
    return out.slice(0, 4);
  }, [stats.count, weakest, todayReviewsCount]);

  // Signature is (streakDays, lastLoggedDate) — not the other way round.
  const streakInfo = useMemo(
    () => evaluateStreak(userStats.streakDays, lastLoggedDate ?? ""),
    [userStats.streakDays, lastLoggedDate],
  );
  const canSave = isFreeSaveAvailable(freeStreakSaveMonth ?? null);

  return (
    <div className="bbc min-h-screen bg-[var(--color-paper-card)]">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 lg:px-6">
        {/* ── SIDEBAR ─────────────────────────────────────────────── */}
        <aside className="hidden w-[228px] shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-[var(--color-line)] bg-white p-3">
            <nav className="space-y-0.5" aria-label="Study">
              {SIDEBAR.map((item) => {
                const active = item.href === "/dashboard";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition ${
                      active
                        ? "bg-[var(--color-blue-ink)] text-white"
                        : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-card)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    <item.Icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {!isPro && (
              <div className="mt-4 rounded-2xl bg-gradient-to-br from-[var(--color-blue-wash)] to-white p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                  <Crown className="h-4 w-4 text-amber-500" />
                </span>
                <p className="mt-2.5 text-[13.5px] font-bold text-[var(--color-ink)]">Upgrade to Pro</p>
                <p className="mt-1 text-[11.5px] leading-snug text-[var(--color-ink-soft)]">
                  Unlimited mocks, AI scans and formula sheets.
                </p>
                <Link href="/pricing" className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--color-blue-ink)] px-3 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[var(--color-blue-deep)]">
                  Upgrade <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-[var(--color-line)] p-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[11px] font-bold text-[var(--color-blue-ink)]">
                {initials}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] font-bold text-[var(--color-ink)]">{userProfile?.name || "Student"}</span>
                <span className="block text-[10.5px] text-[var(--color-ink-faint)]">{userStats.activePlan} plan</span>
              </span>
            </div>
          </div>
        </aside>

        {/* ── MAIN ────────────────────────────────────────────────── */}
        <main className="min-w-0 flex-1">
          {/* Top row */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-4 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-[var(--color-ink-faint)]" />
              <input
                placeholder="Search topics, tools, papers…"
                className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-[var(--color-ink-faint)]"
              />
            </div>
            <Link href="/my-progress" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line)] bg-white">
              <Bell className="h-4 w-4 text-[var(--color-ink-soft)]" />
              {todayReviewsCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-blue-ink)] px-1 text-[9px] font-bold text-white">
                  {todayReviewsCount}
                </span>
              )}
            </Link>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[12px] font-bold text-[var(--color-blue-ink)]">
              {initials}
            </span>
          </div>

          {/* Greeting */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[26px] font-bold tracking-[-.03em] text-[var(--color-ink)]">
                {greeting()}, {name}! 👋
              </h1>
              <p className="mt-1 text-[14px] text-[var(--color-ink-soft)]">Here&apos;s where your prep stands today.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-white px-3.5 py-2 text-[13px] font-semibold text-[var(--color-ink-soft)]">
              All time <ChevronDown className="h-3.5 w-3.5" />
            </span>
          </div>

          {streakInfo.saveable && (
            <div className="mb-5">
              <StreakSaveBanner
                streakDays={userStats.streakDays}
                onSaved={() => saveStreakToday()}
                freeSaveAvailable={canSave}
                onFreeSave={() => saveStreakToday({ free: true })}
                showToast={showToast}
              />
            </div>
          )}

          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Tests taken" value={`${stats.count}`} Icon={FileText}
                      tint="border-[var(--color-line)] bg-white"
                      sub={stats.count ? `Best ${stats.best}%` : "No mocks yet"}>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--color-line)]">
                <div className="h-full rounded-full bg-[var(--color-blue-ink)]" style={{ width: `${Math.min(stats.count * 10, 100)}%` }} />
              </div>
            </StatCard>

            <StatCard label="Average score" value={`${stats.avg}%`} Icon={TrendingUp}
                      tint="border-[var(--color-line)] bg-[var(--color-blue-wash)]"
                      sub={stats.count ? `Across ${stats.count} test${stats.count === 1 ? "" : "s"}` : "Take a mock to begin"}>
              <div className="mt-3 flex h-8 items-end gap-1">
                {(stats.scores.length ? stats.scores : [0, 0, 0, 0, 0]).map((s, i) => (
                  <span key={i} className="flex-1 rounded-sm bg-[var(--color-blue-ink)]/40" style={{ height: `${Math.max(s, 4)}%` }} />
                ))}
              </div>
            </StatCard>

            <StatCard label="Study streak" value={`${userStats.streakDays}`} Icon={Flame}
                      tint="border-[var(--color-line)] bg-amber-50/70"
                      sub={userStats.streakDays > 0 ? "days in a row — keep it up" : "Start today"}>
              <div className="mt-3 flex gap-1.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} className={`h-4 w-4 rounded-full border ${
                    i < Math.min(userStats.streakDays, 7)
                      ? "border-amber-400 bg-amber-400"
                      : "border-[var(--color-line-strong)] bg-white"
                  }`} />
                ))}
              </div>
            </StatCard>

            <StatCard label="Cards due today" value={`${todayReviewsCount}`} Icon={Brain}
                      tint="border-[var(--color-line)] bg-emerald-50/70"
                      sub={todayReviewsCount > 0 ? "Review to keep retention" : "Nothing due — nice"}>
              <Link href="/flashcards" className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700 hover:underline">
                Open flashcards <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </StatCard>
          </div>

          {/* Middle row */}
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Panel title="Up next" action={{ href: "/my-progress", label: "See progress" }}>
              <ul className="space-y-2.5">
                {nextUp.map((n) => (
                  <li key={n.label}>
                    <Link href={n.href} className="flex items-start gap-3 rounded-xl border border-[var(--color-line)] px-3 py-2.5 transition hover:border-[var(--color-blue-ink)]/40 hover:bg-[var(--color-paper-card)]">
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-ink-faint)]" />
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-semibold text-[var(--color-ink)]">{n.label}</span>
                        <span className="block text-[11.5px] text-[var(--color-ink-faint)]">{n.why}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Weakest subjects" action={{ href: "/question-bank", label: "Practise" }}>
              {weakest.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-[var(--color-ink-faint)]">
                  Take a mock test and your subject breakdown appears here.
                </p>
              ) : (
                <ul className="space-y-3.5">
                  {weakest.map((w) => (
                    <li key={w.subject}>
                      <div className="flex items-baseline justify-between text-[13px]">
                        <span className="font-semibold text-[var(--color-ink)]">{w.subject}</span>
                        <span className="font-bold text-[var(--color-ink-faint)]">{w.pct}%</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--color-line)]">
                        <div className={`h-full rounded-full ${w.pct < 40 ? "bg-rose-400" : w.pct < 70 ? "bg-amber-400" : "bg-emerald-500"}`}
                             style={{ width: `${Math.max(w.pct, 3)}%` }} />
                      </div>
                      <p className="mt-1 text-[11px] text-[var(--color-ink-faint)]">{w.correct}/{w.total} correct</p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {/* Focus zone */}
            <div className="rounded-2xl border border-[var(--color-line)] bg-gradient-to-b from-[var(--color-blue-wash)] to-white p-5 text-center">
              <h2 className="text-[15px] font-bold tracking-[-.01em] text-[var(--color-ink)]">Focus zone</h2>
              <span className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                <Clock className="h-7 w-7 text-[var(--color-blue-ink)]" strokeWidth={1.6} />
              </span>
              <p className="mt-4 text-[14px] font-bold text-[var(--color-ink)]">Need to focus?</p>
              <p className="mt-1 text-[12.5px] leading-snug text-[var(--color-ink-soft)]">
                Run a timed session and keep your streak alive.
              </p>
              <Link href="/study-timer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-blue-ink)] px-4 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[var(--color-blue-deep)]">
                <Play className="h-3.5 w-3.5" /> Start focus session
              </Link>
            </div>
          </div>

          {/* Bottom row */}
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Panel title="Score trend" className="lg:col-span-1">
              {stats.count === 0 ? (
                <p className="py-8 text-center text-[13px] text-[var(--color-ink-faint)]">No tests yet.</p>
              ) : (
                <>
                  <p className="flex items-baseline gap-2">
                    <span className="text-[28px] font-bold tracking-[-.03em] text-[var(--color-ink)]">{stats.avg}%</span>
                    <span className="text-[12px] text-[var(--color-ink-faint)]">average</span>
                  </p>
                  <div className="mt-4 flex h-24 items-end gap-2">
                    {stats.scores.map((s, i) => (
                      <span key={i} className="flex-1 rounded-t-md bg-[var(--color-blue-ink)]/75" style={{ height: `${Math.max(s, 4)}%` }} title={`${s}%`} />
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-[var(--color-ink-faint)]">Last {stats.scores.length} test{stats.scores.length === 1 ? "" : "s"}</p>
                </>
              )}
            </Panel>

            <Panel title="Recent activity" action={{ href: "/my-progress", label: "View all" }}>
              {(!recentActivities || recentActivities.length === 0) ? (
                <p className="py-8 text-center text-[13px] text-[var(--color-ink-faint)]">Nothing yet — your activity shows up here.</p>
              ) : (
                <ul className="space-y-2.5">
                  {recentActivities.slice(0, 4).map((a) => (
                    <li key={a.id} className="flex items-start gap-3 rounded-xl border border-[var(--color-line)] px-3 py-2.5">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-blue-wash)]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-blue-ink)]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold text-[var(--color-ink)]">{a.tool}</span>
                        <span className="block truncate text-[11.5px] text-[var(--color-ink-faint)]">{a.target} · {a.date}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Quick links">
              <div className="grid grid-cols-2 gap-2.5">
                {QUICK_LINKS.map((q) => (
                  <Link key={q.href} href={q.href}
                        className="flex flex-col items-start gap-2 rounded-xl border border-[var(--color-line)] p-3 transition hover:border-[var(--color-blue-ink)]/40 hover:bg-[var(--color-paper-card)]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]">
                      <q.Icon className="h-4 w-4" strokeWidth={1.9} />
                    </span>
                    <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">{q.label}</span>
                  </Link>
                ))}
              </div>
              <Link href="/tools" className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--color-line-strong)] py-2.5 text-[12.5px] font-semibold text-[var(--color-ink-soft)] transition hover:border-[var(--color-blue-ink)] hover:text-[var(--color-blue-ink)]">
                <Plus className="h-3.5 w-3.5" /> All tools
              </Link>
            </Panel>
          </div>

          {/* Readiness */}
          <div className="mt-4">
            <ReadinessCard />
          </div>
        </main>
      </div>
    </div>
  );
};
