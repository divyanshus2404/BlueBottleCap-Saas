import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Pricing | BlueBottleCap",
  description: "Upgrade your academic life. Check out our affordable pricing plans for premium student tools.",
  openGraph: {
    title: "Pricing | BlueBottleCap",
    description: "Upgrade your academic life. Check out our affordable pricing plans for premium student tools.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
