import type { Metadata } from "next";
import { PreviousYearPapers } from "@/src/components/PreviousYearPapers";

export const metadata: Metadata = {
  title: "Previous Year Papers — JEE & NEET | BlueBottleCap",
  description: "Practice exam-pattern JEE Mains, JEE Advanced & NEET questions modelled on previous years, each with a detailed solution.",
  keywords: ["JEE previous year papers", "NEET previous year questions", "JEE Mains 2025 paper", "NEET 2025 questions", "JEE PYQ", "NEET PYQ"],
};

export default function PreviousYearPapersPage() {
  return <PreviousYearPapers />;
}
