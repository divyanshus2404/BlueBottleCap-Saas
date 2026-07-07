"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Coffee, Brain, Timer } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { trackEvent } from "@/src/lib/analytics";

type Phase = "focus" | "break" | "longBreak";

const PRESETS = [
  { label: "25 / 5", focus: 25, break: 5, longBreak: 15 },
  { label: "50 / 10", focus: 50, break: 10, longBreak: 20 },
  { label: "90 / 15", focus: 90, break: 15, longBreak: 30 },
];

const STUDY_LOG_KEY = "bbc_study_log";

function logStudyMinutes(minutes: number, uid?: string | null) {
  if (typeof window === "undefined" || minutes < 1) return;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const log: Record<string, number> = JSON.parse(localStorage.getItem(STUDY_LOG_KEY) || "{}");
  log[today] = (log[today] || 0) + minutes;
  localStorage.setItem(STUDY_LOG_KEY, JSON.stringify(log));
  if (uid) {
    import("@/src/lib/firestoreSync").then((m) => m.syncStudyLogToFirestore(uid, log)).catch(() => {});
  }
}

export function StudyTimer() {
  const { currentUser } = useAuth();
  const [preset, setPreset] = useState(0);
  const [phase, setPhase] = useState<Phase>("focus");
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(PRESETS[0].focus * 60);
  const [sessions, setSessions] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const startedRef = useRef(0);
  const accumulatedRef = useRef(0);

  const currentPreset = PRESETS[preset];

  const getDuration = useCallback((p: Phase) => {
    if (p === "focus") return currentPreset.focus * 60;
    if (p === "break") return currentPreset.break * 60;
    return currentPreset.longBreak * 60;
  }, [currentPreset]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          if (phase === "focus") {
            const elapsed = Math.round((accumulatedRef.current + Date.now() - startedRef.current) / 60000);
            accumulatedRef.current = 0;
            logStudyMinutes(elapsed, currentUser?.uid);
            setTotalMinutes((t) => t + elapsed);
            setSessions((s) => s + 1);
            trackEvent("study_session_completed", { minutes: elapsed, preset: currentPreset.label });
            const nextSessions = sessions + 1;
            const nextPhase = nextSessions % 4 === 0 ? "longBreak" : "break";
            setPhase(nextPhase);
            setRunning(false);
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Focus session complete!", { body: "Time for a break. Great work! 🎉", icon: "/icon-192.png" });
            }
            return getDuration(nextPhase);
          } else {
            setPhase("focus");
            setRunning(false);
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Break's over!", { body: "Ready for the next focus session? 🧠", icon: "/icon-192.png" });
            }
            return getDuration("focus");
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, phase, sessions, getDuration, currentUser, currentPreset.label]);

  const toggle = () => {
    if (!running) {
      startedRef.current = Date.now();
    } else {
      accumulatedRef.current += Date.now() - startedRef.current;
    }
    setRunning((r) => !r);
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    accumulatedRef.current = 0;
    setTimeLeft(getDuration(phase));
  };

  const switchPreset = (i: number) => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setPreset(i);
    setPhase("focus");
    setTimeLeft(PRESETS[i].focus * 60);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const total = getDuration(phase);
  const pct = ((total - timeLeft) / total) * 100;

  const phaseLabel = phase === "focus" ? "Focus Time" : phase === "break" ? "Short Break" : "Long Break";
  const PhaseIcon = phase === "focus" ? Brain : Coffee;

  return (
    <div className="bbc mx-auto max-w-[520px] px-7 py-12">
      <p className="bbc-eyebrow">Study Timer</p>
      <h1 className="bbc-serif mt-3 text-[clamp(28px,4vw,42px)] leading-[1.08] tracking-[-.02em]">
        Pomodoro Focus
      </h1>
      <p className="mt-2 text-[14px] text-[var(--color-ink-soft)]">
        Stay focused, take breaks, build your streak
      </p>

      <div className="mt-6 flex justify-center gap-2">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => switchPreset(i)}
            className={`rounded-full px-4 py-1.5 text-[12px] font-semibold transition ${
              preset === i
                ? "bg-[var(--color-blue-ink)] text-white"
                : "border border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-blue-ink)]"
            }`}
          >
            {p.label} min
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center">
        <div className="relative flex h-64 w-64 items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 256 256">
            <circle cx="128" cy="128" r="118" fill="none" stroke="var(--color-line)" strokeWidth="8" />
            <circle
              cx="128" cy="128" r="118" fill="none"
              stroke={phase === "focus" ? "var(--color-blue-ink)" : "#10b981"}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={741.4} strokeDashoffset={741.4 * (1 - pct / 100)}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-[12px] font-bold uppercase tracking-[.14em]" style={{ color: phase === "focus" ? "var(--color-blue-ink)" : "#10b981" }}>
              <PhaseIcon className="h-4 w-4" />
              {phaseLabel}
            </div>
            <p className="mt-2 text-[52px] font-bold tracking-[-0.02em] text-[var(--color-ink)] tabular-nums">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={toggle}
            className={`flex h-14 w-14 items-center justify-center rounded-full text-white transition hover:brightness-110 ${
              phase === "focus" ? "bg-[var(--color-blue-ink)]" : "bg-emerald-500"
            }`}
          >
            {running ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
          </button>
          <button
            onClick={reset}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-ink-faint)] transition hover:bg-[var(--color-paper-card)]"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 w-full">
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-4 text-center">
            <p className="text-[22px] font-bold text-[var(--color-blue-ink)]">{sessions}</p>
            <p className="text-[11px] text-[var(--color-ink-faint)]">Sessions</p>
          </div>
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-4 text-center">
            <p className="text-[22px] font-bold text-[var(--color-ink)]">{totalMinutes}</p>
            <p className="text-[11px] text-[var(--color-ink-faint)]">Minutes</p>
          </div>
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Timer className="h-4 w-4 text-amber-500" />
              <p className="text-[22px] font-bold text-amber-600">{Math.floor(sessions / 4)}</p>
            </div>
            <p className="text-[11px] text-[var(--color-ink-faint)]">Cycles</p>
          </div>
        </div>
      </div>
    </div>
  );
}
