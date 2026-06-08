"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on desktop
    if (window.innerWidth < 1024) return;
    
    setIsVisible(true);
    
    const ring = cursorRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;
    
    document.body.style.cursor = "none";
    
    let hasMoved = false;

    const ringX = gsap.quickTo(ring, "x", { duration: 0.15, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.15, ease: "power3.out" });
    
    const dotX = gsap.quickTo(dot, "x", { duration: 0.05, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.05, ease: "power3.out" });

    const moveCursor = (e: MouseEvent) => {
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);

      // Fade in cursor on first move to prevent it from getting stuck at 0,0
      if (!hasMoved) {
        hasMoved = true;
        gsap.to([ring, dot], { opacity: 1, duration: 0.3 });
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      if (!hasMoved) return; // Don't trigger hover effects before first move

      const target = e.target as HTMLElement;
      if (target.closest("a") || target.closest("button") || target.closest(".magnetic-target") || target.closest("[role='button']")) {
        gsap.to(ring, { scale: 1.5, opacity: 0.4, borderColor: "#ffffff", duration: 0.3 });
        gsap.to(dot, { scale: 0, opacity: 0, duration: 0.3 });
      } else {
        gsap.to(ring, { scale: 1, opacity: 1, borderColor: "#6366f1", duration: 0.3 });
        gsap.to(dot, { scale: 1, opacity: 1, duration: 0.3 });
      }
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleMouseOver);
      document.body.style.cursor = "auto";
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-brand-cobalt pointer-events-none z-[9999] transform -translate-x-1/2 -translate-y-1/2 opacity-0"
        style={{ willChange: "transform" }}
      />
      <div 
        ref={dotRef} 
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-brand-cobalt pointer-events-none z-[9999] transform -translate-x-1/2 -translate-y-1/2 opacity-0"
        style={{ willChange: "transform" }}
      />
    </>
  );
};
