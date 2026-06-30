"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";

type Status = "idle" | "sending" | "sent" | "error";

export const FeedbackWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const pathname = usePathname();
  const { currentUser } = useAuth();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Reset "sent" state shortly after the modal closes
  useEffect(() => {
    if (!open && status === "sent") {
      const t = setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 400);
      return () => clearTimeout(t);
    }
  }, [open, status]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (text.length < 3) return;
    setStatus("sending");
    setErrMsg(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.slice(0, 4000),
          email: (email.trim() || currentUser?.email || "").slice(0, 200) || null,
          userId: currentUser?.uid || null,
          path: pathname,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 300) : null,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `Request failed (${res.status}).`);
      }
      setStatus("sent");
      setMessage("");
      setEmail("");
    } catch (err) {
      console.error("Feedback submit failed:", err);
      setStatus("error");
      setErrMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full bg-[var(--color-blue-ink,#1e3a8a)] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(20,30,80,.5)] transition hover:translate-y-[-1px] hover:shadow-[0_14px_36px_-12px_rgba(20,30,80,.55)]"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 4.5C2 3.7 2.7 3 3.5 3h9c.8 0 1.5.7 1.5 1.5v5c0 .8-.7 1.5-1.5 1.5H7l-3 2.5V11H3.5C2.7 11 2 10.3 2 9.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
        </svg>
        <span>Tell us what sucks</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label="Send feedback">
          <button
            type="button"
            aria-label="Close feedback"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-[440px] rounded-2xl border border-[var(--color-line,#e5e2d6)] bg-[var(--color-paper,#f5f4ef)] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[.14em] text-[var(--color-ink-faint,#9b988b)] font-mono">Feedback</p>
                <h3 className="bbc-serif mt-1 text-[22px] tracking-[-.01em] text-[var(--color-ink,#1a1814)]">
                  Tell us what sucks.
                </h3>
                <p className="mt-1 text-[13px] text-[var(--color-ink-soft,#5a5749)]">
                  Honest is better than nice. We read every one.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-1.5 text-[var(--color-ink-faint,#9b988b)] hover:bg-black/5"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {status === "sent" ? (
              <div className="mt-6 rounded-xl border border-[var(--color-line,#e5e2d6)] bg-white p-5 text-center">
                <p className="bbc-serif text-[18px] text-[var(--color-ink,#1a1814)]">Got it — thank you.</p>
                <p className="mt-1 text-[13px] text-[var(--color-ink-soft,#5a5749)]">We'll read this. Promise.</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-lg bg-[var(--color-blue-ink,#1e3a8a)] px-4 py-2 text-[13px] font-semibold text-white"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-5 space-y-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  maxLength={4000}
                  placeholder="What broke? What's confusing? What's missing? Anything."
                  className="w-full resize-y rounded-xl border border-[var(--color-line,#e5e2d6)] bg-white p-3 text-[14px] leading-[1.5] text-[var(--color-ink,#1a1814)] placeholder:text-[var(--color-ink-faint,#9b988b)] focus:border-[var(--color-blue-ink,#1e3a8a)] focus:outline-none"
                />
                {!currentUser && (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email (optional, only if you want a reply)"
                    className="w-full rounded-xl border border-[var(--color-line,#e5e2d6)] bg-white p-3 text-[13.5px] text-[var(--color-ink,#1a1814)] placeholder:text-[var(--color-ink-faint,#9b988b)] focus:border-[var(--color-blue-ink,#1e3a8a)] focus:outline-none"
                  />
                )}
                {errMsg && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-[12.5px] text-red-700">{errMsg}</p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[var(--color-ink-faint,#9b988b)]">
                    {message.length > 0 && `${message.length} / 4000`}
                  </span>
                  <button
                    type="submit"
                    disabled={status === "sending" || message.trim().length < 3}
                    className="rounded-lg bg-[var(--color-blue-ink,#1e3a8a)] px-5 py-2.5 text-[13.5px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {status === "sending" ? "Sending..." : "Send feedback"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
