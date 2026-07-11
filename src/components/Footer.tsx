"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bbc border-t border-[var(--color-line)] bg-[var(--color-paper)] px-6 py-16 md:px-12 lg:px-20">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-14 grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-12">
          {/* Brand */}
          <div className="max-w-sm space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-blue-ink)]">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <span className="bbc-serif text-[19px] tracking-[-.01em] text-[var(--color-ink)]">
                BlueBottleCap
              </span>
            </div>
            <p className="text-[14px] leading-relaxed text-[var(--color-ink-soft)]">
              AI-powered exam prep for JEE, B.Tech, and engineering — for
              Indian students and the coaching institutes that teach them.
              Upload notes, chat with an AI co-pilot, or run branded mock
              tests at your institute.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[12px] text-[var(--color-ink-faint)]">
              <Shield className="h-3.5 w-3.5 text-[var(--color-blue-ink)]" />
              <span>Secure payments via Razorpay. 100% money-back within 7 days.</span>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="bbc-eyebrow mb-2">Product</h4>
            <ul className="space-y-3 text-[14px]">
              <li>
                <Link href="/pdf-editor" className="inline-flex items-center gap-1.5 text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]">
                  <Sparkles className="h-3 w-3 text-[var(--color-blue-ink)]" /> PDF Copilot
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]">File Tools</Link>
              </li>
              <li>
                <Link href="/for-institutes" className="text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]">For institutes →</Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]">Dashboard</Link>
              </li>
              <li>
                <Link href="/about" className="text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]">About us</Link>
              </li>
              <li>
                <Link href="/terms" className="text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]">Terms &amp; Conditions</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="bbc-eyebrow mb-2">Support</h4>
            <ul className="space-y-3 text-[14px]">
              <li>
                <a href="mailto:support@bluebottlecap.com" className="inline-flex items-center gap-1.5 text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]">
                  <Mail className="h-3 w-3 text-[var(--color-ink-faint)]" /> support@bluebottlecap.com
                </a>
              </li>
              <li>
                <Link href="/refunds" className="text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]">Refund policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]">Privacy policy</Link>
              </li>
              <li className="flex items-center gap-1.5 pt-1 text-[12px] text-[var(--color-ink-faint)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-blue-ink)]" />
                Early access — actively improving
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--color-line)] pt-8 text-[12.5px] text-[var(--color-ink-faint)] md:flex-row">
          <p className="bbc-mono">© {new Date().getFullYear()} BlueBottleCap · Made in India 🇮🇳</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/terms" className="transition hover:text-[var(--color-ink)]">Terms &amp; Conditions</Link>
            <a href="mailto:support@bluebottlecap.com" className="transition hover:text-[var(--color-ink)]">Contact us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
