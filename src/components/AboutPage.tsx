"use client";
import React, { useRef, useEffect } from "react";
import { ArrowLeft, Heart } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ActiveView } from "../types";

gsap.registerPlugin(ScrollTrigger);

interface AboutPageProps {
  onNavigate: (view: ActiveView) => void;
}

const FAQS: { q: string; a: string }[] = [
  {
    q: "What exactly does BlueBottleCap do?",
    a: "BlueBottleCap is an intelligent study platform designed specifically for ambitious students. It aggregates premium, chapter-wise notes and Previous Year Question (PYQ) papers across universities and competitive exams. Beyond just a PDF library, it features an immersive, distraction-free AI mock test environment that instantly grades your answers, generates flashcards, and helps you retain information faster.",
  },
  {
    q: "Are the study materials and PYQs updated?",
    a: "Yes! As a solo developer and student, I understand how crucial accurate data is. I've built automation systems that continuously source and verify the latest exam patterns, ensuring the database stays relevant to current academic requirements.",
  },
  {
    q: "Can I request specific university papers?",
    a: "Absolutely. We have a rapidly expanding database, but if your specific university or exam isn't listed yet, you can request it through the dashboard and I prioritize adding those resources within a few days.",
  },
];

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".about-content", {
        y: 24,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.2,
      });
      gsap.from(".faq-item", {
        y: 20,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: { trigger: ".faq-section", start: "top 85%" },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bbc relative min-h-screen overflow-hidden">
      <div className="bbc-grid" aria-hidden="true" />

      <div className="relative z-[2] mx-auto max-w-[1180px] px-7 pt-20 pb-28">
        {/* Back */}
        <div className="about-content mb-12">
          <button
            onClick={() => onNavigate("landing")}
            className="inline-flex items-center gap-2 text-[14px] text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>
        </div>

        <div className="mx-auto max-w-3xl">
          <p className="bbc-eyebrow about-content">Our story</p>
          <h1 className="bbc-serif about-content mt-[18px] text-[clamp(38px,5.2vw,62px)] leading-[1.04] tracking-[-.02em]">
            The story behind{" "}
            <em className="not-italic italic text-[var(--color-blue-ink)]">BlueBottleCap.</em>
          </h1>

          <div className="about-content mt-10 space-y-6 text-[18px] leading-relaxed text-[var(--color-ink-soft)]">
            <p className="text-[19px] text-[var(--color-ink)]">
              The idea began with a simple, frustrating realization: finding quality previous year
              question papers—whether for university finals or competitive prep exams—was needlessly
              difficult. Students were spending more time hunting for materials than actually studying
              them.
            </p>
            <p>
              I built this platform entirely on my own, dedicating it to students who want to cut the
              noise and just get to work.
            </p>

            <h3 className="bbc-serif pt-6 text-[26px] tracking-[-.01em] text-[var(--color-ink)]">
              Why are some features paid?
            </h3>
            <p>
              The answer is completely transparent. Running complex AI models, updating databases, and
              maintaining fast servers is incredibly expensive. I don't have venture capital funding or
              a corporate team backing me. I'm a solo entrepreneur who started this from a single idea,
              building it from the ground up.
            </p>

            <div className="group relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-blue-wash)] p-8">
              <Heart className="absolute -right-2 -top-2 h-28 w-28 text-[var(--color-blue-ink)] opacity-10 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110" />
              <p className="relative z-10 text-[17px] font-medium text-[var(--color-ink)]">
                If BlueBottleCap has helped you study smarter, retain information faster, or score
                better on an exam, please consider supporting the project by upgrading or contributing.
                Your support is the only thing keeping the servers running and allowing me to build even
                better tools for you.
              </p>
            </div>

            <p className="bbc-serif text-[22px] italic leading-snug text-[var(--color-ink)]">
              "Whatever you decide to do in life, I hope this tool helps you get there. Wish you all the
              best, mate."
            </p>

            <div className="pt-2">
              <p className="bbc-serif text-[19px] text-[var(--color-ink)]">— Divyanshu Singh</p>
              <p className="bbc-eyebrow mt-1 text-[var(--color-blue-ink)]">Founder &amp; Developer</p>
            </div>
          </div>

          <div className="about-content mt-12 border-t border-[var(--color-line)] pt-10">
            <button
              onClick={() => onNavigate("study-material-page")}
              className="bbc-btn bbc-btn-primary px-[26px] py-[14px] text-[16px]"
            >
              Explore study material
            </button>
          </div>
        </div>

        {/* FAQs */}
        <div className="faq-section mx-auto mt-32 max-w-3xl">
          <div className="mb-14 text-center">
            <p className="bbc-eyebrow">FAQ</p>
            <h2 className="bbc-serif mt-3 text-[clamp(30px,4vw,46px)] tracking-[-.02em]">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-[16px] text-[var(--color-ink-soft)]">
              Everything you need to know about the platform.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="faq-item group overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer select-none items-center justify-between gap-4 p-6 text-[18px] font-semibold text-[var(--color-ink)]">
                  {item.q}
                  <span className="rounded-full border border-[var(--color-line)] p-1.5 text-[var(--color-ink-faint)] transition-transform duration-300 group-open:-rotate-180">
                    <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="border-t border-[var(--color-line)] p-6 text-[16px] leading-relaxed text-[var(--color-ink-soft)]">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
