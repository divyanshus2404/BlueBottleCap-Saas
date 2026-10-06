"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { CreditCostBadge } from "./CreditCostBadge";
import {
  Check,
  ClipboardCopy,
  Download,
  Loader2,
  Printer,
  RotateCw,
  Sparkles,
  Share2,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import Link from "next/link";

const EXAM_OPTIONS = ["JEE", "GATE", "B.Tech", "NEET", "Board Exams"] as const;

const QUICK_TOPICS = [
  "Thermodynamics",
  "Integration",
  "Matrices & Determinants",
  "Electromagnetic Induction",
  "Organic Chemistry — Named Reactions",
  "Digital Logic Gates",
  "Kinematics",
  "Probability & Statistics",
  "Complex Numbers",
  "Newton's Laws",
  "Chemical Bonding",
  "Data Structures — Time Complexity",
];

function renderMarkdown(md: string): React.ReactNode {
  const blocks = md.split(/\n{2,}/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("# ")) {
      return (
        <h1 key={i} className="bbc-serif mt-6 text-[26px] tracking-[-.01em] text-[var(--color-ink)]">
          {trimmed.slice(2)}
        </h1>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={i} className="bbc-serif mt-5 text-[18px] tracking-[-.01em] text-[var(--color-ink)]">
          {trimmed.slice(3)}
        </h2>
      );
    }
    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={i} className="mt-4 text-[15px] font-bold text-[var(--color-ink)]">
          {trimmed.slice(4)}
        </h3>
      );
    }
    if (trimmed.startsWith("> ")) {
      return (
        <p key={i} className="my-3 border-l-2 border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)]/60 px-3 py-1 text-[13.5px] italic text-[var(--color-ink-soft)]">
          {trimmed.slice(2)}
        </p>
      );
    }

    const lines = trimmed.split("\n");
    if (lines.every((l) => l.trim().startsWith("- "))) {
      return (
        <ul key={i} className="my-2 list-disc space-y-1 pl-5 text-[14px] leading-[1.6] text-[var(--color-ink)]">
          {lines.map((l, j) => (
            <li key={j}>{renderInline(l.replace(/^\s*-\s*/, ""))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={i} className="my-2 text-[14px] leading-[1.6] text-[var(--color-ink)]">
        {renderInline(trimmed)}
      </p>
    );
  });
}

function renderInline(s: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\$\$[^$]+\$\$|\$[^$]+\$)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = regex.exec(s)) !== null) {
    if (m.index > last) parts.push(s.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      parts.push(<strong key={idx++}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("$$")) {
      parts.push(
        <code key={idx++} className="my-1 block rounded bg-[var(--color-blue-wash)] px-2 py-1 text-[13px] text-[var(--color-blue-ink)]">
          {tok.slice(2, -2)}
        </code>,
      );
    } else if (tok.startsWith("$")) {
      parts.push(
        <code key={idx++} className="rounded bg-[var(--color-blue-wash)] px-1 text-[13px] text-[var(--color-blue-ink)]">
          {tok.slice(1, -1)}
        </code>,
      );
    } else {
      parts.push(
        <code key={idx++} className="rounded bg-[var(--color-paper-card)] px-1 text-[13px]">
          {tok.slice(1, -1)}
        </code>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < s.length) parts.push(s.slice(last));
  return parts;
}

export const FormulaSheet: React.FC = () => {
  const { currentUser } = useAuth();
  const [topic, setTopic] = useState("");
  const [exam, setExam] = useState<string>("JEE");
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isPro = Boolean(currentUser);

  const generate = useCallback(async (topicOverride?: string) => {
    const t = (topicOverride || topic).trim();
    if (!t) return;

    setTopic(t);
    setMarkdown(null);
    setErrMsg(null);
    setStatus("generating");
    setProgress("Analyzing topic…");

    try {
      setProgress("Generating formula sheet…");
      const res = await fetch("/api/gemini/formula-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t, exam }),
      });

      const data = (await res.json()) as { markdown?: string; error?: string };
      if (!res.ok || !data.markdown) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      setProgress("Formatting…");
      await new Promise((r) => setTimeout(r, 200));

      setMarkdown(data.markdown);
      setStatus("done");
    } catch (err) {
      console.error("[formula-sheet] error:", err);
      setStatus("error");
      setErrMsg(err instanceof Error ? err.message : "Could not generate the formula sheet.");
    }
  }, [topic, exam]);

  const reset = () => {
    setMarkdown(null);
    setStatus("idle");
    setErrMsg(null);
    setCopied(false);
    setProgress("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const copyMarkdown = async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  // Declared before the handlers that close over it — defining it after them
  // is valid JS but stops the React Compiler from memoizing this component.
  const heading = useMemo(() => {
    if (!markdown) return "Formula Sheet";
    const m = markdown.match(/^#\s+(.+)$/m);
    return m ? m[1] : "Formula Sheet";
  }, [markdown]);

  const downloadMarkdown = () => {
    if (!markdown) return;
    const slug = topic.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "-").toLowerCase() || "formula-sheet";
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-formulas.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareSheet = async () => {
    if (!markdown) return;
    const title = heading;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: markdown });
      } catch { /* cancelled */ }
    } else {
      copyMarkdown();
    }
  };

  return (
    <div className="bbc mx-auto max-w-[1280px] px-7 py-10 md:py-14">
      {/* Header */}
      <div className="print:hidden">
        <p className="bbc-eyebrow">Formula sheets</p>
        <h1 className="bbc-serif mt-3 text-[clamp(28px,4vw,42px)] leading-[1.08] tracking-[-.02em]">
          One-page formula sheet for any topic. Exam-ready in seconds.
        </h1>
        <p className="mt-3 max-w-[60ch] text-[15px] text-[var(--color-ink-soft)]">
          Type a chapter or topic. The AI generates a dense, printable cheat sheet with every
          formula, shortcut, and common mistake — tuned for Indian engineering exams.
        </p>
      </div>

      {/* Input state */}
      {status !== "done" && (
        <div className="print:hidden mt-8">
          {/* Topic input */}
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6">
            <label className="bbc-mono text-[10.5px] uppercase tracking-[.14em] text-[var(--color-ink-faint)]">
              Topic or chapter name
            </label>
            <div className="mt-2 flex gap-2">
              <input
                ref={inputRef}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
                placeholder="e.g., Thermodynamics, Integration, Digital Logic…"
                className="flex-1 rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 text-[15px] outline-none placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-blue-ink)]"
                disabled={status === "generating"}
              />
              <button
                onClick={() => generate()}
                disabled={!topic.trim() || status === "generating"}
                className="bbc-btn bbc-btn-primary flex items-center gap-2 px-6 py-3 text-[14px] disabled:opacity-50"
              >
                {status === "generating" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {status === "generating" ? "Generating…" : "Generate"}
              </button>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[var(--color-ink-soft)]">
              <CreditCostBadge resourceId="formula_sheet" /> per sheet
            </div>

            {/* Exam selector */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[12px] text-[var(--color-ink-faint)]">Tuned for:</span>
              {EXAM_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setExam(e)}
                  className={`rounded-full border px-3 py-1 text-[12px] font-semibold transition ${
                    exam === e
                      ? "border-[var(--color-blue-ink)] bg-[var(--color-blue-ink)] text-white"
                      : "border-[var(--color-line)] bg-white text-[var(--color-ink-soft)] hover:border-[var(--color-line-strong)]"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Quick topics */}
          <div className="mt-4">
            <p className="text-[12px] text-[var(--color-ink-faint)]">Popular topics:</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => { setTopic(t); generate(t); }}
                  disabled={status === "generating"}
                  className="rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-card)] px-3 py-1.5 text-[12.5px] text-[var(--color-ink-soft)] transition hover:border-[var(--color-blue-ink)] hover:text-[var(--color-blue-ink)] disabled:opacity-50"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          {status === "generating" && (
            <div className="mt-6 flex flex-col items-center gap-3 py-4 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-blue-ink)]" />
              <span className="text-[14px] text-[var(--color-ink-soft)]">{progress}</span>
              <div className="h-1 w-48 overflow-hidden rounded-full bg-[var(--color-line)]">
                <div className="h-full animate-pulse rounded-full bg-[var(--color-blue-ink)]" style={{ width: "65%" }} />
              </div>
            </div>
          )}

          {/* Error */}
          {errMsg && status === "error" && (
            <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-[13.5px] text-orange-800">
              {errMsg}
              <button onClick={reset} className="ml-3 underline">
                Try again
              </button>
            </div>
          )}

          {/* Auth gate */}
          {!isPro && (
            <div className="mt-6 rounded-xl border border-[var(--color-line)] bg-[var(--color-blue-wash)] p-4 text-center text-[13px] text-[var(--color-ink-soft)]">
              <Link href="/signup" className="font-bold text-[var(--color-blue-ink)] hover:underline">
                Sign in
              </Link>
              {" "}to generate formula sheets — it&apos;s free.
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {status === "done" && markdown && (
        <div className="mt-8">
          {/* Actions bar */}
          <div className="print:hidden mb-4 flex flex-wrap items-center gap-2">
            <button onClick={reset} className="bbc-btn bbc-btn-ghost px-3 py-1.5 text-[12px]">
              <RotateCw className="h-3.5 w-3.5" />
              New sheet
            </button>
            <button onClick={copyMarkdown} className="bbc-btn bbc-btn-ghost px-3 py-1.5 text-[12px]">
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={downloadMarkdown} className="bbc-btn bbc-btn-ghost px-3 py-1.5 text-[12px]">
              <Download className="h-3.5 w-3.5" />
              Download .md
            </button>
            <button onClick={shareSheet} className="bbc-btn bbc-btn-ghost px-3 py-1.5 text-[12px]">
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
            <button onClick={() => window.print()} className="bbc-btn bbc-btn-primary ml-auto px-3 py-1.5 text-[12px]">
              <Printer className="h-3.5 w-3.5" />
              Print / Save PDF
            </button>
          </div>

          {/* Sheet content */}
          <div
            id="formula-sheet-result"
            className="rounded-xl border border-[var(--color-line)] bg-white p-8 print:border-none print:p-0"
          >
            <div className="prose-tight">{renderMarkdown(markdown)}</div>
            <p className="mt-8 border-t border-[var(--color-line)] pt-3 text-center text-[10px] uppercase tracking-[.16em] text-[var(--color-ink-faint)] print:mt-6">
              Generated by BlueBottleCap · bluebottlecap.com
            </p>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white; }
          @page { margin: 14mm; }
        }
      `}</style>
    </div>
  );
};
