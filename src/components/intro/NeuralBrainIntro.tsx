"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function NeuralBrainIntro() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Massively increased for a solid, dense volumetric brain
    const NUM_PARTICLES = 350;
    const particles: any[] = [];
    const signals: any[] = [];

    const targetPoints: { x: number; y: number }[] = [];
    
    // A much more realistic organic side-profile brain shape path
    // Centered around 0,0
    const brainSvgPath = `
      M -140 -20 
      C -140 -100, -80 -140, -20 -150 
      C 60 -160, 120 -130, 160 -80 
      C 200 -30, 210 40, 170 100 
      C 150 130, 110 160, 70 150 
      C 60 180, 20 190, 0 170 
      C -30 190, -70 180, -90 150 
      C -140 130, -160 60, -140 -20 Z
    `;
    const brainPath2D = new Path2D(brainSvgPath);

    // Generate points INSIDE the brain volume, not just on the edge
    const scale = Math.min(width, height) * 0.0018; // Dynamic scaling based on screen size
    const offsetX = width / 2;
    const offsetY = height / 2 - 30;

    // Temporary canvas to test isPointInPath since it works strictly with context
    const testCtx = document.createElement("canvas").getContext("2d");
    
    let generated = 0;
    // Bounding box for the brain path is roughly -160 to 210 in X, -160 to 190 in Y
    while (generated < NUM_PARTICLES && testCtx) {
      const rx = (Math.random() * 370 - 160);
      const ry = (Math.random() * 350 - 160);
      
      if (testCtx.isPointInPath(brainPath2D, rx, ry)) {
        targetPoints.push({
          x: rx * scale + offsetX,
          y: ry * scale + offsetY
        });
        generated++;
      }
    }

    const colors = [
      { fill: "#ffffff", strokeRGB: "255, 255, 255" },
      { fill: "#f8fafc", strokeRGB: "248, 250, 252" },
      { fill: "#e2e8f0", strokeRGB: "226, 232, 240" },
      { fill: "#60a5fa", strokeRGB: "96, 165, 250" }, // Neural blue
      { fill: "#38bdf8", strokeRGB: "56, 189, 248" }  // Bright cyan
    ];

    for (let i = 0; i < NUM_PARTICLES; i++) {
      const c = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        targetX: targetPoints[i].x,
        targetY: targetPoints[i].y,
        isForming: false,
        isShattering: false,
        shatterVx: (Math.random() - 0.5) * 35,
        shatterVy: (Math.random() - 0.5) * 35 - 15,
        radius: Math.random() * 2.0 + 1.0,
        fillColor: c.fill,
        strokeRGB: c.strokeRGB,
        neighbors: [] // populated later for signals
      });
    }

    // Pre-calculate nearest neighbors for each particle to shoot signals to
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const p1 = particles[i];
      for (let j = 0; j < NUM_PARTICLES; j++) {
        if (i === j) continue;
        const p2 = particles[j];
        const dx = p1.targetX - p2.targetX;
        const dy = p1.targetY - p2.targetY;
        if (dx * dx + dy * dy < 8000) {
          p1.neighbors.push(p2);
        }
      }
    }

    let mouse = { x: -1000, y: -1000 };
    const handleMouse = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });

    let globalScale = { val: 1 };
    let brainIsFullyFormed = false;

    (window as any).triggerBrainForm = () => {
      particles.forEach((p) => {
        gsap.to(p, {
          x: p.targetX,
          y: p.targetY,
          duration: 0.8,
          ease: "expo.inOut",
          onStart: () => { p.isForming = true; },
          onComplete: () => { brainIsFullyFormed = true; }
        });
      });
      gsap.to(globalScale, {
        val: 1.05,
        duration: 0.15,
        yoyo: true,
        repeat: 3,
        delay: 0.7,
        ease: "power2.inOut"
      });
    };

    (window as any).triggerBrainShatter = () => {
      particles.forEach(p => {
        p.isShattering = true;
      });
      brainIsFullyFormed = false; // Stop signals
    };

    let animationFrameId: number;

    const render = () => {
      // Dark trail effect
      ctx.fillStyle = "rgba(2, 6, 23, 0.35)"; 
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      if (globalScale.val !== 1) {
        ctx.translate(width / 2, height / 2);
        ctx.scale(globalScale.val, globalScale.val);
        ctx.translate(-width / 2, -height / 2);
      }

      ctx.lineWidth = 1.0;

      // Draw standard particle connections
      const sqConnectionThresholdForming = 5500; 
      const sqConnectionThresholdIdle = 10000;

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
          if (distSq < 25000) { 
            p1.x += dx * 0.005;
            p1.y += dy * 0.005;
            
            const alpha = 1 - (distSq / 25000);
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
              const alpha = (1 - (distSq / threshold)) * (p1.isForming ? 0.4 : 0.6); 
              ctx.strokeStyle = `rgba(${p1.strokeRGB}, ${alpha})`; 
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }

        ctx.fillStyle = p1.fillColor;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, 6.28318530718);
        ctx.fill();

        // SPURT SIGNALS
        if (brainIsFullyFormed && !p1.isShattering && Math.random() < 0.005 && signals.length < 80) {
          if (p1.neighbors.length > 0) {
            const neighbor = p1.neighbors[Math.floor(Math.random() * p1.neighbors.length)];
            signals.push({
              source: p1,
              target: neighbor,
              progress: 0,
              speed: Math.random() * 0.02 + 0.03
            });
          }
        }
      }

      // RENDER SIGNALS (Neural pulses)
      if (signals.length > 0) {
        for (let i = signals.length - 1; i >= 0; i--) {
          const s = signals[i];
          s.progress += s.speed;
          if (s.progress >= 1 || s.source.isShattering) {
            signals.splice(i, 1);
            continue;
          }
          const sx = s.source.x + (s.target.x - s.source.x) * s.progress;
          const sy = s.source.y + (s.target.y - s.source.y) * s.progress;
          
          // Glow effect for signals
          ctx.beginPath();
          ctx.arc(sx, sy, 3, 0, Math.PI * 2);
          ctx.fillStyle = "#38bdf8"; // bright neon cyan
          ctx.fill();

          // Trail
          ctx.beginPath();
          ctx.moveTo(s.source.x + (s.target.x - s.source.x) * (s.progress - 0.1), s.source.y + (s.target.y - s.source.y) * (s.progress - 0.1));
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = "rgba(56, 189, 248, 0.8)";
          ctx.lineWidth = 2.0;
          ctx.stroke();
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener('resize', handleResize);
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
