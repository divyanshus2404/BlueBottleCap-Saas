"use client";

import React, { useState, useEffect } from "react";
import { getProgressHistory, getWeeklyStats } from "@/src/lib/progressTracker";
import { BarChart3, TrendingUp } from "lucide-react";

export function ProgressChart() {
  const [stats, setStats] = useState<{ label: string; minutes: number; cards: number }[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalCards, setTotalCards] = useState(0);

  useEffect(() => {
    const history = getProgressHistory();
    const weekly = getWeeklyStats(history);
    setStats(weekly);
    setTotalMinutes(weekly.reduce((s, d) => s + d.minutes, 0));
    setTotalCards(weekly.reduce((s, d) => s + d.cards, 0));
  }, []);

  const maxMinutes = Math.max(...stats.map((s) => s.minutes), 1);

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[var(--color-blue-ink)]" />
          <h3 className="text-[14px] font-bold text-[var(--color-ink)]">This Week</h3>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[18px] font-bold text-[var(--color-ink)]">{totalMinutes}</p>
            <p className="text-[10px] text-[var(--color-ink-faint)]">minutes</p>
          </div>
          <div className="text-right">
            <p className="text-[18px] font-bold text-[var(--color-blue-ink)]">{totalCards}</p>
            <p className="text-[10px] text-[var(--color-ink-faint)]">cards</p>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="mt-5 flex items-end justify-between gap-2">
        {stats.map((day, i) => {
          const height = Math.max((day.minutes / maxMinutes) * 80, 4);
          const isToday = i === stats.length - 1;
          return (
            <div key={day.label} className="flex flex-1 flex-col items-center gap-1.5">
              <div className="relative w-full">
                {day.minutes > 0 && (
                  <p className="mb-1 text-center text-[9px] font-bold text-[var(--color-ink-faint)]">
                    {day.minutes}m
                  </p>
                )}
                <div
                  className={`mx-auto w-full max-w-[28px] rounded-t-md transition-all ${
                    isToday
                      ? "bg-[var(--color-blue-ink)]"
                      : day.minutes > 0
                        ? "bg-[var(--color-blue-ink)] opacity-40"
                        : "bg-[var(--color-line)]"
                  }`}
                  style={{ height: `${height}px` }}
                />
              </div>
              <p className={`text-[10px] font-semibold ${isToday ? "text-[var(--color-blue-ink)]" : "text-[var(--color-ink-faint)]"}`}>
                {day.label}
              </p>
            </div>
          );
        })}
      </div>

      {totalMinutes === 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-[var(--color-blue-wash)] px-4 py-3">
          <TrendingUp className="h-4 w-4 text-[var(--color-blue-ink)]" />
          <p className="text-[12px] font-medium text-[var(--color-blue-ink)]">
            Start studying to see your progress chart fill up!
          </p>
        </div>
      )}
    </div>
  );
}
