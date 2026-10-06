"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FileText, BookOpen, ScrollText, Target, Brain,
  Sparkles, FlaskConical, Camera, Layers,
  Clock, BarChart3, Map, ArrowRight, Check, Menu, X,
  ClipboardCheck, GraduationCap, TrendingUp, ShieldCheck, Zap,
  Bell, ChevronDown, type LucideIcon,
} from "lucide-react";
import { ActiveView } from "@/src/types";
import { useI18n } from "@/src/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface LandingPageProps {
  onNavigate: (view: ActiveView) => void;
}

/* ── Product directory ──────────────────────────────────────────────────
   Every shipped route, grouped by intent. Both the header dropdowns and the
   feature grid render from this, so adding a feature is a one-line change
   and the two can never drift apart. */
interface Feature { href: string; name: string; desc: string; Icon: LucideIcon; tint: string; tag?: string }

const featureGroups: { label: string; blurb: string; items: Feature[] }[] = [
  {
    label: "Practice & test",
    blurb: "Exam-condition practice with real marking.",
    items: [
      { href: "/mock-test", name: "Mock Tests", desc: "Full JEE & NEET papers in the real NTA interface.", Icon: FileText, tint: "blue" },
      { href: "/question-bank", name: "Question Bank", desc: "290 questions, filtered by topic and difficulty.", Icon: BookOpen, tint: "green" },
      { href: "/previous-year-papers", name: "Past Papers", desc: "Previous-year sets, solved and explained.", Icon: ScrollText, tint: "amber" },
      { href: "/diagnostic", name: "Diagnostic", desc: "A 2-minute check that finds your weak topics.", Icon: Target, tint: "rose" },
      { href: "/flashcards", name: "Flashcards", desc: "Spaced repetition decks built from your notes.", Icon: Brain, tint: "violet" },
    ],
  },
  {
    label: "Understand & create",
    blurb: "Turn any material into something you can study from.",
    items: [
      { href: "/pdf-editor", name: "PDF Copilot", desc: "Ask questions about any PDF, get cited answers.", Icon: Sparkles, tint: "blue" },
      { href: "/formula-sheet", name: "Formula Sheets", desc: "A one-page cheat sheet for any topic, instantly.", Icon: FlaskConical, tint: "violet" },
      { href: "/scan-notes", name: "Scan Notes", desc: "Photograph handwriting, get typed searchable text.", Icon: Camera, tint: "green" },
      { href: "/tools", name: "File Tools", desc: "Convert, compress, merge and split in your browser.", Icon: Layers, tint: "amber" },
    ],
  },
  {
    label: "Stay on track",
    blurb: "See what you've done and what's next.",
    items: [
      { href: "/planner", name: "Study Planner", desc: "Track the full syllabus, chapter by chapter.", Icon: ClipboardCheck, tint: "violet", tag: "New" },
      { href: "/study-timer", name: "Study Timer", desc: "Focus sessions with streaks that actually stick.", Icon: Clock, tint: "rose" },
      { href: "/my-progress", name: "My Progress", desc: "Scores over time, subject by subject.", Icon: BarChart3, tint: "blue" },
      { href: "/dashboard", name: "Dashboard", desc: "Your study plan and everything in one place.", Icon: Map, tint: "green" },
    ],
  },
];

const TINTS: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-500",
  violet: "bg-violet-50 text-violet-600",
};

/* Value props — the icon strip under the hero. */
const VALUE_PROPS = [
  { stat: "138", label: "Syllabus chapters mapped" },
  { stat: "290+", label: "Practice questions" },
  { stat: "70", label: "Past-paper questions" },
  { stat: "80", label: "Flashcards to revise" },
  { stat: "₹0", label: "To start — no card" },
];

