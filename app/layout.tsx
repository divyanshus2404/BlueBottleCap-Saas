import type { Metadata, Viewport } from "next";
import "./globals.css";
import React, { Suspense } from "react";
import { Providers } from "./providers";
import ClientLayout from "./ClientLayout";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

export const viewport: Viewport = {
  // Matches --color-ink so mobile status bars align with the editorial palette.
  themeColor: "#181A1F",
  width: "device-width",
  initialScale: 1,
};

// Analytics host. Plausible by default; override via env to point at a
// self-hosted instance or to disable in dev (leave NEXT_PUBLIC_PLAUSIBLE_DOMAIN unset).
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const PLAUSIBLE_SRC = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || "https://plausible.io/js/script.js";

export const metadata: Metadata = {
  metadataBase: new URL("https://bluebottlecap.com"),
  title: "BlueBottleCap — AI Exam Prep for JEE, B.Tech & Engineering",
  description: "The AI-powered study workspace built for Indian engineering students. Upload your PDFs, chat with an AI co-pilot, and prepare smarter for JEE, GATE, and B.Tech exams.",
  keywords: ["JEE preparation", "B.Tech study tool", "AI PDF study", "engineering exam prep", "GATE preparation", "Indian engineering students", "AI copilot for students", "PDF chat AI"],
  // OG image is generated dynamically by app/opengraph-image.tsx, so we
  // don't need to ship a static /og-image.jpg or list it in images[].
  // Next.js auto-injects the right URL + dimensions into og:image / twitter:image.
  openGraph: {
    title: "BlueBottleCap — AI Exam Prep for JEE, B.Tech & Engineering",
    description: "The AI-powered study workspace built for Indian engineering students. Upload your PDFs, chat with an AI co-pilot, and prepare smarter for JEE, GATE, and B.Tech exams.",
    url: "https://bluebottlecap.com",
    siteName: "BlueBottleCap",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BlueBottleCap — AI Exam Prep for JEE & Engineering",
    description: "Upload PDFs, chat with AI, and ace your engineering exams. Built for Indian students.",
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
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" sizes="32x32" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        {PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={PLAUSIBLE_DOMAIN}
            src={PLAUSIBLE_SRC}
          />
        )}
      </head>
      {/* Body inherits bg-paper + text-ink from the @theme body rule in
          globals.css. Don't re-set those here; the old slate-50/slate-950
          classes were the only thing breaking the editorial palette
          when a tab loaded with dark-mode preference. */}
      <body className="antialiased min-h-screen">
        <Providers>
          {/* Suspense boundary is required because ClientLayout calls
              useSearchParams(); without it the static App Router build
              would opt every page into client-side rendering. */}
          <Suspense fallback={null}>
            <ClientLayout>
              {children}
            </ClientLayout>
          </Suspense>
        </Providers>
        {/* No-ops outside Vercel deployments, so safe in dev. */}
        <Analytics />
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js'); }`}
        </Script>
      </body>
    </html>
  );
}
