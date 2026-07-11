"use client";

import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Share2, Loader2 } from "lucide-react";
import type { MockTestResult } from "@/src/lib/mockTest";

/**
 * Downloadable / shareable PNG summary of a mock-test result.
 *
 * The visual card sits off-screen (position: fixed; opacity: 0) and gets
 * rasterized via html-to-image on demand. This is deliberate — rendering
 * it inline would push the actual result page below the fold, and the
 * off-screen approach lets the shot use its own fixed 1080×1350 layout
 * (Instagram-story-ready) regardless of the viewport.
 *
 * The visible "Download / Share" buttons are what the user actually sees.
 */
export function ScoreCard({ result }: { result: MockTestResult }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"download" | "share" | null>(null);

  const pct = Math.round((result.score / result.maxScore) * 100);
  const grade =
    pct >= 85 ? "Rank-worthy" : pct >= 65 ? "Strong" : pct >= 40 ? "Building" : "Warming up";

  const rasterize = async (): Promise<string | null> => {
    if (!ref.current) return null;
    return toPng(ref.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#0A0B10",
    });
  };

  const handleDownload = async () => {
    setBusy("download");
    try {
      const url = await rasterize();
      if (!url) return;
      const a = document.createElement("a");
      a.href = url;
      a.download = `bluebottlecap-${result.testId}-${pct}pct.png`;
      a.click();
    } catch (err) {
      console.error("Score card download failed", err);
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    setBusy("share");
    try {
      const url = await rasterize();
      if (!url) return;
      // Prefer native share (WhatsApp / Instagram / X on mobile) with the
      // PNG as an actual file so the platform's share sheet treats it as
      // media, not a URL. Fall back to download when Web Share can't handle
      // files (older Chrome, most desktop browsers).
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], `bluebottlecap-${result.testId}.png`, { type: "image/png" });
      const shareData: ShareData & { files?: File[] } = {
        title: "My BlueBottleCap score",
        text: `Scored ${result.score}/${result.maxScore} (${pct}%) on ${result.testName}. Try a free mock: https://bluebottlecap.com/mock-test`,
        files: [file],
      };
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.share && nav.canShare?.(shareData)) {
        await nav.share(shareData);
      } else {
        // No Web Share w/ files — just download so they can attach it manually.
        const a = document.createElement("a");
        a.href = url;
        a.download = `bluebottlecap-${result.testId}-${pct}pct.png`;
        a.click();
      }
    } catch (err) {
      // User cancelled share sheet — silent. Anything else, log for debugging.
      if ((err as { name?: string })?.name !== "AbortError") {
        console.error("Score card share failed", err);
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={!!busy}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-line)] px-4 py-2.5 text-[13.5px] font-bold text-[var(--color-ink-soft)] transition hover:border-[var(--color-blue-ink)] hover:text-[var(--color-blue-ink)] disabled:opacity-50"
        >
          {busy === "download" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Save score card
        </button>
        <button
          onClick={handleShare}
          disabled={!!busy}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-blue-ink)] px-4 py-2.5 text-[13.5px] font-bold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {busy === "share" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
          Share as image
        </button>
      </div>

      {/* Off-screen canvas — rasterized to PNG. Sized 1080x1350 (Instagram
          story aspect). Uses inline styles because html-to-image can't
          reliably resolve CSS variables or Tailwind utilities from a
          different subtree. */}
      <div
        ref={ref}
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "1080px",
          height: "1350px",
          padding: "80px 72px",
          background:
            "radial-gradient(120% 90% at 20% 0%, rgba(27,63,203,0.5) 0%, rgba(10,11,16,0) 50%), radial-gradient(90% 70% at 80% 100%, rgba(141,164,255,0.35) 0%, rgba(10,11,16,0) 55%), #0A0B10",
          color: "white",
          fontFamily: 'Georgia, "Times New Roman", serif',
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
        aria-hidden="true"
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: "#1B3FCB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              🧪
            </div>
            <div style={{ fontFamily: "system-ui, sans-serif", fontWeight: 700, fontSize: 24, letterSpacing: "-0.01em" }}>
              BlueBottleCap
            </div>
          </div>
          <div
            style={{
              marginTop: 44,
              fontFamily: "system-ui, sans-serif",
              fontSize: 15,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Mock Test Result
          </div>
          <div style={{ marginTop: 22, fontSize: 44, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            {result.testName}
          </div>
        </div>

        <div>
          <div
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 15,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            Score
          </div>
          <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 20 }}>
            <div style={{ fontSize: 220, lineHeight: 1, letterSpacing: "-0.05em", fontWeight: 500 }}>
              {result.score}
            </div>
            <div style={{ fontSize: 60, color: "rgba(255,255,255,0.55)" }}>
              / {result.maxScore}
            </div>
          </div>
          <div
            style={{
              marginTop: 18,
              display: "inline-block",
              padding: "10px 20px",
              borderRadius: 999,
              border: "1.5px solid rgba(141,164,255,0.5)",
              fontFamily: "system-ui, sans-serif",
              fontSize: 20,
              fontWeight: 700,
              color: "#8DA4FF",
            }}
          >
            {pct}% · {grade}
          </div>

          <div style={{ marginTop: 44, display: "flex", gap: 28, fontFamily: "system-ui, sans-serif" }}>
            <div>
              <div style={{ fontSize: 44, fontWeight: 700, color: "#5FD489" }}>{result.correct}</div>
              <div style={{ fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>Correct</div>
            </div>
            <div>
              <div style={{ fontSize: 44, fontWeight: 700, color: "#FF7C7C" }}>{result.incorrect}</div>
              <div style={{ fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>Incorrect</div>
            </div>
            <div>
              <div style={{ fontSize: 44, fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>{result.unanswered}</div>
              <div style={{ fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>Skipped</div>
            </div>
          </div>
        </div>

        <div style={{ fontFamily: "system-ui, sans-serif" }}>
          <div style={{ fontSize: 22, fontWeight: 600 }}>Take a free JEE / NEET mock.</div>
          <div style={{ marginTop: 6, fontSize: 20, color: "rgba(255,255,255,0.55)" }}>
            bluebottlecap.com/mock-test
          </div>
        </div>
      </div>
    </div>
  );
}
