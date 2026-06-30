import { NotesScanner } from "@/src/components/NotesScanner";

export const metadata = {
  title: "Notes Scanner · BlueBottleCap",
  description:
    "Photograph handwritten notes and get a clean, typed, searchable version with equations and headings intact. Free for Indian students.",
};

export default function ScanNotesPage() {
  return <NotesScanner />;
}
