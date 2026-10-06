"use client";

/**
 * LandingV2 — a fresh, modern landing for BlueBottleCap.
 *
 * Direction: one audience (JEE/NEET students), one promise ("know what to
 * study next"), and the product shown rather than described. Layout leans on
 * current patterns that read as "new": an interactive hero demo, a bento
 * feature grid with varied cell sizes, big type, soft shadows and generous
 * whitespace. Self-contained (no data deps) so it can be previewed at
 * /landing-v2 and compared with the current page before we switch.
 */

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Card, StatTile, SectionHeading } from "./ui";
import {
  ArrowRight,
  Check,
  Menu,
  X,
  CalendarCheck,
  ClipboardList,
  LineChart,
  BookOpen,
  Layers,
  Camera,
  Sparkles,
  Timer,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

interface Props {
  onNavigate: (view: string) => void;
}

/* ── Brand mark ─────────────────────────────────────────────────────── */
const Mark = ({ size = 30 }: { size?: number }) => (
  <span
    className="inline-flex items-center justify-center rounded-xl"
    style={{
      width: size,
      height: size,
      background: "linear-gradient(135deg, var(--color-blue-ink), var(--color-blue-deep))",
    }}
  >
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="2" width="6" height="4" rx="1.4" fill="white" />
      <path d="M8 6h8v13a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V6Z" fill="white" fillOpacity="0.85" />
    </svg>
  </span>
);

/* ── Interactive planner demo (the hero's live proof) ───────────────── */
const HERO_CHAPTERS = [
  { name: "Laws of Motion", subject: "Physics" },
  { name: "Thermodynamics", subject: "Chemistry" },
  { name: "Integrals", subject: "Maths" },
  { name: "Electrostatics", subject: "Physics" },
  { name: "Chemical Bonding", subject: "Chemistry" },
];

const PlannerDemo: React.FC = () => {
  const [done, setDone] = useState<Record<number, boolean>>({ 0: true });
  const pct = useMemo(() => {
    const d = Object.values(done).filter(Boolean).length;
    return Math.round((d / HERO_CHAPTERS.length) * 100);
  }, [done]);

  return (
    <div className="rounded-[26px] border border-[var(--color-line)] bg-white p-5 shadow-[0_40px_90px_-50px_rgba(12,21,36,.5)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]">
            <CalendarCheck className="h-4 w-4" />
          </span>
          <p className="text-[13.5px] font-bold text-[var(--color-ink)]">Your study plan</p>
        </div>
        <span className="rounded-full bg-[var(--color-blue-wash)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-blue-ink)]">
          Try it ↓
        </span>
      </div>

      {/* progress */}
      <div className="mt-4">
        <div className="flex items-end justify-between">
          <p className="text-[12px] font-semibold text-[var(--color-ink-faint)]">Syllabus covered</p>
          <p className="text-[22px] font-extrabold leading-none text-[var(--color-ink)]">{pct}%</p>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--color-line)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-blue-ink)] to-[var(--color-blue-deep)] transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* chapters */}
      <div className="mt-4 space-y-1.5">
        {HERO_CHAPTERS.map((c, i) => {
          const on = Boolean(done[i]);
          return (
            <button
              key={c.name}
              onClick={() => setDone((p) => ({ ...p, [i]: !p[i] }))}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                on
                  ? "border-[var(--color-blue-ink)]/30 bg-[var(--color-blue-wash)]"
                  : "border-[var(--color-line)] bg-white hover:border-[var(--color-line-strong)]"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                  on
                    ? "border-[var(--color-blue-ink)] bg-[var(--color-blue-ink)] text-white"
                    : "border-[var(--color-line-strong)] text-transparent"
                }`}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-[13px] font-semibold ${
                    on ? "text-[var(--color-ink)]" : "text-[var(--color-ink-soft)]"
                  }`}
                >
                  {c.name}
                </span>
                <span className="block text-[11px] text-[var(--color-ink-faint)]">{c.subject}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[11px] text-[var(--color-ink-faint)]">
        Tap a chapter — this is the real planner.
      </p>
    </div>
  );
};

/* ── Stats ──────────────────────────────────────────────────────────── */
const STATS = [
  { n: "138", l: "chapters mapped" },
  { n: "290+", l: "practice questions" },
  { n: "70", l: "past-paper questions" },
  { n: "80", l: "flashcards" },
  { n: "₹0", l: "to start" },
];

