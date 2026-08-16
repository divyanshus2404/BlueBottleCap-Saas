"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useI18n, LANGUAGES } from "../lib/i18n";

// Compact language picker. Shows the current language's native name; opens a
// dropdown of all supported Indian languages. Persists via the i18n context.

export const LanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t("lang.label")}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-paper-card)] px-2.5 py-1.5 text-[13px] font-semibold text-[var(--color-ink-soft)] transition hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]"
      >
        <Globe className="h-3.5 w-3.5" />
        {!compact && <span>{current.native}</span>}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-[var(--color-line)] bg-white py-1 shadow-[0_18px_40px_-20px_rgba(20,30,55,.35)]">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-[13.5px] transition hover:bg-[var(--color-paper)] ${l.code === lang ? "font-bold text-[var(--color-blue-ink)]" : "text-[var(--color-ink-soft)]"}`}
            >
              <span>{l.native}</span>
              {l.code === lang ? <Check className="h-3.5 w-3.5" /> : <span className="text-[11px] text-[var(--color-ink-faint)]">{l.label}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
