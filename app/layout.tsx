import type { Metadata, Viewport } from "next";
import "./globals.css";
import React from "react";
import { Providers } from "./providers";

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://bluebottlecap.com"),
  title: "BlueBottleCap AI Student Suite",
  description: "Advanced Academic Workspace for College and University Students. Rebuild your syllabus, generate flashcards, compress files, and master your exams.",
  keywords: ["AI study", "student tools", "flashcard generator", "pdf compressor", "JEE preparation", "college student productivity"],
  openGraph: {
    title: "BlueBottleCap AI Student Suite",
    description: "Advanced Academic Workspace for College and University Students. Rebuild your syllabus, generate flashcards, compress files, and master your exams.",
    url: "https://bluebottlecap.com",
    siteName: "BlueBottleCap",
    images: [
      {
        url: "/og-image.jpg", // Ensure you add an og-image.jpg to public/
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlueBottleCap AI Student Suite",
    description: "Advanced Academic Workspace for College and University Students.",
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
          {children}
        </Providers>
      </body>
    </html>
  );
}