/* ── Bento cells ────────────────────────────────────────────────────── */
const TINT = {
  blue: "bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]",
  violet: "bg-violet-50 text-violet-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
} as const;

export const LandingV2: React.FC<Props> = ({ onNavigate }) => {
  const [menu, setMenu] = useState(false);
  const [faq, setFaq] = useState<number | null>(0);

  const go = (v: string) => onNavigate(v);

  const faqs = [
    {
      q: "Is it really free?",
      a: "Yes. The syllabus planner, question bank, past-paper practice, progress tracking, flashcards and the study timer are free forever. You only spend credits on AI features, and you get free credits every day.",
    },
    {
      q: "Do I need to sign up to try it?",
      a: "No. You can open the tools and start practising straight away. Sign in only when you want your progress saved to your account.",
    },
    {
      q: "Are these real exam questions?",
      a: "They are exam-pattern questions modelled on previous JEE & NEET papers, each with a worked solution. The mock interface mirrors the real NTA layout and marking — it's for practice, not an official score.",
    },
    {
      q: "What do credits pay for?",
      a: "Only the AI tools — PDF Copilot, formula sheets, note scanning, question generation. Everything that doesn't cost us per use stays free.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[var(--color-ink)]">
      {/* ── NAV ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-line)]/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5">
          <button onClick={() => go("landing")} className="flex items-center gap-2.5" aria-label="Home">
            <Mark />
            <span className="text-[18px] font-extrabold tracking-[-.02em]">BlueBottleCap</span>
          </button>
          <nav className="hidden items-center gap-8 text-[14.5px] font-medium text-[var(--color-ink-soft)] md:flex">
            <a href="#features" className="transition hover:text-[var(--color-ink)]">Features</a>
            <a href="#loop" className="transition hover:text-[var(--color-ink)]">How it works</a>
            <Link href="/pricing" className="transition hover:text-[var(--color-ink)]">Pricing</Link>
            <Link href="/for-institutes" className="transition hover:text-[var(--color-ink)]">For institutes</Link>
          </nav>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => go("signup")}
              className="hidden text-[14.5px] font-semibold text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)] sm:block"
            >
              Sign in
            </button>
            <button
              onClick={() => go("tools")}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--color-blue-ink)] px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[var(--color-blue-deep)]"
            >
              Start free <ArrowRight className="hidden h-4 w-4 sm:inline" />
            </button>
            <button
              onClick={() => setMenu((v) => !v)}
              className="text-[var(--color-ink-soft)] md:hidden"
              aria-label="Menu"
            >
              {menu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {menu && (
          <div className="flex flex-col gap-1 border-t border-[var(--color-line)] px-5 py-3 text-[15px] font-medium md:hidden">
            <a href="#features" onClick={() => setMenu(false)} className="py-2">Features</a>
            <a href="#loop" onClick={() => setMenu(false)} className="py-2">How it works</a>
            <Link href="/pricing" className="py-2">Pricing</Link>
            <Link href="/for-institutes" className="py-2">For institutes</Link>
          </div>
        )}
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* soft mesh background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 15% 0%, var(--color-blue-wash) 0%, rgba(255,255,255,0) 60%), radial-gradient(50% 50% at 100% 10%, #F3EEFF 0%, rgba(255,255,255,0) 55%)",
          }}
        />
        <div className="relative mx-auto grid max-w-[1180px] items-center gap-12 px-5 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-white/70 px-3.5 py-1.5 text-[12.5px] font-semibold text-[var(--color-ink-soft)] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> For JEE · NEET · B.Tech · GATE
            </span>
            <h1 className="mt-6 text-[clamp(38px,5.6vw,66px)] font-extrabold leading-[1.02] tracking-[-.04em]">
              Always know
              <br />
              <span className="bg-gradient-to-r from-[var(--color-blue-ink)] to-violet-600 bg-clip-text text-transparent">
                what to study next.
              </span>
            </h1>
            <p className="mt-6 max-w-[48ch] text-[17px] leading-[1.6] text-[var(--color-ink-soft)]">
              One calm workspace that maps your whole syllabus, tracks what you&apos;ve learnt, and gives
              you exam-pattern mocks, a 290-question bank and flashcards — so you always know where you
              stand.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => go("tools")}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-blue-ink)] px-7 py-4 text-[16px] font-semibold text-white shadow-[0_18px_40px_-18px_var(--color-blue-ink)] transition hover:bg-[var(--color-blue-deep)]"
              >
                Start studying free <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#loop"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line-strong)] bg-white px-7 py-4 text-[16px] font-semibold transition hover:border-[var(--color-blue-ink)] hover:text-[var(--color-blue-ink)]"
              >
                See how it works
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] text-[var(--color-ink-faint)]">
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" /> No signup to try</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" /> No card needed</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" /> Free credits daily</span>
            </div>
          </div>
          <div className="lg:pl-6">
            <PlannerDemo />
          </div>
        </div>

        {/* stats band */}
        <div className="relative mx-auto w-full max-w-none px-5 pb-14">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-line)] sm:grid-cols-3 lg:grid-cols-5">
            {STATS.map((s) => (
              <StatTile key={s.l} value={s.n} label={s.l} className="bg-white px-5 py-6" />
            ))}
          </div>
        </div>
      </section>

      {/* ── THE LOOP ─────────────────────────────────────────────────── */}
      <section id="loop" className="mx-auto w-full max-w-none px-5 py-20">
        <SectionHeading
          eyebrow="How it works"
          title="Plan it. Practise it. Watch it move."
          subtitle="Three steps that feed each other — the whole reason the app exists."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { Icon: ClipboardList, tint: TINT.blue, step: "01", t: "Plan", d: "Your full JEE/NEET syllabus, 138 chapters. Tick learn → practise → revise and your progress bar moves." },
            { Icon: BookOpen, tint: TINT.violet, step: "02", t: "Practise", d: "A 290-question bank, past-paper sets and exam-pattern mocks that run like the real NTA interface." },
            { Icon: LineChart, tint: TINT.emerald, step: "03", t: "Track", d: "Scores, weak topics and streaks after every test — so you can see, not guess, if it's working." },
          ].map((s) => (
            <Card key={s.t} pad="lg" className="relative">
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${s.tint}`}>
                <s.Icon className="h-6 w-6" strokeWidth={1.8} />
              </span>
              <span className="absolute right-6 top-6 text-[13px] font-bold text-[var(--color-ink-faint)]">{s.step}</span>
              <h3 className="mt-5 text-[20px] font-bold tracking-[-.02em]">{s.t}</h3>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-[var(--color-ink-soft)]">{s.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── BENTO FEATURES ───────────────────────────────────────────── */}
      <section id="features" className="border-y border-[var(--color-line)] bg-[var(--color-paper-card)] py-20">
        <div className="mx-auto w-full max-w-none px-5">
          <SectionHeading eyebrow="Everything in one place" title="Your whole prep, one quiet tab." />

          <div className="mt-12 grid gap-4 md:grid-cols-6 md:grid-rows-2">
            {/* big cell */}
            <Link href="/planner" className="group col-span-6 row-span-2 flex flex-col justify-between rounded-3xl border border-[var(--color-line)] bg-white p-7 transition hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-40px_rgba(12,21,36,.5)] md:col-span-3">
              <div>
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${TINT.blue}`}>
                  <CalendarCheck className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <h3 className="mt-5 text-[22px] font-bold tracking-[-.02em]">Syllabus planner</h3>
                <p className="mt-2 max-w-[38ch] text-[14.5px] leading-[1.6] text-[var(--color-ink-soft)]">
                  Every chapter of JEE &amp; NEET, tracked across learn, practise and revise. The one view that
                  answers &ldquo;what do I do today?&rdquo;
                </p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--color-blue-ink)]">
                Open the planner <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>

            {[
              { href: "/mock-test", Icon: ClipboardList, tint: TINT.violet, t: "Mock tests", d: "Real NTA-style interface + marking." },
              { href: "/question-bank", Icon: BookOpen, tint: TINT.emerald, t: "Question bank", d: "290 questions by subject & topic." },
              { href: "/flashcards", Icon: Layers, tint: TINT.amber, t: "Flashcards", d: "Spaced revision that sticks." },
              { href: "/my-progress", Icon: LineChart, tint: TINT.blue, t: "Progress", d: "Scores, weak topics, streaks." },
              { href: "/scan-notes", Icon: Camera, tint: TINT.rose, t: "Scan notes", d: "Handwritten → clean typed text." },
              { href: "/study-timer", Icon: Timer, tint: TINT.violet, t: "Study timer", d: "Focused Pomodoro sessions." },
            ].map((f) => (
              <Link
                key={f.t}
                href={f.href}
                className="group rounded-3xl border border-[var(--color-line)] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-40px_rgba(12,21,36,.5)]"
                style={{ gridColumn: "span 3" }}
              >
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.tint}`}>
                  <f.Icon className="h-[22px] w-[22px]" strokeWidth={1.8} />
                </span>
                <h3 className="mt-4 text-[16px] font-bold tracking-[-.01em]">{f.t}</h3>
                <p className="mt-1.5 text-[13px] leading-[1.55] text-[var(--color-ink-soft)]">{f.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CREDITS, SIMPLE ──────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-none px-5 py-20">
        <div className="grid items-center gap-10 rounded-[32px] border border-[var(--color-line)] bg-gradient-to-br from-white to-[var(--color-blue-wash)] p-8 md:grid-cols-2 md:p-12">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[.16em] text-[var(--color-blue-ink)]">Honest pricing</p>
            <h2 className="mt-3 text-[clamp(26px,3.3vw,40px)] font-extrabold leading-[1.1] tracking-[-.03em]">
              Free every day. Pay only for AI.
            </h2>
            <p className="mt-4 max-w-[44ch] text-[16px] leading-[1.6] text-[var(--color-ink-soft)]">
              Planner, question bank, past papers, flashcards, progress and the timer are free — forever.
              AI tools use credits, and you get a fresh batch free each day. Top up only if you want more.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => go("tools")} className="inline-flex items-center gap-2 rounded-full bg-[var(--color-blue-ink)] px-6 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[var(--color-blue-deep)]">
                Start free <ArrowRight className="h-4 w-4" />
              </button>
              <Link href="/pricing" className="inline-flex items-center rounded-full border border-[var(--color-line-strong)] bg-white px-6 py-3.5 text-[15px] font-semibold transition hover:border-[var(--color-blue-ink)]">
                See credit packs
              </Link>
            </div>
          </div>
          <ul className="space-y-3">
            {[
              "Free: planner, question bank, past papers, flashcards, progress, timer",
              "Free credits refill every day for AI tools",
              "Credit packs from ₹49 — never expire",
              "No card to start, no trial countdown",
            ].map((x) => (
              <li key={x} className="flex items-start gap-3 rounded-2xl border border-[var(--color-line)] bg-white/70 px-4 py-3.5 text-[14.5px] text-[var(--color-ink-soft)]">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-none px-5 pb-20">
        <h2 className="text-center text-[clamp(26px,3.3vw,40px)] font-extrabold tracking-[-.03em]">Questions, answered.</h2>
        <div className="mt-10 divide-y divide-[var(--color-line)] rounded-3xl border border-[var(--color-line)] bg-white">
          {faqs.map((f, i) => {
            const open = faq === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setFaq(open ? null : i)}
                  className="flex min-h-[44px] w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={open}
                >
                  <span className="text-[16px] font-semibold">{f.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-[var(--color-ink-faint)] transition ${open ? "rotate-180" : ""}`} />
                </button>
                {open && <p className="px-6 pb-5 text-[14.5px] leading-[1.65] text-[var(--color-ink-soft)]">{f.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-none px-5 pb-24">
        <div className="relative overflow-hidden rounded-[32px] bg-[var(--color-ink)] px-8 py-16 text-center md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{ background: "radial-gradient(50% 80% at 50% 0%, rgba(37,99,235,.55) 0%, rgba(12,21,36,0) 70%)" }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-[18ch] text-[clamp(28px,4vw,48px)] font-extrabold leading-[1.08] tracking-[-.03em] text-white">
              Stop guessing. Start knowing.
            </h2>
            <p className="mx-auto mt-4 max-w-[44ch] text-[16px] leading-[1.6] text-white/70">
              Join free, map your syllabus in minutes, and see exactly what to study next.
            </p>
            <button
              onClick={() => go("tools")}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[16px] font-bold text-[var(--color-ink)] transition hover:bg-[var(--color-blue-wash)]"
            >
              Start studying free <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--color-line)]">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-4 px-5 py-10 text-[13px] text-[var(--color-ink-faint)] sm:flex-row">
          <div className="flex items-center gap-2.5">
            <Mark size={26} />
            <span className="font-bold text-[var(--color-ink)]">BlueBottleCap</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/pricing" className="transition hover:text-[var(--color-ink)]">Pricing</Link>
            <Link href="/for-institutes" className="transition hover:text-[var(--color-ink)]">For institutes</Link>
            <Link href="/terms" className="transition hover:text-[var(--color-ink)]">Terms</Link>
            <Link href="/refunds" className="transition hover:text-[var(--color-ink)]">Refunds</Link>
          </div>
          <p>© {new Date().getFullYear()} BlueBottleCap</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingV2;
