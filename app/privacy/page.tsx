"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, Lock, Database, Mail, Cookie, UserX } from "lucide-react";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="bbc relative min-h-screen overflow-hidden">
      <div className="bbc-grid" aria-hidden="true" />

      <div className="relative z-[2] mx-auto max-w-[860px] px-7 pt-16 pb-28">
        <button
          onClick={() => router.push("/")}
          className="group mb-10 inline-flex items-center gap-2 text-[14px] text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to app
        </button>

        {/* Header */}
        <div className="mb-12">
          <p className="bbc-eyebrow flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-[var(--color-blue-ink)]" /> Legal
          </p>
          <h1 className="bbc-serif mt-[18px] text-[clamp(34px,5vw,56px)] leading-[1.04] tracking-[-.02em]">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[var(--color-ink-soft)]">
            Your privacy matters. This page explains what data BlueBottleCap collects, why we collect
            it, and what we do (and never do) with it.
          </p>
          <p className="bbc-mono mt-3 text-[12.5px] text-[var(--color-ink-faint)]">
            Last updated: 19 July 2026
          </p>
        </div>

        <div className="space-y-10 text-[16px] leading-relaxed text-[var(--color-ink-soft)]">
          {/* Summary card */}
          <section className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-blue-wash)] p-6">
            <span className="absolute left-0 top-0 h-full w-1 bg-[var(--color-blue-ink)]" />
            <h2 className="bbc-serif mb-2 text-[20px] tracking-[-.01em] text-[var(--color-ink)]">
              The short version
            </h2>
            <ul className="list-disc space-y-1.5 pl-5 text-[15px]">
              <li>We collect only what we need to run the product: your account details and study activity.</li>
              <li>Files you process with our browser tools <strong className="text-[var(--color-ink)]">never leave your device</strong>.</li>
              <li>Payments are handled by Razorpay — we never see or store your card or UPI details.</li>
              <li>We never sell your data. Ever.</li>
              <li>You can ask us to delete your account and data at any time.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="bbc-serif flex items-center gap-2.5 text-[24px] tracking-[-.01em] text-[var(--color-ink)]">
              <Database className="h-5 w-5 text-[var(--color-blue-ink)]" /> What we collect
            </h2>
            <p>
              <strong className="text-[var(--color-ink)]">Account information.</strong> When you sign up, we
              store your name, email address, and profile avatar via Firebase Authentication (a Google
              service). If you sign in with Google, we receive the basic profile information you approve.
            </p>
            <p>
              <strong className="text-[var(--color-ink)]">Study activity.</strong> Mock test attempts,
              scores, flashcard progress, study streaks, and preferences are stored so your dashboard
              and progress tracking work across devices.
            </p>
            <p>
              <strong className="text-[var(--color-ink)]">Usage analytics.</strong> We collect anonymous,
              aggregated events (e.g. which tools are used most) to improve the product. These are not
              tied to your identity for advertising.
            </p>
            <p>
              <strong className="text-[var(--color-ink)]">Local data.</strong> Some preferences (language,
              dismissed banners, tool usage counts) are stored in your browser&apos;s localStorage and
              never reach our servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="bbc-serif flex items-center gap-2.5 text-[24px] tracking-[-.01em] text-[var(--color-ink)]">
              <Lock className="h-5 w-5 text-[var(--color-blue-ink)]" /> What we never collect
            </h2>
            <p>
              Files you convert, compress, merge, or split with our file tools are processed{" "}
              <strong className="text-[var(--color-ink)]">entirely in your browser</strong> — they are
              never uploaded to our servers.
            </p>
            <p>
              Payment card numbers, UPI IDs, and banking details are handled directly by{" "}
              <strong className="text-[var(--color-ink)]">Razorpay</strong>, our PCI-DSS-compliant payment
              processor. We only receive a confirmation that a payment succeeded, along with a
              transaction reference.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="bbc-serif flex items-center gap-2.5 text-[24px] tracking-[-.01em] text-[var(--color-ink)]">
              <Cookie className="h-5 w-5 text-[var(--color-blue-ink)]" /> Cookies &amp; third parties
            </h2>
            <p>
              We use cookies and similar technologies only for authentication (keeping you signed in)
              and basic analytics. We work with these third-party services:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li><strong className="text-[var(--color-ink)]">Firebase / Google Cloud</strong> — authentication and database hosting.</li>
              <li><strong className="text-[var(--color-ink)]">Razorpay</strong> — payment processing.</li>
              <li><strong className="text-[var(--color-ink)]">Vercel</strong> — website hosting and edge network.</li>
            </ul>
            <p>
              Each of these providers has its own privacy policy governing how they handle data on our
              behalf.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="bbc-serif flex items-center gap-2.5 text-[24px] tracking-[-.01em] text-[var(--color-ink)]">
              <UserX className="h-5 w-5 text-[var(--color-blue-ink)]" /> Your rights
            </h2>
            <p>
              In line with India&apos;s Digital Personal Data Protection Act (DPDP Act, 2023), you can:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Request a copy of the personal data we hold about you.</li>
              <li>Ask us to correct inaccurate data.</li>
              <li>Ask us to delete your account and associated data.</li>
              <li>Withdraw consent for optional data processing at any time.</li>
            </ul>
            <p>
              To exercise any of these rights, email us — we respond within 7 working days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="bbc-serif flex items-center gap-2.5 text-[24px] tracking-[-.01em] text-[var(--color-ink)]">
              <Mail className="h-5 w-5 text-[var(--color-blue-ink)]" /> Contact
            </h2>
            <p>
              Questions about this policy or your data? Reach us at{" "}
              <a
                href="mailto:support@bluebottlecap.com"
                className="font-semibold text-[var(--color-blue-ink)] underline-offset-2 hover:underline"
              >
                support@bluebottlecap.com
              </a>
              .
            </p>
            <p>
              We may update this policy as the product evolves. Material changes will be announced on
              this page with a new &quot;last updated&quot; date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
