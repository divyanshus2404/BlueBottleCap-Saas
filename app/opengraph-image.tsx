import { ImageResponse } from "next/og";

// Dynamic OG image — Next.js builds this at request time so it always
// matches the editorial design system instead of pointing at a stale
// /public/og-image.jpg that might never get re-exported.
//
// Reuses the bottle Seal SVG and the cream/blue palette from globals.css.

export const runtime = "edge";
export const alt = "BlueBottleCap — AI study workspace for Indian engineering students";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  const PAPER = "#F5F4EF";
  const INK = "#181A1F";
  const INK_SOFT = "#5B5F69";
  const INK_FAINT = "#8A8D95";
  const BLUE = "#1B3FCB";
  const LINE = "#E4E1D8";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: PAPER,
          padding: "72px 84px",
          fontFamily: '"Hanken Grotesk", system-ui, sans-serif',
          color: INK,
          position: "relative",
        }}
      >
        {/* Faint grid background for the editorial feel */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              `linear-gradient(${LINE} 1px, transparent 1px), linear-gradient(90deg, ${LINE} 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
            opacity: 0.4,
          }}
        />

        {/* Brand mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, zIndex: 1 }}>
          <svg width="58" height="58" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" stroke={INK} strokeWidth="1.3" />
            <path
              d="M13.4 7.5h5.2v1.7h-1v2.2l1.5 2.8v8.8c0 .7-.5 1.2-1.2 1.2h-4.8c-.7 0-1.2-.5-1.2-1.2v-8.8l1.5-2.8V9.2h-1V7.5z"
              stroke={BLUE}
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <path d="M13.5 7.5h5" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.5 }}>BlueBottleCap</span>
        </div>

        {/* Eyebrow */}
        <div
          style={{
            marginTop: 88,
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: INK_FAINT,
            fontFamily: '"IBM Plex Mono", monospace',
            zIndex: 1,
          }}
        >
          FOR JEE · B.TECH · GATE
        </div>

        {/* Hero headline */}
        <div
          style={{
            marginTop: 22,
            fontSize: 88,
            lineHeight: 1.02,
            letterSpacing: -2,
            fontFamily: '"Fraunces", Georgia, serif',
            fontWeight: 500,
            maxWidth: 980,
            zIndex: 1,
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          <span>Study your own material,&nbsp;</span>
          <span style={{ color: BLUE, fontStyle: "italic" }}>understood.</span>
        </div>

        {/* Subline */}
        <div
          style={{
            marginTop: 28,
            fontSize: 26,
            color: INK_SOFT,
            maxWidth: 880,
            lineHeight: 1.4,
            zIndex: 1,
          }}
        >
          Upload a PDF. Ask in plain language. Answers cite the page they came from.
        </div>

        {/* Footer row: domain + CTA pill */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontFamily: '"IBM Plex Mono", monospace',
              color: INK_FAINT,
              letterSpacing: 1,
            }}
          >
            bluebottlecap.com
          </div>
          <div
            style={{
              backgroundColor: BLUE,
              color: "#fff",
              padding: "14px 28px",
              borderRadius: 12,
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            Try it free →
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
