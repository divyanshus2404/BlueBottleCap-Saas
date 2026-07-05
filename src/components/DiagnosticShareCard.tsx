"use client";

import React, { useRef, useCallback } from "react";
import { type DiagnosticResult } from "@/src/lib/diagnostic";
import { Download, Share2 } from "lucide-react";

interface Props {
  result: DiagnosticResult;
}

function drawCard(canvas: HTMLCanvasElement, result: DiagnosticResult) {
  const W = 1080;
  const H = 1350;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background — deep blue gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#0D1B4A");
  grad.addColorStop(0.5, "#132157");
  grad.addColorStop(1, "#0A1338");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid pattern
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Top badge
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  roundRect(ctx, W / 2 - 130, 70, 260, 38, 19);
  ctx.fill();
  ctx.font = "600 13px ui-monospace, SFMono-Regular, monospace";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.textAlign = "center";
  const dateStr = new Date(result.takenAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  ctx.fillText(`JEE READINESS · ${dateStr.toUpperCase()}`, W / 2, 95);

  // Big readiness percentage — the hero number
  ctx.textAlign = "center";

  // Circular progress ring
  const cx = W / 2;
  const cy = 340;
  const radius = 150;
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (2 * Math.PI * result.readiness / 100);

  // Track
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 14;
  ctx.stroke();

  // Progress arc
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  const arcGrad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
  arcGrad.addColorStop(0, "#3B82F6");
  arcGrad.addColorStop(1, "#60A5FA");
  ctx.strokeStyle = arcGrad;
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.stroke();

  // Glow dot at the end of the arc
  const dotX = cx + radius * Math.cos(endAngle);
  const dotY = cy + radius * Math.sin(endAngle);
  ctx.beginPath();
  ctx.arc(dotX, dotY, 8, 0, 2 * Math.PI);
  ctx.fillStyle = "#60A5FA";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(dotX, dotY, 16, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(96,165,250,0.2)";
  ctx.fill();

  // Number inside the ring
  ctx.font = "800 88px ui-sans-serif, system-ui, -apple-system, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(`${result.readiness}%`, cx, cy + 30);
  ctx.font = "500 16px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText("JEE READINESS", cx, cy + 60);

  // Topic breakdown
  const scores = [...result.topicScores].sort((a, b) => (b.correct / b.total) - (a.correct / a.total));
  const barStartY = 560;
  const barLeft = 100;
  const barRight = W - 100;
  const barWidth = barRight - barLeft;
  const barH = 32;
  const gap = 68;

  ctx.font = "700 15px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "left";

  scores.forEach((ts, i) => {
    const y = barStartY + i * gap;
    const pct = Math.round((ts.correct / ts.total) * 100);
    const isWeak = pct < 60;

    // Topic label
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "600 15px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(ts.topic, barLeft, y - 8);

    // Percentage
    ctx.textAlign = "right";
    ctx.fillStyle = isWeak ? "#F87171" : "#60A5FA";
    ctx.font = "700 15px ui-monospace, SFMono-Regular, monospace";
    ctx.fillText(`${pct}%`, barRight, y - 8);
    ctx.textAlign = "left";

    // Bar track
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    roundRect(ctx, barLeft, y, barWidth, barH, 8);
    ctx.fill();

    // Bar fill
    const fillW = Math.max(barWidth * pct / 100, 16);
    const barGrad = ctx.createLinearGradient(barLeft, 0, barLeft + fillW, 0);
    if (isWeak) {
      barGrad.addColorStop(0, "#EF4444");
      barGrad.addColorStop(1, "#F87171");
    } else {
      barGrad.addColorStop(0, "#2563EB");
      barGrad.addColorStop(1, "#3B82F6");
    }
    ctx.fillStyle = barGrad;
    roundRect(ctx, barLeft, y, fillW, barH, 8);
    ctx.fill();

    // Score label inside bar
    if (fillW > 60) {
      ctx.font = "700 12px ui-monospace, monospace";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillText(`${ts.correct}/${ts.total}`, barLeft + 12, y + 21);
    }
  });

  // Weak topics callout
  if (result.weakTopics.length > 0) {
    const calloutY = barStartY + scores.length * gap + 20;
    ctx.fillStyle = "rgba(239,68,68,0.1)";
    roundRect(ctx, barLeft, calloutY, barWidth, 56, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(239,68,68,0.2)";
    ctx.lineWidth = 1;
    roundRect(ctx, barLeft, calloutY, barWidth, 56, 14);
    ctx.stroke();

    ctx.font = "600 13px ui-monospace, SFMono-Regular, monospace";
    ctx.fillStyle = "#F87171";
    ctx.textAlign = "center";
    ctx.fillText(`⚠ DRILL FIRST: ${result.weakTopics.slice(0, 3).join("  ·  ")}`, W / 2, calloutY + 34);
    ctx.textAlign = "left";
  }

  // Bottom CTA section
  const footerY = H - 140;

  // Divider line
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(barLeft, footerY);
  ctx.lineTo(barRight, footerY);
  ctx.stroke();

  // Challenge text
  ctx.font = "700 22px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText("Think you can beat my score? 👇", W / 2, footerY + 45);

  // URL
  ctx.font = "500 16px ui-monospace, SFMono-Regular, monospace";
  ctx.fillStyle = "rgba(96,165,250,0.8)";
  ctx.fillText("bluebottlecap.com/diagnostic", W / 2, footerY + 78);

  // Brand mark
  ctx.font = "700 13px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillText("BlueBottleCap", W / 2, footerY + 110);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function DiagnosticShareCard({ result }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawn = useRef(false);

  const canvasCallback = useCallback((node: HTMLCanvasElement | null) => {
    if (node && !drawn.current) {
      canvasRef.current = node;
      drawCard(node, result);
      drawn.current = true;
    }
  }, [result]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `jee-readiness-${result.readiness}pct.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "jee-readiness.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: `I'm ${result.readiness}% JEE-ready!`,
            text: `I scored ${result.readiness}% on the JEE readiness diagnostic. Can you beat me?\nbluebottlecap.com/diagnostic`,
            files: [file],
          });
        } catch {
          handleDownload();
        }
      } else {
        handleDownload();
      }
    }, "image/png");
  };

  return (
    <div className="mt-8">
      <p className="bbc-mono mb-3 text-[10.5px] uppercase tracking-[.18em] text-[var(--color-ink-faint)]">Your shareable result card</p>

      {/* Canvas preview — shown at a manageable size */}
      <div className="overflow-hidden rounded-[16px] border border-[var(--color-line)] shadow-lg">
        <canvas
          ref={canvasCallback}
          className="w-full"
          style={{ aspectRatio: "1080/1350" }}
        />
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleDownload}
          className="bbc-btn bbc-btn-primary flex-1 justify-center gap-2 py-3 text-[14px]"
        >
          <Download className="h-4 w-4" /> Save image
        </button>
        <button
          onClick={handleShare}
          className="bbc-btn flex-1 justify-center gap-2 border border-[var(--color-line)] bg-white py-3 text-[14px] font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-paper-card)]"
        >
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>
      <p className="mt-2 text-center text-[12px] text-[var(--color-ink-faint)]">
        Share on Instagram Stories, WhatsApp Status, or challenge a friend
      </p>
    </div>
  );
}
