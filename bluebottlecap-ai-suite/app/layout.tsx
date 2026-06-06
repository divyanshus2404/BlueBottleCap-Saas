import "./globals.css";
import React from "react";
import { Providers } from "./providers";

export const metadata = {
  title: "BlueBottleCap AI Student Suite",
  description: "Advanced Academic Workspace for College and University Students. Rebuild your syllabus, generate flashcards, compress files, and master your exams.",
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
