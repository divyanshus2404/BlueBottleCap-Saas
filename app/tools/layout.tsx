import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "AI Tools | BlueBottleCap",
  description: "Get instant solutions, document compression, and flashcard generation to retain concepts longer.",
  openGraph: {
    title: "AI Tools | BlueBottleCap",
    description: "Get instant solutions, document compression, and flashcard generation to retain concepts longer.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
