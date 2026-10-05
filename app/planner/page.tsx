import type { Metadata } from "next";
import { StudyPlanner } from "@/src/components/StudyPlanner";

export const metadata: Metadata = {
  title: "Study Planner — JEE & NEET syllabus tracker · BlueBottleCap",
  description:
    "Track the full JEE and NEET syllabus chapter by chapter. Mark what you have learnt, practised and revised, and see exactly how much is left. Saves on your device, no sign-in needed.",
};

export default function PlannerPage() {
  return <StudyPlanner />;
}
