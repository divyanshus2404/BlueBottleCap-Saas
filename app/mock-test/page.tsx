import { MockTest } from "@/src/components/MockTest";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mock Tests · BlueBottleCap",
  description: "Take timed JEE mock tests with real marking scheme. Practice under exam conditions.",
};

export default function MockTestPage() {
  return <MockTest />;
}
