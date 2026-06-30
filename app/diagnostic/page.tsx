import { DiagnosticTest } from "@/src/components/DiagnosticTest";

export const metadata = {
  title: "Diagnostic · BlueBottleCap",
  description:
    "Take a 2-minute diagnostic and see where you stand for JEE. Personalized weak-topic map, no signup.",
};

export default function DiagnosticPage() {
  return <DiagnosticTest />;
}
