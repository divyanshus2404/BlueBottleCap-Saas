"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CreditCostBadge } from "./CreditCostBadge";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  ClipboardCopy,
  Download,
  Loader2,
  Printer,
  RotateCw,
  Sparkles,
  Upload,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { preprocessForOcr } from "@/src/lib/imagePreprocess";

const QUOTA_KEY = "bluebottlecap_scan_notes_log";
const FREE_SCANS_PER_WEEK = 3;

function loadLog(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUOTA_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveLog(iso: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUOTA_KEY, JSON.stringify(iso));
  } catch {
    /* best effort */
  }
}

function recentScans(log: string[]): number {
  const weekAgo = Date.now() - 7 * 86_400_000;
  return log.filter((iso) => {
    const t = new Date(iso).getTime();
    return Number.isFinite(t) && t >= weekAgo;
  }).length;
}

function renderMarkdown(md: string): React.ReactNode {
  const blocks = md.split(/\n{2,}/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("# ")) {
      return (
        <h1 key={i} className="bbc-serif mt-6 text-[28px] tracking-[-.01em] text-[var(--color-ink)]">
          {trimmed.slice(2)}
        </h1>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={i} className="bbc-serif mt-6 text-[20px] tracking-[-.01em] text-[var(--color-ink)]">
          {trimmed.slice(3)}
        </h2>
      );
    }
    if (trimmed.startsWith("> ")) {
      return (
        <p key={i} className="my-3 border-l-2 border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)]/60 px-3 py-1 text-[14px] italic text-[var(--color-ink-soft)]">
          {trimmed.slice(2)}
        </p>
      );
    }

    const lines = trimmed.split("\n");
    if (lines.every((l) => l.trim().startsWith("- "))) {
      return (
        <ul key={i} className="my-3 list-disc space-y-1.5 pl-5 text-[14.5px] text-[var(--color-ink)]">
          {lines.map((l, j) => (
            <li key={j}>{renderInline(l.replace(/^\s*-\s*/, ""))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={i} className="my-3 text-[14.5px] leading-[1.65] text-[var(--color-ink)]">
        {renderInline(trimmed)}
      </p>
    );
  });
}

function renderInline(s: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = regex.exec(s)) !== null) {
    if (m.index > last) parts.push(s.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      parts.push(<strong key={idx++}>{tok.slice(2, -2)}</strong>);
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

export const NotesScanner: React.FC = () => {
  const { currentUser } = useAuth();
  const [preview, setPreview] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [scanProgress, setScanProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => setLog(loadLog()), []);

  const used = recentScans(log);
  const isPro = Boolean(currentUser);
  const remaining = isPro ? Infinity : Math.max(0, FREE_SCANS_PER_WEEK - used);
  const canScan = isPro || remaining > 0;

  const pickFile = () => fileInputRef.current?.click();
  const openCamera = () => cameraInputRef.current?.click();

  const processFile = useCallback(
    async (file: File) => {
      if (!canScan) {
        setStatus("error");
        setErrMsg("You've used your 3 free scans this week. Sign up to get unlimited.");
        return;
      }

      const allowed = ["image/png", "image/jpeg", "image/webp", "image/heic"];
      if (!allowed.includes(file.type)) {
        setStatus("error");
        setErrMsg("Use PNG, JPEG, WebP, or HEIC images only.");
        return;
      }

      if (file.size > 6 * 1024 * 1024) {
        setStatus("error");
        setErrMsg("Image is larger than 6 MB. Compress or crop and try again.");
        return;
      }

      const url = URL.createObjectURL(file);
      setPreview(url);
      setMarkdown(null);
      setErrMsg(null);
      setStatus("scanning");
      setScanProgress("Enhancing image for OCR…");

      try {
        const processed = await preprocessForOcr(file);

        const fd = new FormData();
        fd.append("image", processed);

        setScanProgress("Reading handwriting…");
        const res = await fetch("/api/scan-notes", { method: "POST", body: fd });
        const data = (await res.json()) as { markdown?: string; error?: string };

        if (!res.ok || !data.markdown) {
          throw new Error(data.error || `Request failed (${res.status})`);
        }

        setScanProgress("Formatting notes…");
        await new Promise((r) => setTimeout(r, 300));

        setMarkdown(data.markdown);
        setStatus("done");

        if (!isPro) {
          const updated = [...log, new Date().toISOString()];
          setLog(updated);
          saveLog(updated);
        }
      } catch (err) {
        console.error("[scan-notes] error:", err);
        setStatus("error");
        setErrMsg(err instanceof Error ? err.message : "Could not scan that image.");
      }
    },
    [canScan, isPro, log],
  );

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    processFile(file);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) {
      setDragging(false);
    }
  }, []);

  const reset = () => {
    setPreview(null);
    setMarkdown(null);
    setStatus("idle");
    setErrMsg(null);
    setCopied(false);
    setScanProgress("");
  };

  const copyMarkdown = async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may not be available */
    }
  };

  // Declared before the handler that closes over it — defining it after
  // stops the React Compiler from memoizing this component.
  const heading = useMemo(() => {
    if (!markdown) return "Scanned notes";
    const m = markdown.match(/^#\s+(.+)$/m);
    return m ? m[1] : "Scanned notes";
  }, [markdown]);

  const downloadMarkdown = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${heading.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "-").toLowerCase() || "notes"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bbc mx-auto max-w-[920px] px-7 py-10 md:py-14">
      {/* Header */}
      <div className="print:hidden">
        <p className="bbc-eyebrow">Notes scanner · beta</p>
        <h1 className="bbc-serif mt-3 text-[clamp(28px,4vw,42px)] leading-[1.08] tracking-[-.02em]">
          Photo of handwritten notes → typed, searchable, study-ready.
        </h1>
        <p className="mt-3 max-w-[60ch] text-[15px] text-[var(--color-ink-soft)]">
          Snap a page of your friend&apos;s notes or your own. The AI reads the handwriting,
          types it out, and keeps equations and headings intact. Free users get 3 scans a week.
        </p>
      </div>

      {/* Empty state — drop zone */}
      {!preview && (
        <div
          ref={dropRef}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`print:hidden mt-8 rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
            dragging
              ? "border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)]"
              : "border-[var(--color-line-strong)] bg-[var(--color-paper-card)]"
          }`}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]">
            <Camera className="h-7 w-7" />
          </div>
          <h2 className="bbc-serif mt-5 text-[20px]">
            {dragging ? "Drop your image here" : "Drop a photo or tap to upload"}
          </h2>
          <p className="mt-1 text-[13px] text-[var(--color-ink-soft)]">PNG, JPEG, WebP, or HEIC · up to 6 MB</p>

          <div className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={pickFile}
              disabled={!canScan}
              className="bbc-btn bbc-btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-[14px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              Upload photo
            </button>
            <button
              onClick={openCamera}
              disabled={!canScan}
              className="bbc-btn bbc-btn-ghost inline-flex items-center gap-2 px-5 py-2.5 text-[14px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
              Take photo
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11.5px] text-[var(--color-ink-faint)]">
            <CreditCostBadge resourceId="scan_notes" />
            <span>
              {isPro
                ? "Unlimited scans on your plan."
                : `${remaining} / ${FREE_SCANS_PER_WEEK} free scans left this week.`}
            </span>
          </div>

          {!canScan && (
            <Link
              href="/signup"
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-blue-ink)] hover:underline"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Sign up free for unlimited scans
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/heic"
            className="hidden"
            onChange={onFile}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onFile}
          />
        </div>
      )}

      {errMsg && status === "error" && (
        <div className="print:hidden mt-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-[13.5px] text-orange-800">
          {errMsg}
          <button onClick={reset} className="ml-3 underline">
            Try a different image
          </button>
        </div>
      )}

      {/* Preview + result */}
      {preview && (
        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1.2fr]">
          {/* Source image */}
          <div className="print:hidden">
            <p className="bbc-mono text-[10.5px] uppercase tracking-[.14em] text-[var(--color-ink-faint)]">
              Source
            </p>
            <div className="mt-2 overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
              <img src={preview} alt="Uploaded notes" className="block w-full" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={reset} className="bbc-btn bbc-btn-ghost px-3 py-1.5 text-[12px]">
                <RotateCw className="h-3.5 w-3.5" />
                Scan another
              </button>
              {status === "done" && (
                <>
                  <button
                    onClick={copyMarkdown}
                    className="bbc-btn bbc-btn-ghost px-3 py-1.5 text-[12px]"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <ClipboardCopy className="h-3.5 w-3.5" />
                    )}
                    {copied ? "Copied!" : "Copy text"}
                  </button>
                  <button
                    onClick={downloadMarkdown}
                    className="bbc-btn bbc-btn-ghost px-3 py-1.5 text-[12px]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download .md
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bbc-btn bbc-btn-primary px-3 py-1.5 text-[12px]"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Save as PDF
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Typed result */}
          <div>
            <p className="bbc-mono text-[10.5px] uppercase tracking-[.14em] text-[var(--color-ink-faint)] print:hidden">
              Typed result
            </p>
            <div
              id="scan-result"
              className="mt-2 rounded-xl border border-[var(--color-line)] bg-white p-6"
            >
              {status === "scanning" && (
                <div className="flex flex-col items-center gap-3 py-8 text-center text-[var(--color-ink-soft)]">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--color-blue-ink)]" />
                  <span className="text-[14px]">{scanProgress}</span>
                  <div className="mt-2 h-1 w-48 overflow-hidden rounded-full bg-[var(--color-line)]">
                    <div className="h-full animate-pulse rounded-full bg-[var(--color-blue-ink)]" style={{ width: "60%" }} />
                  </div>
                </div>
              )}
              {status === "done" && markdown && (
                <>
                  <div className="prose-tight">{renderMarkdown(markdown)}</div>
                  {!isPro && (
                    <p className="mt-8 border-t border-[var(--color-line)] pt-3 text-center text-[11px] uppercase tracking-[.16em] text-[var(--color-ink-faint)]">
                      Scanned with BlueBottleCap · bluebottlecap.com
                    </p>
                  )}
                </>
              )}
              {status === "error" && (
                <p className="text-[13.5px] text-[var(--color-ink-soft)]">
                  Couldn&apos;t read this image. Try a sharper, well-lit photo.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white; }
          @page { margin: 16mm; }
        }
      `}</style>
    </div>
  );
};
