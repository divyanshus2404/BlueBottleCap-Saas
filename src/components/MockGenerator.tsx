"use client";

import React, { useEffect, useRef, useState } from "react";
import { FileText, Loader2, Upload, Download, CheckCircle2, Sparkles } from "lucide-react";
import { trackEvent } from "../lib/analytics";
import { WhatsAppShare } from "./WhatsAppShare";

const shareOrigin = typeof window !== "undefined" ? window.location.origin : "https://bluebottlecap.com";

// White-label mock generator — the self-serve demo for institutes. Fill in
// exam + chapters + branding, generate a branded PDF paper with answer key.
// Runs against /api/institute/generate-mock, which returns the PDF bytes.

const EXAMS = ["JEE Main 2027", "JEE Advanced 2027", "NEET 2027", "CUET 2027", "MHT-CET 2027"];
const SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Biology"];
const DIFFICULTIES = ["easy", "medium", "hard", "mixed"] as const;

export const MockGenerator: React.FC = () => {
  const [instituteName, setInstituteName] = useState("");
  const [exam, setExam] = useState(EXAMS[0]);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [chapters, setChapters] = useState("");
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>("mixed");
  const [count, setCount] = useState(10);
  const [brandHex, setBrandHex] = useState("#1B3FCB");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ url: string; name: string; questions: string | null } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Track the live blob URL so we can revoke it when the component unmounts.
  const doneUrlRef = useRef<string | null>(null);
  useEffect(() => () => { if (doneUrlRef.current) URL.revokeObjectURL(doneUrlRef.current); }, []);

  const onLogo = (file?: File) => {
    if (!file) return;
    if (file.size > 2_000_000) { setError("Logo must be under 2 MB."); return; }
    if (!/^image\/(png|jpe?g)$/.test(file.type)) { setError("Logo must be a PNG or JPG."); return; }
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    setError(null);
    if (!instituteName.trim()) { setError("Enter your institute's name — it goes on the paper."); return; }
    if (!chapters.trim()) { setError("List at least one chapter or topic."); return; }
    setBusy(true);
    setDone(null);
    trackEvent("mock_generate_started", { exam, subject, count });
    try {
      const resp = await fetch("/api/institute/generate-mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instituteName, exam, subject, chapters, difficulty, count, brandHex, logoDataUrl }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || "Could not generate the paper.");
      }
      const blob = await resp.blob();
      // Revoke the previous blob URL before replacing it — repeated
      // generations would otherwise leak object URLs for the session.
      setDone((prev) => { if (prev?.url) URL.revokeObjectURL(prev.url); return prev; });
      const url = URL.createObjectURL(blob);
      doneUrlRef.current = url;
      const name = `${instituteName}-${subject}-mock.pdf`.replace(/[^a-z0-9.\-]+/gi, "-").toLowerCase();
      setDone({ url, name, questions: resp.headers.get("X-Question-Count") });
      trackEvent("mock_generate_success", { exam, subject, count });
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
      trackEvent("mock_generate_failed", { exam, subject });
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full rounded-xl border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-[14px] outline-none focus:border-[var(--color-blue-ink)]";

  return (
    <div className="bbc relative min-h-screen overflow-hidden">
      <div className="bbc-grid" aria-hidden="true" />
      <div className="relative z-[2] mx-auto max-w-[880px] px-7 py-16">
        <div className="text-center">
          <p className="bbc-eyebrow">For institutes · White-label</p>
          <h1 className="bbc-serif mx-auto mt-3 max-w-[18ch] text-[clamp(30px,4.2vw,48px)] leading-[1.06] tracking-[-.02em]">
            Generate a branded mock paper in 30 seconds.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-[var(--color-ink-soft)]">
            Pick the exam and chapters. Our AI writes exam-pattern questions and renders a print-ready PDF — your name, your logo, your colour — with an answer key. No watermark.
          </p>
        </div>

        <div className="mt-10 grid gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">Institute name</span>
            <input className={field} value={instituteName} onChange={(e) => setInstituteName(e.target.value)} placeholder="e.g. Aurous Academy" />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">Exam</span>
            <select className={field} value={exam} onChange={(e) => setExam(e.target.value)}>
              {EXAMS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">Subject</span>
            <select className={field} value={subject} onChange={(e) => setSubject(e.target.value)}>
              {SUBJECTS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">Chapters / topics</span>
            <textarea className={`${field} min-h-[70px] resize-y`} value={chapters} onChange={(e) => setChapters(e.target.value)} placeholder="e.g. Kinematics, Laws of Motion, Work-Energy Theorem" />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">Difficulty</span>
            <select className={field} value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">Number of questions · {count}</span>
            <input type="range" min={3} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} className="mt-3 accent-[var(--color-blue-ink)]" />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">Brand colour</span>
            <div className="flex items-center gap-2">
              <input type="color" value={brandHex} onChange={(e) => setBrandHex(e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--color-line)] bg-white" />
              <input className={field} value={brandHex} onChange={(e) => setBrandHex(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">Logo (optional)</span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--color-line-strong)] bg-white px-3.5 py-2.5 text-[13px] text-[var(--color-ink-soft)] hover:border-[var(--color-blue-ink)]"
            >
              {logoDataUrl ? <><CheckCircle2 className="h-4 w-4 text-[var(--color-blue-ink)]" /> Logo added — replace</> : <><Upload className="h-4 w-4" /> Upload PNG / JPG</>}
            </button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" hidden onChange={(e) => onLogo(e.target.files?.[0])} />
          </div>

          {error && <p className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>}

          <div className="md:col-span-2">
            <button onClick={generate} disabled={busy} className="bbc-btn bbc-btn-primary w-full justify-center py-3.5 text-[15px] disabled:opacity-60">
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Writing questions & rendering…</> : <><Sparkles className="h-4 w-4" /> Generate branded paper</>}
            </button>
          </div>
        </div>

        {done && (
          <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)] p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-blue-ink)] text-white">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="bbc-serif text-[22px] tracking-[-.01em]">Your paper is ready.</h3>
              <p className="mt-1 text-[13.5px] text-[var(--color-ink-soft)]">
                {done.questions ? `${done.questions} questions` : "Question paper"} + answer key, branded for {instituteName}.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href={done.url} download={done.name} className="bbc-btn bbc-btn-primary px-6 py-3 text-[14px]">
                <Download className="h-4 w-4" /> Download PDF
              </a>
              <WhatsAppShare
                text={`Made a fresh ${exam} ${subject} mock paper for ${instituteName} in 30 seconds with BlueBottleCap. Try it free 👉 ${shareOrigin}/for-institutes/mock-generator`}
                label="Tell another teacher"
              />
            </div>
            <p className="text-[12px] text-[var(--color-ink-faint)]">Downloaded first? Attach the PDF in WhatsApp to send it to your batch.</p>
          </div>
        )}

        <p className="mt-8 text-center text-[12.5px] text-[var(--color-ink-faint)]">
          Want this for every batch, at scale, with per-student weak-topic maps?{" "}
          <a href="/for-institutes" className="font-semibold text-[var(--color-blue-ink)] hover:underline">Book a 15-min demo →</a>
        </p>
      </div>
    </div>
  );
};
