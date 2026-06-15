import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Virtual Test Mode | BlueBottleCap",
  description: "Practice past papers in an immersive, distraction-free environment with an active timer.",
  openGraph: {
    title: "Virtual Test Mode | BlueBottleCap",
    description: "Practice past papers in an immersive, distraction-free environment with an active timer.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
