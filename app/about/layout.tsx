import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "About Us | BlueBottleCap",
  description: "The story behind BlueBottleCap and our mission to provide the best tools for ambitious students.",
  openGraph: {
    title: "About Us | BlueBottleCap",
    description: "The story behind BlueBottleCap and our mission to provide the best tools for ambitious students.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
