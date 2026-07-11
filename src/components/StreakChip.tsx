"use client";

import React from "react";
import { Flame } from "lucide-react";
import { useGlobalState } from "@/src/context/GlobalStateContext";

/**
 * Small, always-visible streak chip. Renders nothing until we know the
 * user has a real streak — a "🔥 0" chip is worse than no chip because it
 * makes the product feel empty on first visit. Once the user is on a real
 * streak, it appears at the top of Mocks / Flashcards / Timer to keep the
 * daily-return habit visible everywhere they study.
 */
export function StreakChip({ className = "" }: { className?: string }) {
  const { userStats } = useGlobalState();
  const days = userStats?.streakDays ?? 0;
  if (days < 1) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[12px] font-bold text-amber-800 ${className}`}
      title={`You've studied ${days} day${days === 1 ? "" : "s"} in a row`}
    >
      <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
      {days}-day streak
    </div>
  );
}
