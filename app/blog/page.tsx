import type { Metadata } from "next";
import { BlogList } from "@/src/components/BlogList";

export const metadata: Metadata = {
  title: "Study Tips & Exam Strategy Blog | BlueBottleCap",
  description: "Expert study tips, exam strategies, and preparation guides for JEE & NEET aspirants. Written by toppers, backed by science.",
  keywords: ["JEE tips", "NEET preparation", "study tips", "exam strategy", "JEE Physics mistakes", "NEET Biology strategy"],
};

export default function BlogPage() {
  return <BlogList />;
}