const plans = [
  {
    nameKey: "plan.free.name", price: "₹0", per: "/ forever", featured: false, ctaKey: "plan.free.cta", view: "pdf-editor" as ActiveView,
    descKey: "plan.free.desc",
    itemKeys: ["plan.free.i1", "plan.free.i2", "plan.free.i3", "plan.free.i4"],
  },
  {
    nameKey: "plan.pro.name", price: "₹199", per: "/ month", featured: true, tagKey: "plan.pro.tag", ctaKey: "plan.pro.cta", view: "pricing" as ActiveView,
    descKey: "plan.pro.desc",
    itemKeys: ["plan.pro.i1", "plan.pro.i2", "plan.pro.i3", "plan.pro.i4", "plan.pro.i5"],
  },
  {
    nameKey: "plan.annual.name", price: "₹1,499", per: "/ year", featured: false, tagKey: "plan.annual.tag", ctaKey: "plan.annual.cta", view: "pricing" as ActiveView,
    descKey: "plan.annual.desc",
    itemKeys: ["plan.annual.i1", "plan.annual.i2", "plan.annual.i3", "plan.annual.i4"],
  },
];

const steps = [
  { n: "01", tKey: "how.s1t", dKey: "how.s1d" },
  { n: "02", tKey: "how.s2t", dKey: "how.s2d" },
  { n: "03", tKey: "how.s3t", dKey: "how.s3d" },
  { n: "04", tKey: "how.s4t", dKey: "how.s4d" },
];

const Seal = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="15" fill="none" stroke="var(--color-blue-ink)" strokeWidth="1.6" />
    <path d="M13.4 7.5h5.2v1.7h-1v2.2l1.5 2.8v8.8c0 .7-.5 1.2-1.2 1.2h-4.8c-.7 0-1.2-.5-1.2-1.2v-8.8l1.5-2.8V9.2h-1V7.5z"
          fill="none" stroke="var(--color-blue-ink)" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M13.5 7.5h5" stroke="var(--color-blue-ink)" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/** Header dropdown. Click-activated so it works on touch and by keyboard. */
