import type { Metadata } from "next";
import { StudyTimer } from "@/src/components/StudyTimer";

export const metadata: Metadata = {
  title: "Study Timer — Pomodoro Focus | BlueBottleCap",
  description: "Pomodoro-style study timer with focus sessions and breaks. Track your study time.",
};

export default function StudyTimerPage() {
  return <StudyTimer />;
}
