"use client";

/**
 * LandingV3 — "editorial big-type minimal".
 *
 * Direction chosen by the owner: mostly white, enormous tight headline, lots of
 * whitespace, thin hairline rules, a single blue accent, calm product shot.
 * Serious / grown-up (Stripe / Notion register), deliberately NOT the bento,
 * gradient, card-heavy look of LandingV2.
 *
 * Rules that keep it "editorial":
 *  - One accent only (--color-blue-ink). Everything else is ink / grey / white.
 *  - Structure is carried by type scale + hairline rules, not boxes/shadows.
 *  - Generous vertical rhythm; narrow measure for body text.
 */

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Menu, X } from "lucide-react";

interface Props {
  onNavigate: (view: string) => void;
}

/* Calm, hairline product shot — a restrained planner (no gradients/glow). */
const CHAPTERS = [
  { name: "Laws of Motion", subject: "Physics" },
  { name: "Thermodynamics", subject: "Chemistry" },
  { name: "Integrals", subject: "Mathematics" },
  { name: "Electrostatics", subject: "Physics" },
];

const ProductShot: React.FC = () => {
  const [done, setDone] = useState<Record<number, boolean>>({ 0: true });
  const pct = useMemo(
    () => Math.round((Object.values(done).filter(Boolean).length / CHAPTERS.length) * 100),
    [done],
  );
  return (
    <div className="border border-[var(--color-ink)]/12 bg-white">
      <div className="flex items-center justify-between border-b border-[var(--color-ink)]/10 px-5 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-[.18em] text-[var(--color-ink-faint)]">
          Study plan
        </span>
        <span className="text-[11px] font-mono text-[var(--color-ink-faint)]">{pct}% covered</span>
      </div>
      {/* thin progress rule */}
      <div className="h-px w-full bg-[var(--color-ink)]/10">
        <div className="h-px bg-[var(--color-blue-ink)] transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <ul>
        {CHAPTERS.map((c, i) => {
          const on = Boolean(done[i]);
          return (
            <li key={c.name} className="border-b border-[var(--color-ink)]/8 last:border-0">
              <button
                onClick={() => setDone((p) => ({ ...p, [i]: !p[i] }))}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[var(--color-paper-card)]"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center border transition ${
                    on
                      ? "border-[var(--color-blue-ink)] bg-[var(--color-blue-ink)] text-white"
                      : "border-[var(--color-ink)]/25 text-transparent"
                  }`}
                >
                  <Check className="h-3 w-3" strokeWidth={3.5} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-[14px] ${on ? "text-[var(--color-ink)]" : "text-[var(--color-ink-soft)]"}`}>
                    {c.name}
                  </span>
                </span>
                <span className="text-[11px] uppercase tracking-[.12em] text-[var(--color-ink-faint)]">{c.subject}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const STATS = [
  { n: "138", l: "chapters" },
  { n: "290", l: "questions" },
  { n: "70", l: "past papers" },
  { n: "₹0", l: "to start" },
];

const STEPS = [
  { k: "01", t: "Plan", d: "Your full JEE & NEET syllabus — 138 chapters, tracked across learn, practise and revise." },
  { k: "02", t: "Practise", d: "A 290-question bank, past-paper sets and mocks that run like the real NTA interface." },
  { k: "03", t: "Track", d: "Scores, weak topics and streaks after every test. You see where you stand — you don't guess." },
];

const FEATURES = [
  { href: "/planner", t: "Study planner", d: "The whole syllabus, chapter by chapter." },
  { href: "/mock-test", t: "Mock tests", d: "Real NTA-style interface and marking." },
  { href: "/question-bank", t: "Question bank", d: "290 questions, by topic and difficulty." },
  { href: "/previous-year-papers", t: "Past papers", d: "Previous-year sets, solved and explained." },
  { href: "/flashcards", t: "Flashcards", d: "Spaced repetition that actually sticks." },
  { href: "/my-progress", t: "Progress", d: "Scores over time, subject by subject." },
];

export const LandingV3: React.FC<Props> = ({ onNavigate }) => {
  const [menu, setMenu] = useState(false);
  const go = (v: string) => onNavigate(v);

  return (
    <div className="min-h-screen bg-white text-[var(--color-ink)]">
      {/* ── NAV — thin, quiet ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-ink)]/10 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-6">
          <button onClick={() => go("landing")} className="text-[15px] font-bold tracking-[-.02em]">
            BlueBottleCap
          </button>
          <nav className="hidden items-center gap-9 text-[13.5px] text-[var(--color-ink-soft)] md:flex">
            <a href="#how" className="transition hover:text-[var(--color-ink)]">How it works</a>
            <a href="#features" className="transition hover:text-[var(--color-ink)]">Features</a>
            <Link href="/pricing" className="transition hover:text-[var(--color-ink)]">Pricing</Link>
            <Link href="/for-institutes" className="transition hover:text-[var(--color-ink)]">Institutes</Link>
          </nav>
          <div className="flex items-center gap-5">
            <button onClick={() => go("signup")} className="hidden text-[13.5px] text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)] sm:block">
              Sign in
            </button>
            <button
              onClick={() => go("tools")}
              className="inline-flex items-center gap-1.5 bg-[var(--color-ink)] px-4 py-2 text-[13.5px] font-semibold text-white transition hover:bg-[var(--color-blue-ink)]"
            >
              Start free
            </button>
            <button onClick={() => setMenu((v) => !v)} className="text-[var(--color-ink-soft)] md:hidden" aria-label="Menu">
              {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menu && (
          <div className="flex flex-col gap-1 border-t border-[var(--color-ink)]/10 px-6 py-3 text-[14.5px] md:hidden">
            <a href="#how" onClick={() => setMenu(false)} className="py-2">How it works</a>
            <a href="#features" onClick={() => setMenu(false)} className="py-2">Features</a>
            <Link href="/pricing" className="py-2">Pricing</Link>
            <Link href="/for-institutes" className="py-2">Institutes</Link>
          </div>
        )}
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1120px] px-6">
        <div className="grid items-end gap-12 py-20 md:py-28 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[.22em] text-[var(--color-ink-faint)]">
              JEE · NEET · B.Tech
            </p>
            <h1 className="mt-7 text-[clamp(44px,7.5vw,88px)] font-extrabold leading-[0.97] tracking-[-.045em]">
              Know what to
              <br />
              study <span className="text-[var(--color-blue-ink)]">next.</span>
            </h1>
            <p className="mt-8 max-w-[42ch] text-[18px] leading-[1.55] text-[var(--color-ink-soft)]">
              A quiet workspace that plans your syllabus, tracks what you&apos;ve learnt, and shows
              exactly where you stand.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <button
                onClick={() => go("tools")}
                className="inline-flex items-center gap-2 bg-[var(--color-ink)] px-7 py-4 text-[15px] font-semibold text-white transition hover:bg-[var(--color-blue-ink)]"
              >
                Start studying free <ArrowRight className="h-4 w-4" />
              </button>
              <a href="#how" className="group inline-flex items-center gap-1.5 text-[15px] font-semibold text-[var(--color-ink)]">
                See how it works
                <ArrowUpRight className="h-4 w-4 text-[var(--color-ink-faint)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
            <p className="mt-6 text-[13px] text-[var(--color-ink-faint)]">
              No signup to try · No card · Free credits every day
            </p>
          </div>
          <div className="lg:pb-2">
            <ProductShot />
          </div>
        </div>
      </section>

      {/* ── STATS — hairline inline row ──────────────────────────────── */}
      <section className="border-y border-[var(--color-ink)]/10">
        <div className="mx-auto grid max-w-[1120px] grid-cols-2 px-6 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.l}
              className={`py-10 ${i !== 0 ? "sm:border-l sm:border-[var(--color-ink)]/10 sm:pl-8" : ""}`}
            >
              <p className="text-[clamp(34px,4vw,48px)] font-extrabold leading-none tracking-[-.03em]">{s.n}</p>
              <p className="mt-2 text-[12px] uppercase tracking-[.16em] text-[var(--color-ink-faint)]">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW — editorial three-part statement ─────────────────────── */}
      <section id="how" className="mx-auto max-w-[1120px] px-6 py-24">
        <h2 className="max-w-[16ch] text-[clamp(30px,4.5vw,56px)] font-extrabold leading-[1.02] tracking-[-.035em]">
          Plan it. Practise it. Watch it move.
        </h2>
        <div className="mt-16 grid gap-px border border-[var(--color-ink)]/10 bg-[var(--color-ink)]/10 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.t} className="bg-white p-8">
              <p className="font-mono text-[13px] text-[var(--color-blue-ink)]">{s.k}</p>
              <h3 className="mt-6 text-[24px] font-bold tracking-[-.02em]">{s.t}</h3>
              <p className="mt-3 text-[15px] leading-[1.6] text-[var(--color-ink-soft)]">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES — clean hairline list ───────────────────────────── */}
      <section id="features" className="border-t border-[var(--color-ink)]/10">
        <div className="mx-auto max-w-[1120px] px-6 py-24">
          <div className="flex items-end justify-between gap-6">
            <h2 className="max-w-[14ch] text-[clamp(30px,4.5vw,56px)] font-extrabold leading-[1.02] tracking-[-.035em]">
              Everything your syllabus needs.
            </h2>
            <p className="hidden max-w-[24ch] text-[14px] leading-[1.6] text-[var(--color-ink-soft)] sm:block">
              One workspace. Your material, your practice, your progress — together.
            </p>
          </div>
          <div className="mt-14 border-t border-[var(--color-ink)]/10">
            {FEATURES.map((f, i) => (
              <Link
                key={f.t}
                href={f.href}
                className="group flex items-center gap-6 border-b border-[var(--color-ink)]/10 py-6 transition hover:bg-[var(--color-paper-card)]"
              >
                <span className="w-10 font-mono text-[13px] text-[var(--color-ink-faint)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="w-[40%] shrink-0 text-[19px] font-bold tracking-[-.02em] md:w-[28%]">{f.t}</span>
                <span className="hidden flex-1 text-[15px] text-[var(--color-ink-soft)] md:block">{f.d}</span>
                <ArrowUpRight className="ml-auto h-5 w-5 text-[var(--color-ink-faint)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--color-blue-ink)]" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING LINE — one honest sentence ───────────────────────── */}
      <section className="border-t border-[var(--color-ink)]/10">
        <div className="mx-auto max-w-[1120px] px-6 py-24">
          <p className="text-[12px] font-semibold uppercase tracking-[.22em] text-[var(--color-ink-faint)]">Pricing</p>
          <p className="mt-6 max-w-[20ch] text-[clamp(26px,3.6vw,42px)] font-extrabold leading-[1.1] tracking-[-.03em]">
            Free every day. Pay only for AI.
          </p>
          <p className="mt-5 max-w-[46ch] text-[16px] leading-[1.6] text-[var(--color-ink-soft)]">
            Planner, question bank, past papers, flashcards, progress and the timer are free — forever.
            AI tools use credits, and you get a fresh batch free each day.
          </p>
          <Link href="/pricing" className="mt-8 inline-flex items-center gap-1.5 text-[15px] font-semibold text-[var(--color-blue-ink)]">
            See pricing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── CLOSING — big type ───────────────────────────────────────── */}
      <section className="border-t border-[var(--color-ink)]/10">
        <div className="mx-auto max-w-[1120px] px-6 py-28 text-center">
          <h2 className="mx-auto max-w-[16ch] text-[clamp(36px,6vw,76px)] font-extrabold leading-[1.0] tracking-[-.04em]">
            Stop guessing. Start knowing.
          </h2>
          <button
            onClick={() => go("tools")}
            className="mt-10 inline-flex items-center gap-2 bg-[var(--color-ink)] px-8 py-4 text-[16px] font-semibold text-white transition hover:bg-[var(--color-blue-ink)]"
          >
            Start studying free <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ── FOOTER — minimal ─────────────────────────────────────────── */}
      <footer className="border-t border-[var(--color-ink)]/10">
        <div className="mx-auto flex max-w-[1120px] flex-col items-start justify-between gap-4 px-6 py-10 text-[13px] text-[var(--color-ink-faint)] sm:flex-row sm:items-center">
          <span className="font-bold text-[var(--color-ink)]">BlueBottleCap</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/pricing" className="transition hover:text-[var(--color-ink)]">Pricing</Link>
            <Link href="/for-institutes" className="transition hover:text-[var(--color-ink)]">Institutes</Link>
            <Link href="/terms" className="transition hover:text-[var(--color-ink)]">Terms</Link>
            <Link href="/refunds" className="transition hover:text-[var(--color-ink)]">Refunds</Link>
          </div>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingV3;
