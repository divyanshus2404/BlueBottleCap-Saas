"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const BRAIN_PATH_1 = "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z";
const BRAIN_PATH_2 = "M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z";

export default function NeuralBrainIntro() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false }); // Optimization: disable alpha if possible, but we use fillRect, so we keep default or use solid bg. Let's use standard.
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // DRASTICALLY REDUCED PARTICLES FOR PERFORMANCE (from 300 to 120)
    // O(N^2) complexity means this reduces calculations by 85%!
    const NUM_PARTICLES = 120;
    const particles: any[] = [];

    const targetPoints: { x: number; y: number }[] = [];
    const svgNS = "http://www.w3.org/2000/svg";
    const path1 = document.createElementNS(svgNS, "path");
    const path2 = document.createElementNS(svgNS, "path");
    path1.setAttribute("d", BRAIN_PATH_1);
    path2.setAttribute("d", BRAIN_PATH_2);

    const length1 = path1.getTotalLength();
    const length2 = path2.getTotalLength();

    const scale = 15;
    const offsetX = width / 2 - (24 * scale) / 2;
    const offsetY = height / 2 - (24 * scale) / 2 - 50;

    for (let i = 0; i < NUM_PARTICLES; i++) {
      const p = i % 2 === 0 ? path1 : path2;
      const len = i % 2 === 0 ? length1 : length2;
      const pt = p.getPointAtLength((i / NUM_PARTICLES) * 2 * len);
      
      targetPoints.push({
        x: pt.x * scale + offsetX,
        y: pt.y * scale + offsetY
      });
    }

    // Pre-calculate rgba strings to avoid heavy string ops in render loop
    const colors = [
      { fill: "#ffffff", strokeRGB: "255, 255, 255" },
      { fill: "#f8fafc", strokeRGB: "248, 250, 252" },
      { fill: "#f1f5f9", strokeRGB: "241, 245, 249" }
    ];

    for (let i = 0; i < NUM_PARTICLES; i++) {
      const c = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        targetX: targetPoints[i].x,
        targetY: targetPoints[i].y,
        isForming: false,
        isShattering: false,
        shatterVx: (Math.random() - 0.5) * 30,
        shatterVy: (Math.random() - 0.5) * 30 - 15,
        radius: Math.random() * 2.5 + 1.5,
        fillColor: c.fill,
        strokeRGB: c.strokeRGB
      });
    }

    let mouse = { x: -1000, y: -1000 };
    const handleMouse = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });

    let globalScale = { val: 1 };

    (window as any).triggerBrainForm = () => {
      particles.forEach((p) => {
        gsap.to(p, {
          x: p.targetX,
          y: p.targetY,
          duration: 1.5,
          ease: "expo.inOut",
          onStart: () => { p.isForming = true; }
        });
      });
      gsap.to(globalScale, {
        val: 1.1,
        duration: 0.15,
        yoyo: true,
        repeat: 3,
        delay: 1.4,
        ease: "power2.inOut"
      });
    };

    (window as any).triggerBrainShatter = () => {
      particles.forEach(p => {
        p.isShattering = true;
      });
    };

    let animationFrameId: number;

    const render = () => {
      // Fast motion blur
      ctx.fillStyle = "rgba(2, 6, 23, 0.35)"; // Slightly more opaque to reduce heavy overdraw
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      if (globalScale.val !== 1) {
        ctx.translate(width / 2, height / 2);
        ctx.scale(globalScale.val, globalScale.val);
        ctx.translate(-width / 2, -height / 2);
      }

      // REMOVED shadowBlur (Extremely expensive on GPU/CPU)
      ctx.lineWidth = 0.8;

      // Loop optimizations
      const sqConnectionThresholdForming = 1500;
      const sqConnectionThresholdIdle = 8000;

      for (let i = 0; i < NUM_PARTICLES; i++) {
        const p1 = particles[i];

        if (!p1.isForming && !p1.isShattering) {
          p1.x += p1.vx;
          p1.y += p1.vy;
          if (p1.x < 0 || p1.x > width) p1.vx *= -1;
          if (p1.y < 0 || p1.y > height) p1.vy *= -1;

          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 22500) { // 150 squared
            p1.x += dx * 0.005;
            p1.y += dy * 0.005;
            
            // Connect to mouse for that interactive constellation feel
            const alpha = 1 - (distSq / 22500);
            ctx.strokeStyle = `rgba(${p1.strokeRGB}, ${alpha * 0.5})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        } else if (p1.isShattering) {
          p1.x += p1.shatterVx;
          p1.y += p1.shatterVy;
          p1.shatterVy += 1.2;
        }

        if (!p1.isShattering) {
          const threshold = p1.isForming ? sqConnectionThresholdForming : sqConnectionThresholdIdle;
          
          for (let j = i + 1; j < NUM_PARTICLES; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < threshold) {
              const alpha = 1 - (distSq / threshold); // Cheaper than sqrt
              ctx.strokeStyle = `rgba(${p1.strokeRGB}, ${alpha * 0.6})`; 
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }

        ctx.fillStyle = p1.fillColor;
        ctx.beginPath();
        // Use cheap arc calculation
        ctx.arc(p1.x, p1.y, p1.radius, 0, 6.28318530718);
        ctx.fill();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      cancelAnimationFrame(animationFrameId);
      delete (window as any).triggerBrainForm;
      delete (window as any).triggerBrainShatter;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="neural-canvas"
      className="fixed inset-0 z-[60] pointer-events-none"
    />
  );
}
