"use client";
import React, { useEffect, useRef } from "react";
import { ActiveView } from "@/src/types";
import { useI18n } from "@/src/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface LandingPageProps {
  onNavigate: (view: ActiveView) => void;
}

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" className="flex-none mt-[5px]" aria-hidden="true">
    <path d="M3 8.5l3 3 7-8" stroke="var(--color-blue-ink)" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Seal = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="16" r="15" stroke="var(--color-ink)" strokeWidth="1.3" />
    <path d="M13.4 7.5h5.2v1.7h-1v2.2l1.5 2.8v8.8c0 .7-.5 1.2-1.2 1.2h-4.8c-.7 0-1.2-.5-1.2-1.2v-8.8l1.5-2.8V9.2h-1V7.5z" stroke="var(--color-blue-ink)" strokeWidth="1.3" strokeLinejoin="round" />
    <path d="M13.5 7.5h5" stroke="var(--color-blue-ink)" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

type ToolIconProps = { className?: string };
const ToolIcon = {
  pdf: ({ className }: ToolIconProps) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 3h8l4 4v14H6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M9 13h6M9 16h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  cards: ({ className }: ToolIconProps) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="5" y="7" width="12" height="14" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="8" y="4" width="12" height="14" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  timer: ({ className }: ToolIconProps) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="13" r="7.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M12 9v4l2.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M9.5 3.5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  calendar: ({ className }: ToolIconProps) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="15" rx="1.3" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M4 10h16" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M8 3.5v4M16 3.5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  summary: ({ className }: ToolIconProps) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 5h14M5 9h14M5 13h9M5 17h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  tools: ({ className }: ToolIconProps) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M14.5 4.5l5 5-9 9-5-5 9-9z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M10 9l5 5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  scan: ({ className }: ToolIconProps) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 8V6a2 2 0 0 1 2-2h2M20 8V6a2 2 0 0 0-2-2h-2M4 16v2a2 2 0 0 0 2 2h2M20 16v2a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
};

const tools = [
  { n: "01", t: "Notes Scanner", d: "Photo of handwritten notes → clean, typed, equation-aware version. New.", Icon: ToolIcon.scan, href: "/scan-notes" },
  { n: "02", t: "AI PDF Copilot", d: "Chat with any textbook or notes PDF. Answers cite the page they came from.", Icon: ToolIcon.pdf, href: "/pdf-editor" },
  { n: "03", t: "PDF & File Tools", d: "PNG↔JPG↔WebP, PDF merge & split, compressor, resizer — all in your browser.", Icon: ToolIcon.tools, href: "/tools" },
  { n: "04", t: "JEE Diagnostic", d: "2-minute readiness check that maps your weak topics. No signup.", Icon: ToolIcon.timer, href: "/diagnostic" },
  { n: "05", t: "Flashcard Maker", d: "Turn a chapter into a spaced-repetition deck in one click.", Icon: ToolIcon.cards, href: "/pdf-editor" },
  { n: "06", t: "Smart Summaries", d: "Long chapters condensed to the points that actually get tested.", Icon: ToolIcon.summary, href: "/pdf-editor" },
];