const HeaderMenu: React.FC<{ label: string; items: Feature[] }> = ({ label, items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-1 text-[15px] font-medium transition ${
          open ? "text-[var(--color-ink)]" : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
        }`}
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-3 w-[310px] -translate-x-1/2 rounded-2xl border border-[var(--color-line)] bg-white p-2 shadow-[0_20px_44px_-22px_rgba(12,21,36,.3)]">
          {items.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
               className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[var(--color-paper-card)]">
              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TINTS[item.tint]}`}>
                <item.Icon className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--color-ink)]">
                  {item.name}
                  {item.tag && <span className="rounded bg-[var(--color-blue-ink)] px-1 py-px text-[9px] font-bold uppercase tracking-wide text-white">{item.tag}</span>}
                </span>
                <span className="mt-0.5 block text-[11.5px] leading-snug text-[var(--color-ink-faint)]">{item.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Hero product shot ──────────────────────────────────────────────────
   A rendition of the real dashboard rather than a screenshot, so it stays
   in sync with the palette and scales crisply. Values are illustrative and
   deliberately generic — no claims about real usage. */
const DashboardMock: React.FC = () => (
  <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-[0_28px_70px_-34px_rgba(12,21,36,.35)]" aria-hidden="true">
    <div className="flex">
      {/* Sidebar */}
      <div className="hidden w-[168px] shrink-0 border-r border-[var(--color-line)] bg-[var(--color-paper-card)] p-3 sm:block">
        <div className="mb-4 flex items-center gap-2 px-1">
          <Seal size={20} />
          <span className="text-[12px] font-bold text-[var(--color-ink)]">BlueBottleCap</span>
        </div>
        {[
          { Icon: Map, label: "Dashboard", active: true },
          { Icon: FileText, label: "Mock Tests" },
          { Icon: BookOpen, label: "Question Bank" },
          { Icon: FlaskConical, label: "Formula Sheets" },
          { Icon: Camera, label: "Scan Notes" },
          { Icon: BarChart3, label: "Progress" },
        ].map((r) => (
          <div key={r.label} className={`mb-0.5 flex items-center gap-2 rounded-lg px-2 py-[7px] text-[11.5px] font-medium ${
            r.active ? "bg-[var(--color-blue-ink)] text-white" : "text-[var(--color-ink-soft)]"
          }`}>
            <r.Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
            {r.label}
          </div>
        ))}
      </div>

      {/* Panel */}
      <div className="min-w-0 flex-1 p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[15px] font-bold text-[var(--color-ink)]">Welcome back 👋</p>
            <p className="text-[11.5px] text-[var(--color-ink-faint)]">Here&apos;s where you stand today.</p>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[var(--color-ink-faint)]" />
            <span className="h-6 w-6 rounded-full bg-[var(--color-blue-wash)]" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-blue-wash)] p-3">
            <p className="text-[10px] font-semibold text-[var(--color-ink-faint)]">Next mock</p>
            <p className="mt-1 text-[13px] font-bold text-[var(--color-ink)]">JEE Mini · Set 2</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white">
              <div className="h-full w-[62%] rounded-full bg-[var(--color-blue-ink)]" />
            </div>
          </div>
          <div className="rounded-xl border border-[var(--color-line)] p-3">
            <p className="text-[10px] font-semibold text-[var(--color-ink-faint)]">Avg score</p>
            <p className="mt-1 text-[20px] font-bold leading-none text-[var(--color-ink)]">55%</p>
            <div className="mt-2 flex items-end gap-[3px]">
              {[30, 45, 38, 60, 52, 72].map((h, i) => (
                <span key={i} className="w-1.5 rounded-sm bg-[var(--color-blue-ink)]/35" style={{ height: h / 3 }} />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--color-line)] bg-emerald-50/60 p-3">
            <p className="text-[10px] font-semibold text-[var(--color-ink-faint)]">Streak</p>
            <p className="mt-1 text-[20px] font-bold leading-none text-[var(--color-ink)]">6</p>
            <p className="mt-1 text-[10px] text-[var(--color-ink-faint)]">days in a row</p>
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-5 gap-2.5">
          <div className="col-span-3 rounded-xl border border-[var(--color-line)] p-3">
            <p className="text-[11px] font-bold text-[var(--color-ink)]">Weakest topics</p>
            {[
              { t: "Organic Chemistry", v: 34 },
              { t: "Calculus", v: 41 },
              { t: "Rotational Motion", v: 52 },
            ].map((r) => (
              <div key={r.t} className="mt-2 flex items-center gap-2">
                <span className="w-[92px] shrink-0 truncate text-[10.5px] text-[var(--color-ink-soft)]">{r.t}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-line)]">
                  <span className="block h-full rounded-full bg-rose-400" style={{ width: `${Math.max(r.v, 6)}%` }} />
                </span>
                <span className="w-7 text-right text-[10px] font-bold text-[var(--color-ink-faint)]">{r.v}%</span>
              </div>
            ))}
          </div>
          <div className="col-span-2 rounded-xl border border-[var(--color-line)] p-3">
            <p className="text-[11px] font-bold text-[var(--color-ink)]">Up next</p>
            {["Revise Thermodynamics", "20 flashcards due", "Scan lecture notes"].map((s) => (
              <p key={s} className="mt-1.5 flex items-start gap-1.5 text-[10.5px] leading-snug text-[var(--color-ink-soft)]">
                <Check className="mt-px h-3 w-3 shrink-0 text-[var(--color-blue-ink)]" />
                {s}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll(".bbc-reveal");
    if (!els?.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((e) => e.classList.add("bbc-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("bbc-in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    if (id === "top") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const allFeatures = featureGroups.flatMap((g) => g.items);

  return (
    <div ref={rootRef} className="bbc min-h-screen bg-white">
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6">
          <button onClick={() => scrollTo("top")} className="flex items-center gap-2.5" aria-label="BlueBottleCap home">
            <Seal />
            <span className="hidden whitespace-nowrap text-[19px] font-bold tracking-[-.02em] text-[var(--color-ink)] sm:inline">Blue Bottle Cap</span>
          </button>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            <HeaderMenu label="Practice" items={featureGroups[0].items} />
            <HeaderMenu label="Tools" items={featureGroups[1].items} />
            <HeaderMenu label="Track" items={featureGroups[2].items} />
            <button onClick={() => scrollTo("how")} className="text-[15px] font-medium text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]">{t("nav.how")}</button>
            <button onClick={() => scrollTo("pricing")} className="text-[15px] font-medium text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]">{t("nav.pricing")}</button>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden xl:block"><LanguageSwitcher /></div>
            <button onClick={() => onNavigate("signup")} className="hidden text-[15px] font-medium text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)] sm:block">
              {t("nav.signin")}
            </button>
            <button onClick={() => onNavigate("tools")}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[var(--color-blue-ink)] px-4 py-2.5 text-[14.5px] font-semibold text-white transition hover:bg-[var(--color-blue-deep)] sm:px-5">
              {t("nav.startFree")} <ArrowRight className="hidden h-4 w-4 sm:inline" />
            </button>
            <button onClick={() => setMobileOpen((v) => !v)} aria-label="Menu" aria-expanded={mobileOpen} className="text-[var(--color-ink-soft)] lg:hidden">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-[var(--color-line)] bg-white px-6 py-4 lg:hidden">
            {featureGroups.map((g) => (
              <div key={g.label} className="mb-3">
                <p className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[.14em] text-[var(--color-ink-faint)]">{g.label}</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {g.items.map((f) => (
                    <Link key={f.href} href={f.href} className="flex items-center gap-2 text-[14px] text-[var(--color-ink-soft)] transition hover:text-[var(--color-blue-ink)]">
                      <f.Icon className="h-4 w-4 shrink-0 text-[var(--color-blue-ink)]" strokeWidth={1.9} />
                      {f.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-5 border-t border-[var(--color-line)] pt-3">
              <button onClick={() => scrollTo("how")} className="text-[14.5px] text-[var(--color-ink-soft)]">{t("nav.how")}</button>
              <button onClick={() => scrollTo("pricing")} className="text-[14.5px] text-[var(--color-ink-soft)]">{t("nav.pricing")}</button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0"
             style={{ background: "linear-gradient(180deg, var(--color-blue-wash) 0%, rgba(255,255,255,0) 62%)" }} />
        <div className="relative mx-auto max-w-[1120px] px-6 py-14 md:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,44%)_minmax(0,56%)]">
            {/* Copy */}
            <div className="bbc-reveal">
              <span className="inline-flex items-center rounded-full border border-[var(--color-blue-ink)]/20 bg-[var(--color-blue-wash)] px-3.5 py-1.5 text-[12.5px] font-semibold text-[var(--color-blue-ink)]">
                {t("hero.eyebrow")}
              </span>
              <h1 className="mt-5 text-[clamp(34px,4.6vw,54px)] font-bold leading-[1.08] tracking-[-.032em] text-[var(--color-ink)]">
                {t("hero.title")}
              </h1>
              <p className="mt-5 max-w-[46ch] text-[16.5px] leading-[1.65] text-[var(--color-ink-soft)]">
                {t("hero.subhead")}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button onClick={() => onNavigate("tools")}
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-blue-ink)] px-6 py-3.5 text-[15.5px] font-semibold text-white transition hover:bg-[var(--color-blue-deep)]">
                  {t("hero.cta")} <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => scrollTo("features")}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line-strong)] bg-white px-6 py-3.5 text-[15.5px] font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-blue-ink)] hover:text-[var(--color-blue-ink)]">
                  See what&apos;s inside
                </button>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] text-[var(--color-ink-faint)]">
                <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-[var(--color-blue-ink)]" />{t("hero.noSignup")}</span>
                <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-[var(--color-blue-ink)]" />{t("hero.noCard")}</span>
              </div>
            </div>

            {/* Product shot */}
            <div className="bbc-reveal"><DashboardMock /></div>
          </div>
        </div>
      </section>

      {/* ── VALUE STRIP ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1120px] px-6">
        <div className="bbc-reveal bbc-stagger grid divide-y divide-[var(--color-line)] rounded-2xl border border-[var(--color-line)] bg-white shadow-[0_18px_44px_-30px_rgba(12,21,36,.3)] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x">
          {VALUE_PROPS.map((v) => (
            <div key={v.label} className="px-5 py-7 text-center">
              <p className="bbc-serif text-[clamp(28px,4vw,40px)] font-bold leading-none tracking-[-.02em] text-[var(--color-blue-ink)]">{v.stat}</p>
              <p className="mt-2 text-[12.5px] font-medium leading-[1.4] text-[var(--color-ink-soft)]">{v.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── EXAMS COVERED ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1120px] px-6 py-14">
        <p className="bbc-reveal text-center text-[11.5px] font-semibold uppercase tracking-[.18em] text-[var(--color-ink-faint)]">
          Built for the exams Indian students actually sit
        </p>
        <div className="bbc-reveal mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {["JEE Main", "JEE Advanced", "NEET UG", "GATE", "B.Tech semesters", "CUET"].map((e) => (
            <span key={e} className="text-[17px] font-bold tracking-[-.01em] text-[var(--color-ink-faint)]">{e}</span>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────── */}
      <section id="features" className="border-y border-[var(--color-line)] bg-[var(--color-paper-card)] py-20">
        <div className="mx-auto max-w-[1120px] px-6">
          <div className="bbc-reveal mx-auto max-w-[40em] text-center">
            <span className="inline-flex rounded-full bg-[var(--color-blue-wash)] px-3 py-1 text-[11.5px] font-bold uppercase tracking-[.12em] text-[var(--color-blue-ink)]">
              {t("suite.eyebrow")}
            </span>
            <h2 className="mt-4 text-[clamp(26px,3.3vw,40px)] font-bold leading-[1.12] tracking-[-.03em] text-[var(--color-ink)]">
              {t("suite.title")}
            </h2>
            <p className="mt-3 text-[16px] leading-[1.6] text-[var(--color-ink-soft)]">{t("suite.subhead")}</p>
          </div>

          <div className="bbc-reveal bbc-stagger mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {allFeatures.map((f) => (
              <Link key={f.href} href={f.href}
                 className="group rounded-2xl border border-[var(--color-line)] bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-[var(--color-blue-ink)]/40 hover:shadow-[0_18px_40px_-24px_rgba(12,21,36,.35)]">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${TINTS[f.tint]}`}>
                  <f.Icon className="h-[21px] w-[21px]" strokeWidth={1.8} />
                </span>
                <p className="mt-4 flex items-center gap-2 text-[16px] font-bold text-[var(--color-ink)]">
                  {f.name}
                  {f.tag && <span className="rounded bg-[var(--color-blue-ink)] px-1.5 py-px text-[9.5px] font-bold uppercase tracking-wide text-white">{f.tag}</span>}
                </p>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--color-ink-soft)]">{f.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--color-blue-ink)]">
                  Open <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <section id="how" className="py-20">
        <div className="mx-auto max-w-[1120px] px-6">
          <div className="bbc-reveal mx-auto max-w-[40em] text-center">
            <span className="inline-flex rounded-full bg-[var(--color-blue-wash)] px-3 py-1 text-[11.5px] font-bold uppercase tracking-[.12em] text-[var(--color-blue-ink)]">
              {t("how.eyebrow")}
            </span>
            <h2 className="mt-4 text-[clamp(26px,3.3vw,40px)] font-bold leading-[1.12] tracking-[-.03em] text-[var(--color-ink)]">{t("how.title")}</h2>
            <p className="mt-3 text-[16px] leading-[1.6] text-[var(--color-ink-soft)]">{t("how.subhead")}</p>
          </div>

          <div className="bbc-reveal bbc-stagger mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-blue-ink)] text-[13px] font-bold text-white">{s.n}</span>
                <h3 className="mt-4 text-[17px] font-bold tracking-[-.015em] text-[var(--color-ink)]">{t(s.tKey)}</h3>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--color-ink-soft)]">{t(s.dKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────── */}
      <section id="pricing" className="border-y border-[var(--color-line)] bg-[var(--color-paper-card)] py-20">
        <div className="mx-auto max-w-[1120px] px-6">
          <div className="bbc-reveal mx-auto max-w-[40em] text-center">
            <span className="inline-flex rounded-full bg-[var(--color-blue-wash)] px-3 py-1 text-[11.5px] font-bold uppercase tracking-[.12em] text-[var(--color-blue-ink)]">
              {t("pricing.eyebrow")}
            </span>
            <h2 className="mt-4 text-[clamp(26px,3.3vw,40px)] font-bold leading-[1.12] tracking-[-.03em] text-[var(--color-ink)]">{t("pricing.title")}</h2>
            <p className="mt-3 text-[16px] leading-[1.6] text-[var(--color-ink-soft)]">{t("pricing.subhead")}</p>
          </div>

          <div className="bbc-reveal bbc-stagger mx-auto mt-12 grid max-w-[1000px] gap-5 md:grid-cols-3">
            {plans.map((p) => (
              <div key={p.nameKey} className={`relative flex flex-col rounded-2xl border bg-white p-7 ${
                p.featured ? "border-[var(--color-blue-ink)] shadow-[0_22px_50px_-28px_rgba(37,99,235,.5)]" : "border-[var(--color-line)]"
              }`}>
                {p.tagKey && (
                  <span className="absolute -top-3 left-7 rounded-full bg-[var(--color-blue-ink)] px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white">
                    {t(p.tagKey)}
                  </span>
                )}
                <h3 className="text-[15.5px] font-bold text-[var(--color-ink)]">{t(p.nameKey)}</h3>
                <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">{t(p.descKey)}</p>
                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-[38px] font-bold tracking-[-.03em] text-[var(--color-ink)]">{p.price}</span>
                  <span className="text-[13px] text-[var(--color-ink-faint)]">{p.per}</span>
                </p>
                <ul className="mt-6 grow space-y-2.5">
                  {p.itemKeys.map((k) => (
                    <li key={k} className="flex items-start gap-2 text-[13.5px] leading-[1.5] text-[var(--color-ink-soft)]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-blue-ink)]" />
                      {t(k)}
                    </li>
                  ))}
                </ul>
                <button onClick={() => onNavigate(p.view)}
                        className={`mt-7 w-full rounded-full py-3 text-[14.5px] font-semibold transition ${
                          p.featured
                            ? "bg-[var(--color-blue-ink)] text-white hover:bg-[var(--color-blue-deep)]"
                            : "border border-[var(--color-line-strong)] text-[var(--color-ink)] hover:border-[var(--color-blue-ink)] hover:text-[var(--color-blue-ink)]"
                        }`}>
                  {t(p.ctaKey)}
                </button>
              </div>
            ))}
          </div>
          <p className="bbc-reveal mt-6 text-center text-[13px] text-[var(--color-ink-faint)]">{t("pricing.note")}</p>
        </div>
      </section>

      {/* ── CLOSING CTA ────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-[1120px] px-6">
          <div className="bbc-reveal relative overflow-hidden rounded-3xl bg-[var(--color-blue-ink)] px-8 py-16 text-center text-white">
            <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-white/10" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-white/[.07]" />
            <div className="relative mx-auto max-w-[38em]">
              <h2 className="text-[clamp(26px,3.4vw,40px)] font-bold leading-[1.12] tracking-[-.03em]">{t("close.title")}</h2>
              <button onClick={() => onNavigate("tools")}
                      className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15.5px] font-semibold text-[var(--color-blue-ink)] transition hover:bg-white/90">
                {t("close.cta")} <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-5 text-[13.5px] text-white/70">{t("close.trust")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--color-line)] py-14">
        <div className="mx-auto max-w-[1120px] px-6">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
            <div className="max-w-[32ch]">
              <div className="flex items-center gap-2.5">
                <Seal size={26} />
                <span className="text-[17px] font-bold tracking-[-.02em] text-[var(--color-ink)]">Blue Bottle Cap</span>
              </div>
              <p className="mt-3 text-[13.5px] leading-[1.6] text-[var(--color-ink-soft)]">
                AI study workspace for JEE, NEET, GATE and B.Tech — built for Indian students.
              </p>
            </div>

            {featureGroups.map((g) => (
              <div key={g.label}>
                <p className="text-[11.5px] font-bold uppercase tracking-[.14em] text-[var(--color-ink)]">{g.label}</p>
                <ul className="mt-3 space-y-2">
                  {g.items.map((f) => (
                    <li key={f.href}>
                      <Link href={f.href} className="text-[13.5px] text-[var(--color-ink-soft)] transition hover:text-[var(--color-blue-ink)]">{f.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-[var(--color-line)] pt-6 text-[12.5px] text-[var(--color-ink-faint)] sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} BlueBottleCap · Made in India 🇮🇳</span>
            <span className="flex flex-wrap gap-5">
              <Link href="/about" className="transition hover:text-[var(--color-ink)]">About</Link>
              <Link href="/blog" className="transition hover:text-[var(--color-ink)]">Blog</Link>
              <Link href="/pricing" className="transition hover:text-[var(--color-ink)]">Pricing</Link>
              <Link href="/bundles" className="transition hover:text-[var(--color-ink)]">Exam packs</Link>
              <Link href="/terms" className="transition hover:text-[var(--color-ink)]">Terms</Link>
              <Link href="/refunds" className="transition hover:text-[var(--color-ink)]">Refunds</Link>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
