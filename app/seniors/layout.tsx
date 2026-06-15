import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Seniors Opinion | BlueBottleCap",
  description: "Read opinions and strategies from seniors who aced their exams.",
  openGraph: {
    title: "Seniors Opinion | BlueBottleCap",
    description: "Read opinions and strategies from seniors who aced their exams.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
