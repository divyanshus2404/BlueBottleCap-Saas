"use client";

import { useEffect } from "react";

export function useFaviconBadge(count: number) {
  useEffect(() => {
    if (typeof document === "undefined" || count < 1) return;

    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 32, 32);

      ctx.beginPath();
      ctx.arc(24, 8, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = count > 99 ? "99+" : String(count);
      ctx.fillText(label, 24, 9);

      const link = document.querySelector<HTMLLinkElement>("link[rel='icon']") ?? document.createElement("link");
      link.rel = "icon";
      link.href = canvas.toDataURL("image/png");
      if (!link.parentNode) document.head.appendChild(link);
    };
    img.src = "/favicon.png";
  }, [count]);
}
