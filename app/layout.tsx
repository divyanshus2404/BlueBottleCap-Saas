import type { Metadata, Viewport } from "next";
import "./globals.css";
import React from "react";
import { Providers } from "./providers";
import ClientLayout from "./ClientLayout";

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://bluebottlecap.com"),
  title: "BlueBottleCap — AI Exam Prep for JEE, B.Tech & Engineering",
  description: "The AI-powered study workspace built for Indian engineering students. Upload your PDFs, chat with an AI co-pilot, and prepare smarter for JEE, GATE, and B.Tech exams.",
  keywords: ["JEE preparation", "B.Tech study tool", "AI PDF study", "engineering exam prep", "GATE preparation", "Indian engineering students", "AI copilot for students", "PDF chat AI"],
  openGraph: {
    title: "BlueBottleCap — AI Exam Prep for JEE, B.Tech & Engineering",
    description: "The AI-powered study workspace built for Indian engineering students. Upload your PDFs, chat with an AI co-pilot, and prepare smarter for JEE, GATE, and B.Tech exams.",
    url: "https://bluebottlecap.com",
    siteName: "BlueBottleCap",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlueBottleCap — AI Exam Prep for JEE & Engineering",
    description: "Upload PDFs, chat with AI, and ace your engineering exams. Built for Indian students.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
