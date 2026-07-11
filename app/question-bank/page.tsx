import type { Metadata } from "next";
import { QuestionBank } from "@/src/components/QuestionBank";

export const metadata: Metadata = {
  title: "Question Bank — Browse by Topic | BlueBottleCap",
  description: "Browse JEE & NEET questions by subject, topic, and difficulty. Practice Physics, Chemistry, Maths & Biology with instant answers and explanations.",
  keywords: ["JEE questions", "NEET questions", "Physics MCQ", "Chemistry MCQ", "Maths practice", "Biology MCQ", "topic-wise questions"],
};

export default function QuestionBankPage() {
  return <QuestionBank />;
}
