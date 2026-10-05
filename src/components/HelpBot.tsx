"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, ArrowRight } from "lucide-react";
import { FAQ, SUGGESTED, type FaqEntry } from "@/src/data/botFaq";

/**
 * Help bot — keyword matching over hand-written answers. No model, no API key,
 * no network call.
 *
 * The scoring is intentionally simple and the threshold intentionally strict:
 * a support bot that confidently answers the wrong question is worse than one
 * that admits it does not know, because the first kind quietly teaches people
 * to distrust everything else on the page.
 */
interface Msg { from: "bot" | "user"; text: string; link?: FaqEntry["link"] }

const STOP = new Set(["the","a","an","is","are","do","does","can","i","my","me","you","to","of","for","in","on","it","this","that","how","what","and","with","be","am","was","there","here","get","got"]);

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));
}

function match(input: string): FaqEntry | null {
  const words = tokenize(input);
  if (!words.length) return null;

  let best: FaqEntry | null = null;
  let bestScore = 0;

  for (const entry of FAQ) {
    let score = 0;
    for (const w of words) {
      for (const k of entry.keywords) {
        if (k === w) score += 2;              // exact keyword
        else if (k.includes(w) || w.includes(k)) score += 1;  // partial
      }
    }
    // Direct hit on the entry's own question wording counts for a lot.
    const q = entry.question.toLowerCase();
    for (const w of words) if (q.includes(w)) score += 1;

    if (score > bestScore) { bestScore = score; best = entry; }
  }

  // Require real overlap, scaled to how much the user typed. Below this we say
  // we do not know rather than serve the least-bad guess.
  const threshold = Math.min(3, Math.max(2, Math.ceil(words.length * 0.6)));
  return bestScore >= threshold ? best : null;
}

const FALLBACK =
  "I don't have an answer written for that one. I can help with pricing, mock tests, the planner, flashcards, the question bank, how your progress is tracked, and what works without signing in. You can also email support@bluebottlecap.com for anything else.";

export const HelpBot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "bot", text: "Hi! Ask me anything about BlueBottleCap. I answer from a fixed set of topics, so I won't make things up." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [msgs, open]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 120); }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const ask = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setInput("");
    setMsgs((m) => [...m, { from: "user", text: q }]);
    const hit = match(q);
    // Small delay so the answer does not appear before the question renders.
    setTimeout(() => {
      setMsgs((m) => [...m, hit
        ? { from: "bot", text: hit.answer, link: hit.link }
        : { from: "bot", text: FALLBACK }]);
    }, 220);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close help" : "Open help"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[60] flex h-13 w-13 items-center justify-center rounded-full bg-[var(--color-blue-ink)] p-3.5 text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,.7)] transition hover:bg-[var(--color-blue-deep)]"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Help"
          className="fixed bottom-24 right-5 z-[60] flex max-h-[min(540px,calc(100vh-7rem))] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-[0_24px_60px_-24px_rgba(12,21,36,.4)]"
        >
          <div className="shrink-0 border-b border-[var(--color-line)] px-4 py-3">
            <p className="text-[14px] font-bold text-[var(--color-ink)]">Help</p>
            <p className="text-[11.5px] text-[var(--color-ink-faint)]">Answers written by hand — not AI generated</p>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {msgs.map((m, i) => (
              <div key={i} className={m.from === "user" ? "flex justify-end" : ""}>
                <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-[1.55] ${
                  m.from === "user"
                    ? "bg-[var(--color-blue-ink)] text-white"
                    : "bg-[var(--color-paper-card)] text-[var(--color-ink)]"
                }`}>
                  {m.text}
                  {m.link && (
                    <Link
                      href={m.link.href}
                      onClick={() => setOpen(false)}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--color-blue-ink)] ring-1 ring-[var(--color-line)] transition hover:ring-[var(--color-blue-ink)]"
                    >
                      {m.link.label} <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {msgs.length === 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="rounded-full border border-[var(--color-line)] px-2.5 py-1.5 text-[11.5px] text-[var(--color-ink-soft)] transition hover:border-[var(--color-blue-ink)] hover:text-[var(--color-blue-ink)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); ask(input); }}
            className="flex shrink-0 items-center gap-2 border-t border-[var(--color-line)] px-3 py-2.5"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              aria-label="Ask a question"
              className="min-w-0 flex-1 bg-transparent px-1 text-[13px] outline-none placeholder:text-[var(--color-ink-faint)]"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-ink)] text-white transition hover:bg-[var(--color-blue-deep)] disabled:opacity-35"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
