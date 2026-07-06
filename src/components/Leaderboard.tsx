"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Flame, Medal, Crown } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { useGlobalState } from "@/src/context/GlobalStateContext";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  streak: number;
  score: number;
  isCurrentUser: boolean;
}

function generateLeaderboard(userName: string, userStreak: number): LeaderboardEntry[] {
  const names = [
    "Arjun S.", "Priya M.", "Rahul K.", "Ananya T.", "Vikram P.",
    "Sneha R.", "Aditya G.", "Kavya N.", "Rohan D.", "Ishita B.",
    "Amit V.", "Neha S.", "Karthik L.", "Divya A.", "Saurabh J.",
    "Pooja W.", "Manish C.", "Ritika H.", "Varun F.", "Shruti E.",
  ];
  const avatars = ["📘", "🚀", "🔥", "⭐", "🧠", "⚛️", "💡", "🎯", "📖", "🏅", "⚡", "💎", "🌟", "🎓", "💪", "🏆", "🎯", "🔬", "📐", "✨"];

  const entries: LeaderboardEntry[] = names.map((name, i) => ({
    rank: 0,
    name,
    avatar: avatars[i],
    streak: Math.max(1, Math.floor(Math.random() * 45) + (20 - i)),
    score: Math.floor(Math.random() * 800) + 200 + (20 - i) * 40,
    isCurrentUser: false,
  }));

  entries.push({
    rank: 0,
    name: userName || "You",
    avatar: "🎯",
    streak: userStreak,
    score: userStreak * 30 + Math.floor(Math.random() * 200),
    isCurrentUser: true,
  });

  entries.sort((a, b) => b.score - a.score);
  entries.forEach((e, i) => (e.rank = i + 1));

  return entries.slice(0, 15);
}

const RANK_STYLES: Record<number, { bg: string; text: string; icon: React.ReactNode }> = {
  1: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: <Crown className="h-4 w-4 text-amber-500" /> },
  2: { bg: "bg-slate-50 border-slate-200", text: "text-slate-600", icon: <Medal className="h-4 w-4 text-slate-400" /> },
  3: { bg: "bg-orange-50 border-orange-200", text: "text-orange-600", icon: <Medal className="h-4 w-4 text-orange-400" /> },
};

export function Leaderboard() {
  const { currentUser } = useAuth();
  const { userStats } = useGlobalState();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [tab, setTab] = useState<"weekly" | "alltime">("weekly");

  useEffect(() => {
    setEntries(generateLeaderboard(
      currentUser?.displayName || currentUser?.email?.split("@")[0] || "Scholar",
      userStats.streakDays,
    ));
  }, [currentUser, userStats.streakDays, tab]);

  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h3 className="text-[14px] font-bold text-[var(--color-ink)]">Leaderboard</h3>
        </div>
        <div className="flex rounded-lg border border-[var(--color-line)] p-0.5">
          {(["weekly", "alltime"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1 text-[11px] font-bold transition ${tab === t ? "bg-[var(--color-blue-ink)] text-white" : "text-[var(--color-ink-faint)]"}`}
            >
              {t === "weekly" ? "This Week" : "All Time"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        {entries.map((entry) => {
          const style = RANK_STYLES[entry.rank];
          return (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                entry.isCurrentUser
                  ? "border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)]"
                  : style
                    ? `${style.bg}`
                    : "border-transparent bg-transparent hover:bg-[var(--color-paper)]"
              }`}
            >
              <span className={`w-6 text-center text-[13px] font-bold ${style?.text || "text-[var(--color-ink-faint)]"}`}>
                {style?.icon || entry.rank}
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-paper)] text-[14px]">
                {entry.avatar}
              </span>
              <span className={`flex-1 text-[13px] font-semibold ${entry.isCurrentUser ? "text-[var(--color-blue-ink)]" : "text-[var(--color-ink)]"}`}>
                {entry.name} {entry.isCurrentUser && "(You)"}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-bold text-orange-500">
                <Flame className="h-3 w-3" />
                {entry.streak}
              </div>
              <span className="w-12 text-right text-[12px] font-bold text-[var(--color-ink-soft)]">
                {entry.score}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
