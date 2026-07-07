"use client";

/**
 * Hero3D — dark, Apple-style product showcase for the landing page.
 *
 * Full-bleed dark section with the Three.js scene (lazy-loaded, no SSR)
 * behind Framer-Motion-staggered copy. Falls back to a static gradient +
 * glow while the scene chunk loads, and skips the canvas entirely for
 * prefers-reduced-motion users, so it never blocks first paint.
 */

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const HeroScene = dynamic(() => import("./three/HeroScene"), {
  ssr: false,
  loading: () => null,
});

const STATS = [
  { value: "290+", label: "Practice questions" },
  { value: "27", label: "Full mock tests" },
  { value: "100%", label: "In your browser" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.15 * i, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export function Hero3D({ onCta }: { onCta?: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });
  const reducedMotion = useReducedMotion();
  // Mount the canvas only when the section is near the viewport so the
  // three.js chunk never competes with above-the-fold content.
  const [canvasReady, setCanvasReady] = useState(false);
  useEffect(() => {
    if (inView) setCanvasReady(true);
  }, [inView]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-[#0A0B10] text-white"
      aria-label="BlueBottleCap product showcase"
    >
      {/* Ambient glows behind everything */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-[-20%] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[#1B3FCB] opacity-[0.16] blur-[140px]" />
        <div className="absolute bottom-[-30%] right-[-10%] h-[420px] w-[420px] rounded-full bg-[#122A8A] opacity-[0.22] blur-[120px]" />
      </div>

      {/* 3D scene */}
      <div className="absolute inset-0" aria-hidden="true">
        {canvasReady && !reducedMotion && <HeroScene />}
        {/* Vignette so copy stays legible over the scene */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0A0B10_88%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[92vh] max-w-[1100px] flex-col items-center justify-center px-7 py-28 text-center">
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate={inView ? "show" : "hidden"}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[12px] font-semibold tracking-[0.14em] uppercase text-[#8DA4FF] backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered exam prep
          </span>
        </motion.div>

        <motion.h2
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="bbc-serif mt-8 max-w-[16ch] text-[clamp(38px,6vw,72px)] leading-[1.04] tracking-[-.03em]"
        >
          Your syllabus,
          <br />
          <span className="bg-gradient-to-r from-[#6B8AFF] via-[#8DA4FF] to-[#6B8AFF] bg-clip-text text-transparent">
            distilled to light.
          </span>
        </motion.h2>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="mt-6 max-w-[46ch] text-[16px] leading-relaxed text-white/55"
        >
          Mock tests, flashcards, and AI file tools that live entirely in your
          browser. Built for JEE &amp; NEET aspirants who&apos;d rather study than
          set things up.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <button
            onClick={onCta}
            className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-[15px] font-bold text-[#0A0B10] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
          >
            Start free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <span className="text-[13px] text-white/35">No signup · no card · instant</span>
        </motion.div>

        <motion.dl
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="mt-20 grid w-full max-w-[640px] grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] backdrop-blur-sm"
        >
          {STATS.map((s) => (
            <div key={s.label} className="bg-[#0A0B10]/80 px-4 py-6">
              <dt className="sr-only">{s.label}</dt>
              <dd className="bbc-serif text-[clamp(22px,3vw,32px)] text-white">{s.value}</dd>
              <dd className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">{s.label}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
