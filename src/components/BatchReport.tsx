"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Copy, Check, Users, Gauge, BarChart3 } from "lucide-react";
import type { BatchReport as BatchReportData } from "../lib/batchReport";

// Institute-facing batch weak-topic report. Enter your code, share the
// diagnostic link with your batch, and watch the aggregate weak-topic map
// fill in — the "62% of your batch is weak in Mechanics" demo weapon.

export const BatchReport: React.FC = () => {
  const [code, setCode] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [data, setData] = useState<BatchReportData | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = active && typeof window !== "undefined"
    ? `${window.location.origin}/diagnostic?inst=${active}`
    : "";

  const load = async (raw: string) => {
    const c = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (c.length < 2) { setError("Enter a code with at least 2 letters/numbers."); return; }
    setBusy(true); setError(null); setData(null); setActive(c);
    try {
      const resp = await fetch(`/api/institute/batch-report?inst=${encodeURIComponent(c)}`);
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || "Could not load the report.");
      setData(json.report);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  // Deep-link support: /for-institutes/batch-report?inst=xyz loads immediately.
  useEffect(() => {
    const inst = new URLSearchParams(window.location.search).get("inst");
    if (inst) { setCode(inst); load(inst); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copy = () => {
    if (!shareUrl) return;
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const field = "w-full rounded-xl border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-[14px] outline-none focus:border-[var(--color-blue-ink)]";

  return (
    <div className="bbc relative min-h-screen overflow-hidden">
      <div className="bbc-grid" aria-hidden="true" />
      <div className="relative z-[2] mx-auto max-w-[820px] px-7 py-16">
        <div className="text-center">
          <p className="bbc-eyebrow">For institutes · Batch insights</p>
          <h1 className="bbc-serif mx-auto mt-3 max-w-[20ch] text-[clamp(30px,4.2vw,48px)] leading-[1.06] tracking-[-.02em]">
            See exactly where your batch is weak.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-[var(--color-ink-soft)]">
            Pick a code, share the diagnostic link with your students, and this page fills in with your batch's weakest topics — ranked. Two minutes per student, no signup for them.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">Your institute code</span>
            <div className="flex gap-2">
              <input
                className={field}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load(code)}
                placeholder="e.g. aurous-physics"
              />
              <button onClick={() => load(code)} disabled={busy} className="bbc-btn bbc-btn-primary shrink-0 px-5 text-[14px] disabled:opacity-60">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load report"}
              </button>
            </div>
            <span className="text-[11.5px] text-[var(--color-ink-faint)]">Any short name you like — students never see it. Use the same code to check back anytime.</span>
          </label>

          {active && shareUrl && (
            <div className="mt-4 flex flex-col gap-1.5">
              <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">Share this with your batch</span>
              <div className="flex gap-2">
                <input readOnly value={shareUrl} className={`${field} text-[var(--color-ink-soft)]`} onFocus={(e) => e.currentTarget.select()} />
                <button onClick={copy} className="bbc-btn bbc-btn-ghost shrink-0 px-4 text-[13px]">
                  {copied ? <><Check className="h-4 w-4 text-[var(--color-blue-ink)]" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-5 text-center text-[14px] text-[var(--color-ink-soft)]">
            {error}
          </div>
        )}

        {data && !error && (
          data.count === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-line-strong)] bg-[var(--color-paper-card)] p-8 text-center">
              <p className="bbc-serif text-[20px] tracking-[-.01em]">No results yet.</p>
              <p className="mt-1.5 text-[13.5px] text-[var(--color-ink-soft)]">Share the link above with your batch — this fills in the moment students finish.</p>
            </div>
          ) : (
            <div className="mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-5">
                  <div className="flex items-center gap-2 text-[var(--color-ink-soft)]"><Users className="h-4 w-4" /><span className="bbc-eyebrow text-[10px]">Students</span></div>
                  <p className="bbc-serif mt-1.5 text-[30px] tracking-[-.01em]">{data.count}</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-5">
                  <div className="flex items-center gap-2 text-[var(--color-ink-soft)]"><Gauge className="h-4 w-4" /><span className="bbc-eyebrow text-[10px]">Avg readiness</span></div>
                  <p className="bbc-serif mt-1.5 text-[30px] tracking-[-.01em]">{data.avgReadiness}%</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6">
                <div className="mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[var(--color-blue-ink)]" /><h2 className="text-[15px] font-bold text-[var(--color-ink)]">Weakest topics across the batch</h2></div>
                <div className="flex flex-col gap-4">
                  {data.topics.map((t) => (
                    <div key={t.topic}>
                      <div className="flex items-baseline justify-between text-[13.5px]">
                        <span className="font-semibold text-[var(--color-ink)]">{t.topic}{t.subject ? <span className="ml-2 text-[11.5px] font-normal text-[var(--color-ink-faint)]">{t.subject}</span> : null}</span>
                        <span className="font-bold text-[var(--color-blue-ink)]">{t.weakPct}% weak</span>
                      </div>
                      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
                        <div className="h-full rounded-full bg-[var(--color-blue-ink)]" style={{ width: `${t.weakPct}%` }} />
                      </div>
                      <p className="mt-1 text-[11.5px] text-[var(--color-ink-faint)]">{t.weakCount} of {t.studentsAnswered} students below the bar · {t.avgAccuracy}% avg accuracy</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-6 text-center text-[12.5px] text-[var(--color-ink-faint)]">
                Want per-student maps, white-label mocks for these exact topics, and this across every batch?{" "}
                <a href="/for-institutes" className="font-semibold text-[var(--color-blue-ink)] hover:underline">Book a 15-min demo →</a>
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
