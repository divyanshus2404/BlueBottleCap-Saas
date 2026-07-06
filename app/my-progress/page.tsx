import type { Metadata } from "next";
import { MyProgress } from "@/src/components/MyProgress";

export const metadata: Metadata = {
  title: "My Progress · BlueBottleCap",
  description: "Track your JEE/NEET preparation — see strengths, weaknesses, score trends, and study activity.",
};

export default function MyProgressPage() {
  return <MyProgress />;
}
