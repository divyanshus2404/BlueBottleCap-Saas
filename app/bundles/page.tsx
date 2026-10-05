import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Exam packs · BlueBottleCap",
  description:
    "One-off exam preparation packs — chapter-wise mocks, worked solutions and weak-topic maps. No subscription.",
};

/**
 * Index for /bundles.
 *
 * The JEE 2026 pack at /bundles/jee-2026 shipped fully built — pricing, FAQs,
 * checkout — but /bundles itself 404'd and nothing in the app linked to either,
 * so a paid product was unreachable unless you typed the URL. Adding a bundle
 * means adding a row here.
 */
const BUNDLES = [
  {
    href: "/bundles/jee-2026",
    eyebrow: "JEE 2026",
    name: "Exam-cram pack",
    price: "₹149",
    blurb: "Ten chapter-wise JEE Main mocks tuned to your weak topics, with worked solutions and a weak-topic map after every paper.",
    points: [
      "10 full-length mocks · 30 questions, 60 min each",
      "Worked solutions, not just answer letters",
      "Per-mock weak-topic report",
      "Delivered within 24 hours",
    ],
  },
];

export default function BundlesPage() {
  return (
    <div className="bbc min-h-screen bg-white">
      <div className="mx-auto max-w-[1000px] px-6 py-16">
        <span className="inline-flex rounded-full bg-[var(--color-blue-wash)] px-3 py-1 text-[11.5px] font-bold uppercase tracking-[.12em] text-[var(--color-blue-ink)]">
          Exam packs
        </span>
        <h1 className="mt-4 text-[clamp(28px,3.6vw,42px)] font-bold leading-[1.1] tracking-[-.03em] text-[var(--color-ink)]">
          One-off packs. No subscription.
        </h1>
        <p className="mt-4 max-w-[52ch] text-[16.5px] leading-[1.6] text-[var(--color-ink-soft)]">
          Buy once, get the material. For students who want focused practice before a
          specific exam rather than an ongoing plan.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {BUNDLES.map((b) => (
            <Link
              key={b.href}
              href={b.href}
              className="group rounded-2xl border border-[var(--color-line)] bg-white p-7 transition duration-200 hover:-translate-y-1 hover:border-[var(--color-blue-ink)]/40 hover:shadow-[0_18px_40px_-24px_rgba(12,21,36,.35)]"
            >
              <p className="text-[11.5px] font-bold uppercase tracking-[.14em] text-[var(--color-ink-faint)]">
                {b.eyebrow}
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <h2 className="text-[20px] font-bold tracking-[-.02em] text-[var(--color-ink)]">{b.name}</h2>
                <span className="text-[22px] font-bold tracking-[-.02em] text-[var(--color-blue-ink)]">{b.price}</span>
              </div>
              <p className="mt-3 text-[14px] leading-[1.6] text-[var(--color-ink-soft)]">{b.blurb}</p>
              <ul className="mt-5 space-y-2">
                {b.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-[13.5px] leading-[1.5] text-[var(--color-ink-soft)]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-blue-ink)]" />
                    {p}
                  </li>
                ))}
              </ul>
              <span className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--color-blue-ink)]">
                See the pack
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-[13.5px] text-[var(--color-ink-faint)]">
          Looking for the ongoing plan instead?{" "}
          <Link href="/pricing" className="font-semibold text-[var(--color-blue-ink)] hover:underline">
            See pricing
          </Link>
        </p>
      </div>
    </div>
  );
}