const plans = [
  {
    name: "Free", price: "₹0", per: "/ forever", featured: false, cta: "Try it free", view: "pdf-editor" as ActiveView,
    desc: "Enough to feel the difference. Not enough to live on.",
    items: ["1 PDF upload", "5 chat messages per session", "Watermarked exports", "Study streak tracking"],
  },
  {
    name: "Pro", price: "₹199", per: "/ month", featured: true, tag: "Most popular", cta: "Get Pro", view: "pricing" as ActiveView,
    desc: "The plan that actually gets you through exams.",
    items: ["Unlimited PDFs and chat", "Flashcards, summaries, mocks", "Day-by-day study plan", "No watermarks", "Priority support"],
  },
  {
    name: "Pro · Annual", price: "₹1,499", per: "/ year", featured: false, tag: "Save 37%", cta: "Get yearly", view: "pricing" as ActiveView,
    desc: "₹125/mo when paid yearly. Lock it in before exam crunch.",
    items: ["Everything in Pro", "2 months free vs monthly", "Renewal-locked at this price", "Cancel anytime"],
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useI18n();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("bbc-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    root.querySelectorAll<HTMLElement>(".bbc-reveal").forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i, 6) * 60}ms`;
      io.observe(el);
    });

    const draws = root.querySelectorAll<SVGPathElement>(".bbc-draw");
    draws.forEach((p) => p.style.setProperty("--len", String(p.getTotalLength())));
    const diag = root.querySelector(".bbc-diagram");
    let dio: IntersectionObserver | null = null;
    if (diag) {
      dio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              draws.forEach((p) => p.classList.add("bbc-in"));
              dio?.disconnect();
            }
          });
        },
        { threshold: 0.3 }
      );
      dio.observe(diag);
    }

    return () => { io.disconnect(); dio?.disconnect(); };
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div ref={rootRef} className="bbc min-h-screen" id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "BlueBottleCap",
            applicationCategory: "EducationalApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
            description: "AI study workspace for Indian engineering students. Upload a PDF, ask in plain language, and turn it into flashcards, summaries, mocks, and a study plan.",
            url: "https://bluebottlecap.com",
          }),
        }}
      />

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-[rgba(245,244,239,.82)] backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-7">
          <button onClick={() => scrollTo("top")} className="flex items-center gap-[11px] text-[16px] font-semibold tracking-[-.01em]" aria-label="BlueBottleCap home">
            <Seal /> BlueBottleCap
          </button>
          <nav className="hidden gap-[30px] md:flex" aria-label="Primary">
            <button onClick={() => scrollTo("tools")} className="text-[14.5px] text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]">{t("nav.tools")}</button>
            <button onClick={() => scrollTo("how")} className="text-[14.5px] text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]">{t("nav.how")}</button>
            <button onClick={() => scrollTo("pricing")} className="text-[14.5px] text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]">{t("nav.pricing")}</button>
          </nav>
          <div className="flex items-center gap-[14px]">
            <LanguageSwitcher />
            <button onClick={() => onNavigate("signup")} className="hidden text-[14.5px] text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)] sm:block">{t("nav.signin")}</button>
            <button onClick={() => onNavigate("tools")} className="bbc-btn bbc-btn-primary px-5 py-[11px] text-[15px]">{t("nav.startFree")}</button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div className="bbc-grid" aria-hidden="true" />
        <div className="relative z-[2] mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-10 px-7 py-[60px] md:grid-cols-[1fr_1.05fr] md:py-[76px]">
          <div>
            <p className="bbc-eyebrow bbc-reveal">{t("hero.eyebrow")}</p>
            <h1 className="bbc-serif bbc-reveal mt-[18px] text-[clamp(40px,5.6vw,68px)] leading-[1.03] tracking-[-.02em]">
              {lang === "en" ? (
                <>One AI toolkit.<br />Two ways to <em className="not-italic font-medium italic text-[var(--color-blue-ink)]">use it.</em></>
              ) : (
                t("hero.title")
              )}
            </h1>
            <p className="bbc-reveal mt-6 max-w-[32em] text-[18.5px] text-[var(--color-ink-soft)]">
              {t("hero.subhead")}
            </p>
            <div className="bbc-reveal mt-[34px] flex flex-wrap items-center gap-4">
              <button onClick={() => onNavigate("tools")} className="bbc-btn bbc-btn-primary px-[26px] py-[14px] text-[16px]">{t("hero.cta")}</button>
              <a href="/for-institutes" className="inline-flex items-center gap-[7px] text-[15px] text-[var(--color-ink-soft)] transition hover:text-[var(--color-blue-ink)]">
                {t("hero.forInstitutes")}
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </div>
            <p className="bbc-reveal mt-[14px] flex items-center gap-1.5 text-[13px] text-[var(--color-ink-faint)]">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="var(--color-blue-ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              No signup needed — try it instantly, free.
            </p>
            <div className="bbc-reveal mt-[42px] flex flex-wrap items-center gap-x-[22px] gap-y-2 border-t border-[var(--color-line)] pt-[20px]">
              <div className="flex items-center gap-[8px] text-[13px] text-[var(--color-ink-faint)]">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.25" stroke="var(--color-blue-ink)" strokeWidth="1.4"/><path d="M5.5 8.5l1.7 1.7L10.7 6.4" stroke="var(--color-blue-ink)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                Free during early access
              </div>
              <div className="flex items-center gap-[8px] text-[13px] text-[var(--color-ink-faint)]">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2.25" y="4.25" width="11.5" height="8.5" rx="1.5" stroke="var(--color-blue-ink)" strokeWidth="1.3"/><path d="M2.5 7h11" stroke="var(--color-blue-ink)" strokeWidth="1.3"/><path d="M4 4.25V3" stroke="var(--color-blue-ink)" strokeWidth="1.3" strokeLinecap="round"/><path d="M12 4.25V3" stroke="var(--color-blue-ink)" strokeWidth="1.3" strokeLinecap="round"/></svg>
                No card needed
              </div>
              <div className="flex items-center gap-[8px] text-[13px] text-[var(--color-ink-faint)]">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.5l2 4.3 4.5.5-3.4 3.1.9 4.6L8 11.6l-4 2.4.9-4.6L1.5 6.3l4.5-.5L8 1.5z" stroke="var(--color-blue-ink)" strokeWidth="1.3" strokeLinejoin="round" fill="none"/></svg>
                Built for Indian engineering students
              </div>
            </div>
          </div>

          {/* Hero-side product mockup — a peek at the Tools Hub. Chosen over
              the previous patent-diagram bottle because it (a) shows real
              product surface, matching the "Open the toolkit" primary CTA;
              (b) reads professional to institute owners scanning the page;
              (c) mirrors the browser-chrome mockup style already used in
              the "A real session" section further down for consistency. */}
          <div className="bbc-reveal mx-auto w-full max-w-[520px] md:max-w-none" aria-hidden="true">
            <div className="bbc-hero-float overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white shadow-[0_30px_60px_-30px_rgba(20,30,55,.18)]">
              {/* Browser chrome */}
              <div className="flex items-center gap-[10px] border-b border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-[10px]">
                <span className="h-[10px] w-[10px] rounded-full bg-[var(--color-line)]" />
                <span className="h-[10px] w-[10px] rounded-full bg-[var(--color-line)]" />
                <span className="h-[10px] w-[10px] rounded-full bg-[var(--color-line)]" />
                <span className="bbc-mono ml-3 text-[11px] tracking-[.08em] text-[var(--color-ink-faint)]">bluebottlecap.com / tools</span>
              </div>

              <div className="px-5 py-5">
                <p className="bbc-eyebrow text-[10px]">Tools</p>
                <h4 className="bbc-serif mt-1.5 text-[19px] tracking-[-.01em] text-[var(--color-ink)]">Every file tool, in one place.</h4>

                {/* Faux AI search bar — matches the real one in ToolsHub */}
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-white px-3 py-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3z" stroke="var(--color-blue-ink)" strokeWidth="1.4" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[12.5px] italic text-[var(--color-ink-faint)]">Ask AI: I need to make my PDF smaller…<span className="bbc-caret" /></span>
                  <span className="ml-auto rounded-md bg-[var(--color-blue-ink)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Ask</span>
                </div>

                {/* Category chips */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[var(--color-blue-ink)] px-2.5 py-0.5 text-[10.5px] font-semibold text-white">All tools</span>
                  <span className="rounded-full border border-[var(--color-line)] bg-white px-2.5 py-0.5 text-[10.5px] font-semibold text-[var(--color-ink-soft)]">Image</span>
                  <span className="rounded-full border border-[var(--color-line)] bg-white px-2.5 py-0.5 text-[10.5px] font-semibold text-[var(--color-ink-soft)]">PDF</span>
                </div>

                {/* Tool grid — a 2x2 preview. Monochrome line icons instead of
                    emoji: emoji render differently per OS and read as clutter
                    against the editorial palette. */}
                <div className="bbc-cascade mt-3 grid grid-cols-2 gap-2">
                  {[
                    { icon: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-5-9 9"/></>, name: "PNG → JPG", desc: "Convert PNG to JPG" },
                    { icon: <><path d="M12 3v10"/><path d="M8.5 9.5L12 13l3.5-3.5"/><rect x="4" y="16" width="16" height="5" rx="1.5"/></>, name: "Image Compressor", desc: "Shrink file size" },
                    { icon: <><rect x="3" y="3" width="10" height="13" rx="1.5"/><rect x="11" y="8" width="10" height="13" rx="1.5"/></>, name: "PDF Merger", desc: "Combine multiple PDFs" },
                    { icon: <><rect x="3" y="4" width="8" height="16" rx="1.5"/><rect x="15" y="4" width="6" height="16" rx="1.5"/><path d="M12.5 8v2M12.5 12v2M12.5 16v2"/></>, name: "PDF Splitter", desc: "Extract pages" },
                  ].map((t) => (
                    <div key={t.name} className="bbc-lift rounded-[10px] border border-[var(--color-line)] bg-[var(--color-paper-card)] p-3">
                      <div className="flex items-center justify-between">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue-ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{t.icon}</svg>
                        <span className="rounded-full bg-[var(--color-blue-wash)] px-1.5 py-0.5 text-[8.5px] font-bold text-[var(--color-blue-ink)]">3 / day</span>
                      </div>
                      <p className="mt-1.5 text-[11.5px] font-bold text-[var(--color-ink)]">{t.name}</p>
                      <p className="mt-0.5 text-[10px] text-[var(--color-ink-faint)]">{t.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Overflow hint — "+ 4 more" */}
                <div className="mt-3 flex items-center justify-between rounded-[10px] border border-dashed border-[var(--color-line)] bg-[var(--color-paper)] px-3 py-2 text-[11px] text-[var(--color-ink-faint)]">
                  <span className="bbc-mono">+ 4 more tools</span>
                  <span className="font-semibold text-[var(--color-blue-ink)]">See all →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TWO LANES ──
          Two audience-specific cards right after the hero. Student card on
          the left, institute card on the right (highlighted with the primary
          border since it's the higher-value lane). Anyone landing on the
          page decides in one glance which one they are and clicks through. */}
      <section className="border-b border-[var(--color-line)] py-[80px]">
        <div className="mx-auto max-w-[1180px] px-7">
          <div className="bbc-reveal mx-auto mb-12 max-w-[42em] text-center">
            <p className="bbc-eyebrow">Which are you?</p>
            <h2 className="bbc-serif mt-3 text-[clamp(28px,3.4vw,40px)] leading-[1.1] tracking-[-.02em]">
              Same AI. Different lane.
            </h2>
            <p className="mt-3 text-[16px] text-[var(--color-ink-soft)]">
              Built to serve both sides of the coaching-classroom equation — students who study, institutes who teach.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* For students */}
            <div className="bbc-reveal bbc-lift flex flex-col rounded-[16px] border border-[var(--color-line)] bg-[var(--color-paper-card)] p-8">
              <div className="mb-4">
                <p className="bbc-eyebrow text-[var(--color-ink)]">For students</p>
              </div>
              <h3 className="bbc-serif text-[24px] tracking-[-.01em] text-[var(--color-ink)]">
                Study smarter, quieter.
              </h3>
              <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                Everything you need to prep for JEE, B.Tech, or GATE — chat with your PDFs, convert files, map your weak topics.
              </p>
              <ul className="mt-5 space-y-2.5 border-t border-[var(--color-line)] pt-5 text-left">
                {[
                  "PDF Copilot — chat with any textbook or notes",
                  "File Tools — PNG↔JPG, PDF merge, split, compress",
                  "JEE Diagnostic — 2-min weak-topic map, no signup",
                  "Notes Scanner — photo of handwritten → typed",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13.5px] text-[var(--color-ink-soft)]"><Check />{f}</li>
                ))}
              </ul>
              <div className="mt-6 flex items-baseline gap-2 border-t border-[var(--color-line)] pt-5">
                <span className="bbc-serif text-[24px] tracking-[-.01em]">₹0</span>
                <span className="text-[12.5px] text-[var(--color-ink-faint)]">forever · </span>
                <span className="bbc-serif text-[24px] tracking-[-.01em]">₹199</span>
                <span className="text-[12.5px] text-[var(--color-ink-faint)]">/mo Pro</span>
              </div>
              <button
                onClick={() => onNavigate("tools")}
                className="bbc-btn bbc-btn-ghost mt-5 w-full justify-center py-3 text-[14px]"
              >
                Open the toolkit →
              </button>
            </div>

            {/* For coaching institutes */}
            <div className="bbc-reveal bbc-lift relative flex flex-col rounded-[16px] border border-[var(--color-blue-ink)] bg-white p-8 shadow-[0_0_0_1px_var(--color-blue-ink)_inset]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-blue-ink)] px-4 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Higher-value lane
              </div>
              <div className="mb-4">
                <p className="bbc-eyebrow text-[var(--color-blue-ink)]">For coaching institutes</p>
              </div>
              <h3 className="bbc-serif text-[24px] tracking-[-.01em] text-[var(--color-ink)]">
                AI mock tests, your branding.
              </h3>
              <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                For coaching centers running JEE / NEET / CUET prep — the AI does the test-generation grind so your faculty can teach.
              </p>
              <ul className="mt-5 space-y-2.5 border-t border-[var(--color-line)] pt-5 text-left">
                {[
                  "White-label mocks — your logo on every export",
                  "Weak-topic maps per student + aggregate for the batch",
                  "Batch weak-topic report — see where your class struggles",
                  "One-link onboarding — students join in 2 minutes, no setup",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13.5px] text-[var(--color-ink-soft)]"><Check />{f}</li>
                ))}
              </ul>
              <div className="mt-6 flex items-baseline gap-2 border-t border-[var(--color-line)] pt-5">
                <span className="bbc-serif text-[24px] tracking-[-.01em]">₹49–99</span>
                <span className="text-[12.5px] text-[var(--color-ink-faint)]">per seat / month · min 50 seats</span>
              </div>
              <a
                href="/for-institutes"
                className="bbc-btn bbc-btn-primary mt-5 w-full justify-center py-3 text-[14px]"
              >
                Book a 15-min demo →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT PREVIEW ── */}
      <section className="border-b border-[var(--color-line)] bg-[var(--color-paper-card)] py-[88px]">
        <div className="mx-auto max-w-[1180px] px-7">
          <div className="bbc-reveal mx-auto mb-12 max-w-[40em] text-center">
            <p className="bbc-eyebrow">A real session</p>
            <h2 className="bbc-serif mt-3 text-[clamp(26px,3.2vw,38px)] leading-[1.12] tracking-[-.02em]">
              Ask a question. Get an answer that <em className="not-italic italic font-medium text-[var(--color-blue-ink)]">cites the page</em>.
            </h2>
          </div>

          <div className="bbc-reveal mx-auto max-w-[1080px] overflow-hidden rounded-[14px] border border-[var(--color-line)] bg-white shadow-[0_30px_60px_-30px_rgba(20,30,55,.18)]">
            {/* browser chrome */}
            <div className="flex items-center gap-[10px] border-b border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-[10px]">
              <span className="h-[10px] w-[10px] rounded-full bg-[var(--color-line)]" />
              <span className="h-[10px] w-[10px] rounded-full bg-[var(--color-line)]" />
              <span className="h-[10px] w-[10px] rounded-full bg-[var(--color-line)]" />
              <span className="bbc-mono ml-3 text-[11px] tracking-[.08em] text-[var(--color-ink-faint)]">bluebottlecap.com / pdf-copilot</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr]">
              {/* left: PDF page */}
              <div className="relative border-b border-[var(--color-line)] bg-[var(--color-paper)] p-7 md:border-b-0 md:border-r">
                <div className="flex items-center justify-between text-[11px] text-[var(--color-ink-faint)]">
                  <span className="bbc-mono uppercase tracking-[.12em]">thermodynamics_ch4.pdf</span>
                  <span className="bbc-mono">page 47 / 92</span>
                </div>
                <div className="mt-5 rounded-[8px] border border-[var(--color-line)] bg-white p-6">
                  <p className="bbc-serif text-[15px] font-semibold tracking-[-.005em]">4.3 Entropy of an Ideal Gas</p>
                  <div className="mt-3 space-y-2 text-[12.5px] leading-[1.55] text-[var(--color-ink-soft)]">
                    <p>For a reversible process, the change in entropy can be derived from the first law combined with the ideal gas equation of state.</p>
                    <p className="rounded-[4px] bg-[var(--color-blue-wash)] px-2 py-1 text-[var(--color-ink)]">
                      <span className="bbc-mono mr-2 text-[10px] uppercase tracking-[.1em] text-[var(--color-blue-deep)]">cited</span>
                      ΔS = nCv ln(T₂/T₁) + nR ln(V₂/V₁), valid for any quasi-static path between the two states.
                    </p>
                    <p>The expression depends only on the initial and final states, confirming entropy as a state function.</p>
                    <p>Integrating between two temperatures at constant volume yields ΔS = nCv ln(T₂/T₁).</p>
                  </div>
                </div>
              </div>

              {/* right: chat — messages cascade in so the exchange reads as a
                  conversation happening, not a screenshot. */}
              <div className="bbc-cascade flex flex-col gap-4 p-7">
                <div className="self-end max-w-[88%] rounded-[10px] rounded-tr-[2px] bg-[var(--color-blue-ink)] px-4 py-3 text-[13.5px] text-white">
                  Explain the entropy change formula for an ideal gas in simple terms.
                </div>
                <div className="self-start max-w-[92%] rounded-[10px] rounded-tl-[2px] border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 text-[13.5px] text-[var(--color-ink)]">
                  <p className="mb-2">The formula tells you how much disorder an ideal gas gains when its temperature and volume change:</p>
                  <p className="bbc-mono text-[12px] text-[var(--color-blue-deep)]">ΔS = nCv·ln(T₂/T₁) + nR·ln(V₂/V₁)</p>
                  <p className="mt-2 text-[var(--color-ink-soft)]">First term: entropy from heating. Second term: entropy from expansion. Both are positive when the gas warms and expands.</p>
                  <div className="mt-3 flex items-center gap-2 border-t border-[var(--color-line)] pt-2">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 2.5h7l3 3v8a.5.5 0 0 1-.5.5h-9.5z" stroke="var(--color-blue-ink)" strokeWidth="1.3" fill="none"/></svg>
                    <span className="bbc-mono text-[10.5px] uppercase tracking-[.1em] text-[var(--color-ink-faint)]">cited from page 47</span>
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap gap-2 border-t border-[var(--color-line)] pt-4">
                  <span className="rounded-[6px] border border-[var(--color-line)] bg-[var(--color-paper)] px-2.5 py-1 text-[11.5px] text-[var(--color-ink-soft)]">+ Make flashcards</span>
                  <span className="rounded-[6px] border border-[var(--color-line)] bg-[var(--color-paper)] px-2.5 py-1 text-[11.5px] text-[var(--color-ink-soft)]">+ Summarize chapter</span>
                  <span className="rounded-[6px] border border-[var(--color-line)] bg-[var(--color-paper)] px-2.5 py-1 text-[11.5px] text-[var(--color-ink-soft)]">+ Generate mock</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM BAND ── */}
      <section className="border-b border-[var(--color-line)] py-[96px] text-center">
        <div className="mx-auto max-w-[1180px] px-7">
          <p className="bbc-eyebrow bbc-reveal">The honest problem</p>
          <p className="bbc-serif bbc-reveal mx-auto mt-[18px] max-w-[18ch] text-[clamp(26px,3.8vw,42px)] italic leading-[1.22] tracking-[-.01em]">
            You spend more time hunting for good notes than studying them.
          </p>
          <p className="bbc-reveal mx-auto mt-[22px] max-w-[46ch] text-[var(--color-ink-soft)]">
            Scattered PDFs, half-finished playlists, ten browser tabs. BlueBottleCap keeps one quiet workspace where your material, your questions, and your practice all live together.
          </p>
        </div>
      </section>

      {/* ── ANATOMY / SYSTEM DIAGRAM ──
          The patent-drawing bottle from earlier iterations, restored as a
          brand-signature moment rather than the hero. Uses the animation
          scaffolding already in globals.css: bbc-bottle-float, bbc-halo-pulse,
          bbc-liquid-rise, bbc-liquid-wave, and staggered .bbc-diag-label
          reveals keyed off --i. */}
      <section className="border-b border-[var(--color-line)] py-[96px]">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-10 px-7 md:grid-cols-[.9fr_1.1fr]">
          <div className="bbc-reveal">
            <p className="bbc-eyebrow">The system, in one drawing</p>
            <h2 className="bbc-serif mt-3 text-[clamp(28px,3.6vw,40px)] leading-[1.08] tracking-[-.02em]">
              Four moving parts. One quiet workspace.
            </h2>
            <p className="mt-5 max-w-[42ch] text-[16px] leading-[1.6] text-[var(--color-ink-soft)]">
              A study planner that reads your syllabus, summaries that pull the tested points, a PDF
              copilot that cites its sources, and a mock-test mode that runs like the real exam.
              Everything sealed in one bottle.
            </p>
          </div>

          <div className="bbc-diagram bbc-reveal mx-auto w-full max-w-[520px] md:max-w-none" aria-hidden="true">
            <svg viewBox="0 0 760 560" className="bbc-bottle-float block h-auto w-full overflow-visible">
              <defs>
                <clipPath id="bbc-bottle-interior">
                  <path d="M361 139 C 360 162 332 168 332 206 v250 a18 18 0 0 0 18 18 h60 a18 18 0 0 0 18 -18 v-250 c0 -38 -28 -44 -29 -67 Z" />
                </clipPath>
              </defs>

              {/* Halo behind the bottle */}
              <circle className="bbc-halo bbc-halo-pulse" cx="380" cy="380" r="220" />

              {/* Center of symmetry */}
              <line className="bbc-center" x1="380" y1="58" x2="380" y2="500" />

              {/* Cap */}
              <path className="bbc-stroke" d="M352 92 h56 l-4 26 a3 3 0 0 1 -3 3 h-42 a3 3 0 0 1 -3 -3 z" />
              <g className="bbc-stroke-ink">
                <line x1="360" y1="93" x2="359" y2="120" />
                <line x1="369" y1="93" x2="368" y2="121" />
                <line x1="380" y1="93" x2="380" y2="121" />
                <line x1="391" y1="93" x2="392" y2="121" />
                <line x1="400" y1="93" x2="401" y2="120" />
              </g>
              <path className="bbc-stroke" d="M364 121 v10 h-3 v8 h38 v-8 h-3 v-10" />

              {/* Body */}
              <path className="bbc-stroke" d="M361 139 C 360 162 332 168 332 206 v250 a18 18 0 0 0 18 18 h60 a18 18 0 0 0 18 -18 v-250 c0 -38 -28 -44 -29 -67" />

              {/* Animated liquid inside the body, clipped to bottle silhouette */}
              <g clipPath="url(#bbc-bottle-interior)">
                <g className="bbc-liquid-rise">
                  <rect className="bbc-liquid" x="320" y="320" width="120" height="160" />
                  <path
                    className="bbc-liquid bbc-liquid-wave"
                    d="M280 322 Q320 310 360 322 T440 322 T520 322 L520 340 L280 340 Z"
                  />
                  <path
                    className="bbc-liquid-line bbc-liquid-wave"
                    style={{ animationDuration: "5.5s", animationDirection: "reverse" }}
                    d="M280 328 Q320 316 360 328 T440 328 T520 328"
                  />
                </g>
              </g>

              {/* Document card inside the bottle */}
              <rect className="bbc-stroke-ink" x="345" y="300" width="70" height="96" rx="6" fill="var(--color-paper-card)" />
              <line className="bbc-stroke-ink" x1="358" y1="324" x2="402" y2="324" />
              <line className="bbc-stroke-ink" x1="358" y1="340" x2="402" y2="340" />
              <line className="bbc-stroke-ink" x1="358" y1="356" x2="388" y2="356" />

              {/* Height indicator */}
              <g className="bbc-stroke-ink" opacity=".5">
                <line x1="300" y1="206" x2="312" y2="206" />
                <line x1="306" y1="206" x2="306" y2="456" />
                <line x1="300" y1="456" x2="312" y2="456" />
              </g>

              {/* Annotated labels — CSS var --i drives the stagger */}
              <g className="bbc-diag-label" style={{ ["--i" as never]: 0 }}>
                <circle className="bbc-anchor" cx="361" cy="135" r="3" />
                <path className="bbc-lead bbc-draw" d="M361 135 H188 V124" />
                <text className="bbc-lbl-num" x="120" y="118">01</text>
                <text className="bbc-lbl" x="146" y="118">STUDY PLANNER</text>
              </g>
              <g className="bbc-diag-label" style={{ ["--i" as never]: 1 }}>
                <circle className="bbc-anchor" cx="332" cy="380" r="3" />
                <path className="bbc-lead bbc-draw" d="M332 380 H188 V392" />
                <text className="bbc-lbl-num" x="120" y="398">02</text>
                <text className="bbc-lbl" x="146" y="398">SMART SUMMARIES</text>
              </g>
              <g className="bbc-diag-label" style={{ ["--i" as never]: 2 }}>
                <circle className="bbc-anchor" cx="406" cy="106" r="3" />
                <path className="bbc-lead bbc-draw" d="M406 106 H572 V94" />
                <text className="bbc-lbl-num" x="572" y="88">03</text>
                <text className="bbc-lbl" x="598" y="88">AI PDF COPILOT</text>
              </g>
              <g className="bbc-diag-label" style={{ ["--i" as never]: 3 }}>
                <circle className="bbc-anchor" cx="428" cy="420" r="3" />
                <path className="bbc-lead bbc-draw" d="M428 420 H572 V432" />
                <text className="bbc-lbl-num" x="572" y="438">04</text>
                <text className="bbc-lbl" x="598" y="438">MOCK TEST MODE</text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* ── TOOLS / INDEX ── */}
      <section id="tools" className="border-b border-[var(--color-line)] py-[88px]">
        <div className="mx-auto max-w-[1180px] px-7">
          <div className="bbc-reveal mb-12 max-w-[36em]">
            <p className="bbc-eyebrow">The suite</p>
            <h2 className="bbc-serif mt-3 text-[clamp(28px,3.4vw,40px)] leading-[1.1] tracking-[-.02em]">Every tool your syllabus actually needs.</h2>
            <p className="mt-[14px] text-[17px] text-[var(--color-ink-soft)]">Built around your material — for students studying it, and institutes teaching from it.</p>
          </div>
          <div className="border-t border-[var(--color-line)]">
            {tools.map((tool) => (
              <a
                key={tool.n}
                href={tool.href}
                className="bbc-row bbc-reveal grid grid-cols-[36px_28px_1fr_22px] items-center gap-5 border-b border-[var(--color-line)] px-1 py-[26px] no-underline md:grid-cols-[56px_30px_1fr_1.3fr_24px] md:gap-6"
              >
                <span className="bbc-mono text-[15px] text-[var(--color-blue-ink)]">{tool.n}</span>
                <tool.Icon className="text-[var(--color-blue-ink)]" />
                <span className="bbc-serif text-[22px] tracking-[-.01em] text-[var(--color-ink)]">{tool.t}</span>
                <span className="hidden text-[16px] text-[var(--color-ink-soft)] md:block">{tool.d}</span>
                <span className="bbc-arrow justify-self-end text-[var(--color-ink-faint)]">→</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="border-b border-[var(--color-line)] py-[88px]">
        <div className="mx-auto max-w-[1180px] px-7">
          <div className="bbc-reveal mb-12 max-w-[38em]">
            <p className="bbc-eyebrow">How it works</p>
            <h2 className="bbc-serif mt-3 text-[clamp(28px,3.4vw,40px)] leading-[1.1] tracking-[-.02em]">From a messy PDF to a real study session in under a minute.</h2>
            <p className="mt-4 text-[16.5px] text-[var(--color-ink-soft)]">Three steps, one quiet loop. Drop in your material, ask it anything, then turn what you read into practice — all on one screen.</p>
          </div>
          <div className="relative grid grid-cols-1 gap-[30px] md:grid-cols-3">
            {[
              {
                s: "Step 01", h: "Upload your material", p: "Drop in a textbook chapter, your handwritten notes, or a past paper. It's read in seconds — and your file never leaves your account.",
                art: (
                  <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden="true">
                    {/* dashed drop-zone */}
                    <rect x="24" y="12" width="172" height="96" rx="10" stroke="var(--color-ink-faint)" strokeWidth="1.2" strokeDasharray="5 5" fill="none"/>
                    {/* PDF document with folded corner */}
                    <path d="M84 28h34l20 20v46a3 3 0 0 1-3 3H84a3 3 0 0 1-3-3V31a3 3 0 0 1 3-3Z" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="1.4"/>
                    <path d="M118 28v20h20" fill="none" stroke="var(--color-ink)" strokeWidth="1.4" strokeLinejoin="round"/>
                    <path d="M90 62h44M90 71h32M90 80h40" stroke="var(--color-ink-faint)" strokeWidth="1.4" strokeLinecap="round"/>
                    <rect x="90" y="50" width="26" height="8" rx="2" fill="var(--color-blue-ink)"/>
                    {/* upward upload arrow */}
                    <circle cx="164" cy="40" r="15" fill="var(--color-blue-wash)" stroke="var(--color-blue-ink)" strokeWidth="1.3"/>
                    <path d="M164 47v-14M157 40l7-7 7 7" stroke="var(--color-blue-ink)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
              {
                s: "Step 02", h: "Ask in plain words", p: "Type a doubt like you'd text a friend. The answer comes back grounded in your exact document — and cites the page it came from, so you can trust it.",
                art: (
                  <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden="true">
                    {/* user question bubble */}
                    <path d="M58 16h96a8 8 0 0 1 8 8v18a8 8 0 0 1-8 8H74l-12 10V50h-4a8 8 0 0 1-8-8V24a8 8 0 0 1 8-8Z" fill="var(--color-blue-ink)"/>
                    <path d="M70 28h72M70 37h44" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.5" strokeLinecap="round"/>
                    {/* AI answer bubble */}
                    <path d="M40 62h108a8 8 0 0 1 8 8v30a8 8 0 0 1-8 8H56l-10 9v-9h-6a8 8 0 0 1-8-8V70a8 8 0 0 1 8-8Z" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="1.4"/>
                    <path d="M52 74h84M52 82h64" stroke="var(--color-ink-faint)" strokeWidth="1.4" strokeLinecap="round"/>
                    {/* citation chip */}
                    <rect x="52" y="90" width="52" height="12" rx="4" fill="var(--color-blue-wash)" stroke="var(--color-blue-ink)" strokeWidth="0.9"/>
                    <path d="M59 96h4M67 92v8" stroke="var(--color-blue-ink)" strokeWidth="1" strokeLinecap="round"/>
                    <text x="74" y="99.5" fontSize="8" fontWeight="700" fill="var(--color-blue-ink)" fontFamily="ui-monospace, monospace">p. 47</text>
                  </svg>
                ),
              },
              {
                s: "Step 03", h: "Practice what you read", p: "One tap turns that chapter into flashcards, a crisp summary, or a timed mock — so reading becomes revising, and revising becomes rank.",
                art: (
                  <svg viewBox="0 0 220 120" className="h-full w-full" aria-hidden="true">
                    {/* fanned flashcards */}
                    <g transform="rotate(-9 78 66)">
                      <rect x="44" y="44" width="72" height="48" rx="6" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="1.3"/>
                    </g>
                    <rect x="56" y="40" width="72" height="48" rx="6" fill="var(--color-blue-wash)" stroke="var(--color-blue-ink)" strokeWidth="1.4"/>
                    <path d="M68 58h48M68 68h30" stroke="var(--color-blue-deep)" strokeWidth="1.5" strokeLinecap="round"/>
                    {/* timer / mock */}
                    <circle cx="168" cy="66" r="26" fill="var(--color-paper-card)" stroke="var(--color-ink)" strokeWidth="1.4"/>
                    <path d="M168 66V48" stroke="var(--color-blue-ink)" strokeWidth="1.6" strokeLinecap="round"/>
                    <path d="M168 66l12 7" stroke="var(--color-blue-ink)" strokeWidth="1.6" strokeLinecap="round"/>
                    <path d="M168 40v-6M186 48l4-4" stroke="var(--color-ink)" strokeWidth="1.4" strokeLinecap="round"/>
                    {/* progress arc */}
                    <path d="M168 40a26 26 0 0 1 22 40" fill="none" stroke="var(--color-blue-ink)" strokeWidth="2.4" strokeLinecap="round"/>
                  </svg>
                ),
              },
            ].map((step, i) => (
              <div key={step.s} className="bbc-reveal relative border-t-2 border-[var(--color-ink)] pt-[22px]">
                <div className="-mx-1 mb-[18px] flex h-[132px] items-center justify-center rounded-[10px] border border-[var(--color-line)] bg-[var(--color-paper-card)] px-3 py-3">{step.art}</div>
                {/* flow arrow to the next step (desktop only) */}
                {i < 2 && (
                  <div className="absolute -right-[24px] top-[86px] z-10 hidden h-8 w-8 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-blue-ink)] md:flex" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                )}
                <span className="bbc-mono text-[12px] uppercase tracking-[.16em] text-[var(--color-ink-faint)]">{step.s}</span>
                <h3 className="bbc-serif mt-[14px] mb-2 text-[21px] tracking-[-.01em]">{step.h}</h3>
                <p className="text-[15.5px] text-[var(--color-ink-soft)]">{step.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="border-b border-[var(--color-line)] py-[88px]">
        <div className="mx-auto max-w-[1180px] px-7">
          <div className="bbc-reveal mx-auto mb-12 max-w-[36em] text-center">
            <p className="bbc-eyebrow">Pricing</p>
            <h2 className="bbc-serif mt-3 text-[clamp(28px,3.4vw,40px)] leading-[1.1] tracking-[-.02em]">Fair pricing. Honest about it.</h2>
            <p className="mt-[14px] text-[17px] text-[var(--color-ink-soft)]">Students start free forever. Institutes pay per seat. Full comparison on the <a href="/pricing" className="font-semibold text-[var(--color-blue-ink)] underline decoration-[var(--color-blue-wash)] underline-offset-4 hover:decoration-[var(--color-blue-ink)]">pricing page</a>.</p>
          </div>
          <div className="grid grid-cols-1 gap-[22px] md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className={`bbc-reveal bbc-lift flex flex-col rounded-[14px] border p-[30px] ${plan.featured ? "border-[var(--color-blue-ink)] bg-white shadow-[0_0_0_1px_var(--color-blue-ink)_inset]" : "border-[var(--color-line)] bg-[var(--color-paper-card)]"}`}>
                <div className="flex items-center justify-between">
                  <span className="bbc-serif text-[20px] font-semibold">{plan.name}</span>
                  {plan.tag && <span className="bbc-mono rounded-[6px] bg-[var(--color-blue-ink)] px-[9px] py-1 text-[10.5px] uppercase tracking-[.12em] text-white">{plan.tag}</span>}
                </div>
                <div className="mt-5 mb-1 flex items-baseline gap-1">
                  <span className="bbc-serif text-[42px] font-semibold tracking-[-.02em]">{plan.price}</span>
                  <span className="bbc-mono text-[14px] text-[var(--color-ink-faint)]">{plan.per}</span>
                </div>
                <p className="mb-[18px] min-h-[42px] text-[14.5px] text-[var(--color-ink-soft)]">{plan.desc}</p>
                <ul className="mb-[26px] flex-1 list-none p-0">
                  {plan.items.map((it) => (
                    <li key={it} className="flex items-start gap-[10px] py-[7px] text-[14.5px]"><Check />{it}</li>
                  ))}
                </ul>
                <button onClick={() => onNavigate(plan.view)} className={`bbc-btn w-full justify-center py-3 ${plan.featured ? "bbc-btn-primary" : "bbc-btn-ghost"}`}>{plan.cta}</button>
              </div>
            ))}
          </div>
          <p className="bbc-reveal mt-[26px] text-center text-[13.5px] text-[var(--color-ink-faint)]">Students get 30% off any paid plan with a valid student ID or college email. Institute per-seat plans are on the <a href="/for-institutes" className="font-semibold text-[var(--color-blue-ink)] hover:underline">institute page</a>.</p>
        </div>
      </section>

      {/* ── CLOSING ── */}
      <section className="border-b border-[var(--color-line)] py-[108px] text-center">
        <div className="mx-auto max-w-[1180px] px-7">
          <p className="bbc-eyebrow bbc-reveal">Ready when you are</p>
          <h2 className="bbc-serif bbc-reveal mx-auto mt-[14px] max-w-[16ch] text-[clamp(30px,4.4vw,52px)] leading-[1.08] tracking-[-.02em]">Quieter prep. Better marks.</h2>
          <div className="bbc-reveal mt-[34px]">
            <button onClick={() => onNavigate("tools")} className="bbc-btn bbc-btn-primary px-[26px] py-[14px] text-[16px]">Open the toolkit</button>
          </div>
          <p className="bbc-reveal mt-[18px] text-[13px] text-[var(--color-ink-faint)]">Free forever plan · UPI accepted · No card needed</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-[46px]">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-5 px-7">
          <div className="flex items-center gap-[11px] text-[15px] font-semibold"><Seal size={22} /> BlueBottleCap</div>
          <nav className="flex flex-wrap gap-6" aria-label="Footer">
            <button onClick={() => scrollTo("tools")} className="text-[13.5px] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">Tools</button>
            <button onClick={() => scrollTo("pricing")} className="text-[13.5px] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">Pricing</button>
            <a href="/for-institutes" className="text-[13.5px] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">For institutes</a>
            <button onClick={() => onNavigate("about")} className="text-[13.5px] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">About</button>
            <button onClick={() => onNavigate("terms")} className="text-[13.5px] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">Terms</button>
          </nav>
          <span className="bbc-mono text-[12.5px] text-[var(--color-ink-faint)]">© 2026 · Made in India</span>
        </div>
      </footer>
    </div>
  );
};
