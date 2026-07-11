"use client";

import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { trackEvent } from "@/src/lib/analytics";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "bbc_pwa_dismissed";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") { setVisible(false); trackEvent("pwa_install_accepted"); }
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[9998] mx-auto max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300 md:left-auto md:right-5">
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-xl shadow-slate-200/60">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-blue-wash)]">
          <Download className="h-5 w-5 text-[var(--color-blue-ink)]" />
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-bold text-[var(--color-ink)]">Add to Home Screen</p>
          <p className="mt-0.5 text-[12px] text-[var(--color-ink-soft)]">Install BlueBottleCap for quick access and offline study</p>
          <div className="mt-3 flex gap-2">
            <button onClick={install} className="rounded-lg bg-[var(--color-blue-ink)] px-4 py-1.5 text-[12px] font-bold text-white transition hover:brightness-110">
              Install
            </button>
            <button onClick={dismiss} className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-[var(--color-ink-faint)] transition hover:bg-gray-100">
              Not now
            </button>
          </div>
        </div>
        <button onClick={dismiss} className="shrink-0 text-gray-300 hover:text-gray-500 transition">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
