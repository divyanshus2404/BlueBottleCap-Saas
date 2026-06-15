import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Study Material | BlueBottleCap",
  description: "Access exhaustive, topper-grade notes carefully organized by subject and chapter.",
  openGraph: {
    title: "Study Material | BlueBottleCap",
    description: "Access exhaustive, topper-grade notes carefully organized by subject and chapter.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
