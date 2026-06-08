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
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // We will spawn 300 particles.
    const NUM_PARTICLES = 300;
    const particles: any[] = [];

    // Parse the Brain paths to get target coordinates
    const targetPoints: { x: number; y: number }[] = [];
    const svgNS = "http://www.w3.org/2000/svg";
    const path1 = document.createElementNS(svgNS, "path");
    const path2 = document.createElementNS(svgNS, "path");
    path1.setAttribute("d", BRAIN_PATH_1);
    path2.setAttribute("d", BRAIN_PATH_2);

    const length1 = path1.getTotalLength();
    const length2 = path2.getTotalLength();

    // Scale and center the brain
    // The Lucide icon is 24x24. We want it to be 400x400 on screen.
    const scale = 15;
    const offsetX = width / 2 - (24 * scale) / 2;
    const offsetY = height / 2 - (24 * scale) / 2 - 50;

    for (let i = 0; i < NUM_PARTICLES; i++) {
      // Half points from path1, half from path2
      const p = i % 2 === 0 ? path1 : path2;
      const len = i % 2 === 0 ? length1 : length2;
      const pt = p.getPointAtLength((i / NUM_PARTICLES) * 2 * len);
      
      targetPoints.push({
        x: pt.x * scale + offsetX,
        y: pt.y * scale + offsetY
      });
    }

    // Colors for the "Coolness" factor
    const colors = ["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#2dd4bf"];

    // Initialize particles randomly
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 4, // Faster idle speed
        vy: (Math.random() - 0.5) * 4,
        targetX: targetPoints[i].x,
        targetY: targetPoints[i].y,
        isForming: false,
        isShattering: false,
        shatterVx: (Math.random() - 0.5) * 35, // More explosive
        shatterVy: (Math.random() - 0.5) * 35 - 15,
        radius: Math.random() * 2.5 + 1.5, // Slightly larger
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let mouse = { x: -1000, y: -1000 };
    const handleMouse = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouse);

    // Provide an API for LoaderSequence to trigger phases
    // We will apply a global scale for the "Heartbeat" pulse
    let globalScale = { val: 1 };

    (window as any).triggerBrainForm = () => {
      particles.forEach((p, i) => {
        gsap.to(p, {
          x: p.targetX,
          y: p.targetY,
          duration: 1.5,
          ease: "expo.inOut", // More aggressive snap
          onStart: () => { p.isForming = true; }
        });
      });
      // The Heartbeat pulse effect when it forms
      gsap.to(globalScale, {
        val: 1.1,
        duration: 0.15,
        yoyo: true,
        repeat: 3,
        delay: 1.4, // Right as they snap into place
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
      // MOTION BLUR TRAIL EFFECT (Instead of clearRect)
      ctx.fillStyle = "rgba(2, 6, 23, 0.25)"; // Matches slate-950 roughly
      ctx.fillRect(0, 0, width, height);

      // Apply global heartbeat scale
      ctx.save();
      if (globalScale.val !== 1) {
        ctx.translate(width / 2, height / 2);
        ctx.scale(globalScale.val, globalScale.val);
        ctx.translate(-width / 2, -height / 2);
      }

      // Add intense glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#818cf8";
      ctx.lineWidth = 0.8;

      for (let i = 0; i < NUM_PARTICLES; i++) {
        const p1 = particles[i];

        // Physics
        if (!p1.isForming && !p1.isShattering) {
          p1.x += p1.vx;
          p1.y += p1.vy;
          if (p1.x < 0 || p1.x > width) p1.vx *= -1;
          if (p1.y < 0 || p1.y > height) p1.vy *= -1;

          // Aggressive Mouse repel
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) { // Larger repel radius
            p1.x += dx * 0.1;
            p1.y += dy * 0.1;
          }
        } else if (p1.isShattering) {
          p1.x += p1.shatterVx;
          p1.y += p1.shatterVy;
          p1.shatterVy += 1.2; // Heavier gravity
        }

        // Connections
        if (!p1.isShattering) {
          for (let j = i + 1; j < NUM_PARTICLES; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distSq = dx * dx + dy * dy;

            // Connect if close
            const connectionThreshold = p1.isForming ? 1500 : 12000;
            if (distSq < connectionThreshold) {
              const alpha = 1 - Math.sqrt(distSq) / Math.sqrt(connectionThreshold);
              ctx.strokeStyle = p1.color.replace(")", `, ${alpha * 0.6})`).replace("rgb", "rgba"); // Attempt to use particle color
              // Fallback to solid color with alpha if hex is used
              // Wait, colors are hex! Let's just use a uniform glowing color
              ctx.strokeStyle = `rgba(129, 140, 248, ${alpha * 0.8})`; 
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }

        // Draw dot
        ctx.fillStyle = p1.color;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
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
