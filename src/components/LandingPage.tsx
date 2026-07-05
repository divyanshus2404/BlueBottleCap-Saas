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
  { n: "01", tKey: "tool.1t", dKey: "tool.1d", Icon: ToolIcon.scan, href: "/scan-notes" },
  { n: "02", tKey: "tool.2t", dKey: "tool.2d", Icon: ToolIcon.pdf, href: "/pdf-editor" },
  { n: "03", tKey: "tool.3t", dKey: "tool.3d", Icon: ToolIcon.tools, href: "/tools" },
  { n: "04", tKey: "tool.4t", dKey: "tool.4d", Icon: ToolIcon.timer, href: "/diagnostic" },
  { n: "05", tKey: "tool.5t", dKey: "tool.5d", Icon: ToolIcon.cards, href: "/pdf-editor" },
  { n: "06", tKey: "tool.6t", dKey: "tool.6d", Icon: ToolIcon.summary, href: "/pdf-editor" },
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
              {t("hero.noSignup")}
            </p>
            <div className="bbc-reveal mt-[42px] flex flex-wrap items-center gap-x-[22px] gap-y-2 border-t border-[var(--color-line)] pt-[20px]">
              <div className="flex items-center gap-[8px] text-[13px] text-[var(--color-ink-faint)]">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.25" stroke="var(--color-blue-ink)" strokeWidth="1.4"/><path d="M5.5 8.5l1.7 1.7L10.7 6.4" stroke="var(--color-blue-ink)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                {t("hero.freeAccess")}
              </div>
              <div className="flex items-center gap-[8px] text-[13px] text-[var(--color-ink-faint)]">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2.25" y="4.25" width="11.5" height="8.5" rx="1.5" stroke="var(--color-blue-ink)" strokeWidth="1.3"/><path d="M2.5 7h11" stroke="var(--color-blue-ink)" strokeWidth="1.3"/><path d="M4 4.25V3" stroke="var(--color-blue-ink)" strokeWidth="1.3" strokeLinecap="round"/><path d="M12 4.25V3" stroke="var(--color-blue-ink)" strokeWidth="1.3" strokeLinecap="round"/></svg>
                {t("hero.noCard")}
              </div>
              <div className="flex items-center gap-[8px] text-[13px] text-[var(--color-ink-faint)]">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.5l2 4.3 4.5.5-3.4 3.1.9 4.6L8 11.6l-4 2.4.9-4.6L1.5 6.3l4.5-.5L8 1.5z" stroke="var(--color-blue-ink)" strokeWidth="1.3" strokeLinejoin="round" fill="none"/></svg>
                {t("hero.builtFor")}
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
            <p className="bbc-eyebrow">{t("lanes.eyebrow")}</p>
            <h2 className="bbc-serif mt-3 text-[clamp(28px,3.4vw,40px)] leading-[1.1] tracking-[-.02em]">
              {t("lanes.title")}
            </h2>
            <p className="mt-3 text-[16px] text-[var(--color-ink-soft)]">
              {t("lanes.subhead")}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* For students */}
            <div className="bbc-reveal bbc-lift flex flex-col rounded-[16px] border border-[var(--color-line)] bg-[var(--color-paper-card)] p-8">
              <div className="mb-4">
                <p className="bbc-eyebrow text-[var(--color-ink)]">{t("student.for")}</p>
              </div>
              <h3 className="bbc-serif text-[24px] tracking-[-.01em] text-[var(--color-ink)]">
                {t("student.title")}
              </h3>
              <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                {t("student.desc")}
              </p>
              <ul className="mt-5 space-y-2.5 border-t border-[var(--color-line)] pt-5 text-left">
                {["student.f1", "student.f2", "student.f3", "student.f4"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13.5px] text-[var(--color-ink-soft)]"><Check />{t(f)}</li>
                ))}
              </ul>
              <div className="mt-6 flex items-baseline gap-2 border-t border-[var(--color-line)] pt-5">
                <span className="bbc-serif text-[24px] tracking-[-.01em]">₹0</span>
                <span className="text-[12.5px] text-[var(--color-ink-faint)]">{t("student.forever")}</span>
                <span className="bbc-serif text-[24px] tracking-[-.01em]">₹199</span>
                <span className="text-[12.5px] text-[var(--color-ink-faint)]">{t("student.moPro")}</span>
              </div>
              <button
                onClick={() => onNavigate("tools")}
                className="bbc-btn bbc-btn-ghost mt-5 w-full justify-center py-3 text-[14px]"
              >
                {t("student.cta")}
              </button>
            </div>

            {/* For coaching institutes */}
            <div className="bbc-reveal bbc-lift relative flex flex-col rounded-[16px] border border-[var(--color-blue-ink)] bg-white p-8 shadow-[0_0_0_1px_var(--color-blue-ink)_inset]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-blue-ink)] px-4 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {t("inst.tag")}
              </div>
              <div className="mb-4">
                <p className="bbc-eyebrow text-[var(--color-blue-ink)]">{t("inst.for")}</p>
              </div>
              <h3 className="bbc-serif text-[24px] tracking-[-.01em] text-[var(--color-ink)]">
                {t("inst.title")}
              </h3>
              <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
                {t("inst.desc")}
              </p>
              <ul className="mt-5 space-y-2.5 border-t border-[var(--color-line)] pt-5 text-left">
                {["inst.f1", "inst.f2", "inst.f3", "inst.f4"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13.5px] text-[var(--color-ink-soft)]"><Check />{t(f)}</li>
                ))}
              </ul>
              <div className="mt-6 flex items-baseline gap-2 border-t border-[var(--color-line)] pt-5">
                <span className="bbc-serif text-[24px] tracking-[-.01em]">₹49–99</span>
                <span className="text-[12.5px] text-[var(--color-ink-faint)]">{t("inst.per")}</span>
              </div>
              <a
                href="/for-institutes"
                className="bbc-btn bbc-btn-primary mt-5 w-full justify-center py-3 text-[14px]"
              >
                {t("inst.cta")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT PREVIEW ── */}
      <section className="border-b border-[var(--color-line)] bg-[var(--color-paper-card)] py-[88px]">
        <div className="mx-auto max-w-[1180px] px-7">
          <div className="bbc-reveal mx-auto mb-12 max-w-[40em] text-center">
            <p className="bbc-eyebrow">{t("demo.eyebrow")}</p>
            <h2 className="bbc-serif mt-3 text-[clamp(26px,3.2vw,38px)] leading-[1.12] tracking-[-.02em]">
              {lang === "en" ? (
                <>Ask a question. Get an answer that <em className="not-italic italic font-medium text-[var(--color-blue-ink)]">cites the page</em>.</>
              ) : (
                t("demo.title")
              )}
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
          <p className="bbc-eyebrow bbc-reveal">{t("problem.eyebrow")}</p>
          <p className="bbc-serif bbc-reveal mx-auto mt-[18px] max-w-[18ch] text-[clamp(26px,3.8vw,42px)] italic leading-[1.22] tracking-[-.01em]">
            {t("problem.title")}
          </p>
          <p className="bbc-reveal mx-auto mt-[22px] max-w-[46ch] text-[var(--color-ink-soft)]">
            {t("problem.body")}
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
            <p className="bbc-eyebrow">{t("sys.eyebrow")}</p>
            <h2 className="bbc-serif mt-3 text-[clamp(28px,3.6vw,40px)] leading-[1.08] tracking-[-.02em]">
              {t("sys.title")}
            </h2>
            <p className="mt-5 max-w-[42ch] text-[16px] leading-[1.6] text-[var(--color-ink-soft)]">
              {t("sys.desc")}
            </p>
          </div>

          <div className="bbc-diagram bbc-reveal mx-auto w-full max-w-[520px] md:max-w-none" aria-hidden="true">
            <svg viewBox="0 0 760 560" className="block h-auto w-full overflow-visible">
              {/* Orbit rings — slowly revolving, different speeds/directions */}
              <circle className="bbc-orbit-ring bbc-spin-a" cx="380" cy="285" r="104" />
              <circle className="bbc-orbit-ring bbc-spin-b" cx="380" cy="285" r="150" />
              <circle className="bbc-orbit-ring bbc-spin-a" cx="380" cy="285" r="210" />

              {/* Data pulses travelling the orbit */}
              <g className="bbc-orbit-travel-a"><circle className="bbc-orbit-dot" cx="380" cy="135" r="4" /></g>
              <g className="bbc-orbit-travel-b"><circle className="bbc-orbit-dot" cx="380" cy="75" r="3" /></g>

              {/* Spokes: everything connects back to your material */}
              <g>
                <path className="bbc-spoke bbc-draw" d="M353 258 L286 191" />
                <path className="bbc-spoke bbc-draw" d="M407 258 L474 191" />
                <path className="bbc-spoke bbc-draw" d="M353 312 L286 379" />
                <path className="bbc-spoke bbc-draw" d="M407 312 L474 379" />
              </g>

              {/* Core — your material, gently breathing */}
              <circle className="bbc-core-halo bbc-core-pulse" cx="380" cy="285" r="64" />
              <circle className="bbc-core" cx="380" cy="285" r="38" />
              {/* stacked-document glyph = your material */}
              <path className="bbc-icn" d="M371 271 h13 l6 6 v22 a2 2 0 0 1 -2 2 h-17 a2 2 0 0 1 -2 -2 v-26 a2 2 0 0 1 2 -2 z" />
              <path className="bbc-icn" d="M384 271 v6 h6" />
              <path className="bbc-icn" d="M375 288 h11 M375 294 h8" />
              <text className="bbc-core-lbl" x="380" y="344" textAnchor="middle">{t("dg.core")}</text>

              {/* Four feature nodes in orbit, each with icon chip + callout */}
              <g className="bbc-diag-label" style={{ ["--i" as never]: 0 }}>
                <path className="bbc-lead bbc-draw" d="M274 179 L212 150" />
                <circle className="bbc-icn-bg" cx="274" cy="179" r="17" />
                <rect className="bbc-icn" x="268" y="175" width="12" height="10" rx="2" />
                <path className="bbc-icn" d="M268 178.5 h12" />
                <path className="bbc-icn" d="M271 172.5 v3 M277 172.5 v3" />
                <text className="bbc-lbl-num" x="64" y="150">01</text>
                <text className="bbc-lbl" x="90" y="150">{t("dg.n1")}</text>
                <text className="bbc-lbl-desc" x="90" y="166">{t("dg.d1")}</text>
              </g>
              <g className="bbc-diag-label" style={{ ["--i" as never]: 1 }}>
                <path className="bbc-lead bbc-draw" d="M274 391 L212 424" />
                <circle className="bbc-icn-bg" cx="274" cy="391" r="17" />
                <rect className="bbc-icn" x="269" y="385" width="10" height="12" rx="1.5" />
                <path className="bbc-icn" d="M271.5 388.5 h5 M271.5 391 h5 M271.5 393.5 h3" />
                <text className="bbc-lbl-num" x="64" y="424">02</text>
                <text className="bbc-lbl" x="90" y="424">{t("dg.n2")}</text>
                <text className="bbc-lbl-desc" x="90" y="440">{t("dg.d2")}</text>
              </g>
              <g className="bbc-diag-label" style={{ ["--i" as never]: 2 }}>
                <path className="bbc-lead bbc-draw" d="M486 179 L548 150" />
                <circle className="bbc-icn-bg" cx="486" cy="179" r="17" />
                <rect className="bbc-icn" x="480" y="174" width="12" height="9" rx="3" />
                <path className="bbc-icn" d="M483 183 l-2 3 v-3" />
                <path className="bbc-icn" d="M483 178.5 h.01 M486 178.5 h.01 M489 178.5 h.01" strokeWidth="1.8" />
                <text className="bbc-lbl-num" x="556" y="150">03</text>
                <text className="bbc-lbl" x="582" y="150">{t("dg.n3")}</text>
                <text className="bbc-lbl-desc" x="582" y="166">{t("dg.d3")}</text>
              </g>
              <g className="bbc-diag-label" style={{ ["--i" as never]: 3 }}>
                <path className="bbc-lead bbc-draw" d="M486 391 L548 424" />
                <circle className="bbc-icn-bg" cx="486" cy="391" r="17" />
                <circle className="bbc-icn" cx="486" cy="392" r="6" />
                <path className="bbc-icn" d="M486 392 v-3.5 M486 392 l3 2" />
                <path className="bbc-icn" d="M483.5 384.5 h5" />
                <text className="bbc-lbl-num" x="556" y="424">04</text>
                <text className="bbc-lbl" x="582" y="424">{t("dg.n4")}</text>
                <text className="bbc-lbl-desc" x="582" y="440">{t("dg.d4")}</text>
              </g>

              {/* Blueprint flourishes: registration crosshairs + figure caption */}
              <g className="bbc-reg">
                <path d="M18 26 v-14 h14" />
                <path d="M742 26 v-14 h-14" />
                <path d="M18 534 v14 h14" />
                <path d="M742 534 v14 h-14" />
              </g>
              <text className="bbc-fig" x="380" y="548" textAnchor="middle">FIG. 01 — THE BLUEBOTTLECAP SYSTEM</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ── TOOLS / INDEX ── */}
      <section id="tools" className="border-b border-[var(--color-line)] py-[88px]">
        <div className="mx-auto max-w-[1180px] px-7">
          <div className="bbc-reveal mb-12 max-w-[36em]">
            <p className="bbc-eyebrow">{t("suite.eyebrow")}</p>
            <h2 className="bbc-serif mt-3 text-[clamp(28px,3.4vw,40px)] leading-[1.1] tracking-[-.02em]">{t("suite.title")}</h2>
            <p className="mt-[14px] text-[17px] text-[var(--color-ink-soft)]">{t("suite.subhead")}</p>
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
                <span className="bbc-serif text-[22px] tracking-[-.01em] text-[var(--color-ink)]">{t(tool.tKey)}</span>
                <span className="hidden text-[16px] text-[var(--color-ink-soft)] md:block">{t(tool.dKey)}</span>
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
            <p className="bbc-eyebrow">{t("how.eyebrow")}</p>
            <h2 className="bbc-serif mt-3 text-[clamp(28px,3.4vw,40px)] leading-[1.1] tracking-[-.02em]">{t("how.title")}</h2>
            <p className="mt-4 text-[16.5px] text-[var(--color-ink-soft)]">{t("how.subhead")}</p>
          </div>
          <div className="relative grid grid-cols-1 gap-[30px] md:grid-cols-3">
            {[
              {
                s: "Step 01", hKey: "how.s1t", pKey: "how.s1d",
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
                s: "Step 02", hKey: "how.s2t", pKey: "how.s2d",
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
                s: "Step 03", hKey: "how.s3t", pKey: "how.s3d",
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
                <h3 className="bbc-serif mt-[14px] mb-2 text-[21px] tracking-[-.01em]">{t(step.hKey)}</h3>
                <p className="text-[15.5px] text-[var(--color-ink-soft)]">{t(step.pKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="border-b border-[var(--color-line)] py-[88px]">
        <div className="mx-auto max-w-[1180px] px-7">
          <div className="bbc-reveal mx-auto mb-12 max-w-[36em] text-center">
            <p className="bbc-eyebrow">{t("pricing.eyebrow")}</p>
            <h2 className="bbc-serif mt-3 text-[clamp(28px,3.4vw,40px)] leading-[1.1] tracking-[-.02em]">{t("pricing.title")}</h2>
            <p className="mt-[14px] text-[17px] text-[var(--color-ink-soft)]">{t("pricing.subhead")} {t("pricing.full")} <a href="/pricing" className="font-semibold text-[var(--color-blue-ink)] underline decoration-[var(--color-blue-wash)] underline-offset-4 hover:decoration-[var(--color-blue-ink)]">{t("pricing.pageLink")}</a>.</p>
          </div>
          <div className="grid grid-cols-1 gap-[22px] md:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.nameKey} className={`bbc-reveal bbc-lift flex flex-col rounded-[14px] border p-[30px] ${plan.featured ? "border-[var(--color-blue-ink)] bg-white shadow-[0_0_0_1px_var(--color-blue-ink)_inset]" : "border-[var(--color-line)] bg-[var(--color-paper-card)]"}`}>
                <div className="flex items-center justify-between">
                  <span className="bbc-serif text-[20px] font-semibold">{t(plan.nameKey)}</span>
                  {plan.tagKey && <span className="bbc-mono rounded-[6px] bg-[var(--color-blue-ink)] px-[9px] py-1 text-[10.5px] uppercase tracking-[.12em] text-white">{t(plan.tagKey)}</span>}
                </div>
                <div className="mt-5 mb-1 flex items-baseline gap-1">
                  <span className="bbc-serif text-[42px] font-semibold tracking-[-.02em]">{plan.price}</span>
                  <span className="bbc-mono text-[14px] text-[var(--color-ink-faint)]">{plan.per}</span>
                </div>
                <p className="mb-[18px] min-h-[42px] text-[14.5px] text-[var(--color-ink-soft)]">{t(plan.descKey)}</p>
                <ul className="mb-[26px] flex-1 list-none p-0">
                  {plan.itemKeys.map((it) => (
                    <li key={it} className="flex items-start gap-[10px] py-[7px] text-[14.5px]"><Check />{t(it)}</li>
                  ))}
                </ul>
                <button onClick={() => onNavigate(plan.view)} className={`bbc-btn w-full justify-center py-3 ${plan.featured ? "bbc-btn-primary" : "bbc-btn-ghost"}`}>{t(plan.ctaKey)}</button>
              </div>
            ))}
          </div>
          <p className="bbc-reveal mt-[26px] text-center text-[13.5px] text-[var(--color-ink-faint)]">{t("pricing.note")} <a href="/for-institutes" className="font-semibold text-[var(--color-blue-ink)] hover:underline">{t("footer.forInstitutes")} →</a></p>
        </div>
      </section>

      {/* ── CLOSING ── */}
      <section className="border-b border-[var(--color-line)] py-[108px] text-center">
        <div className="mx-auto max-w-[1180px] px-7">
          <p className="bbc-eyebrow bbc-reveal">{t("close.eyebrow")}</p>
          <h2 className="bbc-serif bbc-reveal mx-auto mt-[14px] max-w-[16ch] text-[clamp(30px,4.4vw,52px)] leading-[1.08] tracking-[-.02em]">{t("close.title")}</h2>
          <div className="bbc-reveal mt-[34px]">
            <button onClick={() => onNavigate("tools")} className="bbc-btn bbc-btn-primary px-[26px] py-[14px] text-[16px]">{t("close.cta")}</button>
          </div>
          <p className="bbc-reveal mt-[18px] text-[13px] text-[var(--color-ink-faint)]">{t("close.trust")}</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-[46px]">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-5 px-7">
          <div className="flex items-center gap-[11px] text-[15px] font-semibold"><Seal size={22} /> BlueBottleCap</div>
          <nav className="flex flex-wrap gap-6" aria-label="Footer">
            <button onClick={() => scrollTo("tools")} className="text-[13.5px] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">{t("nav.tools")}</button>
            <button onClick={() => scrollTo("pricing")} className="text-[13.5px] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">{t("nav.pricing")}</button>
            <a href="/for-institutes" className="text-[13.5px] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">{t("footer.forInstitutes")}</a>
            <button onClick={() => onNavigate("about")} className="text-[13.5px] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">{t("footer.about")}</button>
            <button onClick={() => onNavigate("terms")} className="text-[13.5px] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">{t("footer.terms")}</button>
          </nav>
          <span className="bbc-mono text-[12.5px] text-[var(--color-ink-faint)]">{t("footer.madeIn")}</span>
        </div>
      </footer>
    </div>
  );
};
