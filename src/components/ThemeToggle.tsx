"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  // null until mounted so the server render matches either theme.
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("bbc_theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  };

  return (
    <button
      onClick={toggle}
      className={
        className ??
        "flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-paper-card)] text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)] cursor-pointer"
      }
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
};
