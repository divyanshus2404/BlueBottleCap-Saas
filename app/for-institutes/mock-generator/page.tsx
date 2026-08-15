import { MockGenerator } from "@/src/components/MockGenerator";

export const metadata = {
  title: "Mock generator · BlueBottleCap for institutes",
  description:
    "Generate a branded JEE / NEET / CUET mock test in seconds. Pick exam + chapters + your institute name, download a print-ready PDF with answer key.",
};

export default function MockGeneratorPage() {
  return <MockGenerator />;
}
