import type { Metadata } from "next";
import { FlashcardDeck } from "@/src/components/FlashcardDeck";

export const metadata: Metadata = {
  title: "Flashcards — Spaced Repetition | BlueBottleCap",
  description: "Review JEE & NEET flashcards with SM-2 spaced repetition. Master concepts efficiently.",
};

export default function FlashcardsPage() {
  return <FlashcardDeck />;
}
