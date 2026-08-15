import React from "react";
import Link from "next/link";
import { Home, Wrench, BookOpen, Layers } from "lucide-react";

export const metadata = {
  title: "Page not found · BlueBottleCap",
  robots: { index: false, follow: true },
};

// Branded 404, in the editorial design system (same tokens as the landing and
// product) rather than the earlier off-brand slate styling.

export default function NotFound() {
  return (
    <div className="bbc relative min-h-screen overflow-hidden">
      <div className="bbc-grid" aria-hidden="true" />
      <div className="relative z-[2] mx-auto flex min-h-screen max-w-[560px] flex-col items-center justify-center px-7 text-center">
        <p className="bbc-serif select-none text-[clamp(96px,20vw,180px)] font-semibold leading-none tracking-[-.04em] text-[var(--color-line-strong)]">
          404
        </p>
        <p className="bbc-eyebrow mt-2">Page not found</p>
        <h1 className="bbc-serif mt-3 text-[clamp(26px,3.6vw,40px)] leading-[1.1] tracking-[-.02em]">
          This page doesn&apos;t exist.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
          It may have moved or never existed. Head back to the working parts of BlueBottleCap.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="bbc-btn bbc-btn-primary inline-flex items-center gap-2 px-6 py-3 text-[15px]">
            <Home className="h-4 w-4" /> Home
          </Link>
          <Link href="/tools" className="bbc-btn bbc-btn-ghost inline-flex items-center gap-2 px-6 py-3 text-[15px]">
            <Wrench className="h-4 w-4" /> Tools
          </Link>
          <Link href="/mock-test" className="bbc-btn bbc-btn-ghost inline-flex items-center gap-2 px-6 py-3 text-[15px]">
            <Layers className="h-4 w-4" /> Mocks
          </Link>
          <Link href="/blog" className="bbc-btn bbc-btn-ghost inline-flex items-center gap-2 px-6 py-3 text-[15px]">
            <BookOpen className="h-4 w-4" /> Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
