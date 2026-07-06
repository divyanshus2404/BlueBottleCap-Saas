"use client";

import React, { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { requestNotificationPermission, isNotificationEnabled } from "@/src/lib/notifications";

const DISMISSED_KEY = "bluebottlecap_notif_dismissed";

export function NotificationPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission === "denied") return;
    if (isNotificationEnabled()) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const timer = setTimeout(() => setVisible(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    await requestNotificationPermission();
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, Date.now().toString());
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 w-[320px] animate-[fadeIn_0.3s_ease] rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-5 shadow-2xl">
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-ink-faint)] transition hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-blue-wash)]">
          <Bell className="h-5 w-5 text-[var(--color-blue-ink)]" />
        </div>
        <div>
          <p className="text-[14px] font-bold text-[var(--color-ink)]">Stay on track</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">
            Get streak reminders and daily motivation so you never miss a study day.
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleEnable}
          className="flex-1 rounded-xl bg-[var(--color-blue-ink)] py-2.5 text-[13px] font-bold text-white transition hover:brightness-110"
        >
          Enable notifications
        </button>
        <button
          onClick={handleDismiss}
          className="rounded-xl border border-[var(--color-line)] px-4 py-2.5 text-[13px] font-semibold text-[var(--color-ink-soft)] transition hover:bg-[var(--color-paper)]"
        >
          Later
        </button>
      </div>
    </div>
  );
}
