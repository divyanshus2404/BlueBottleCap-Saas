"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cursorRef.current) return;
    
    // Hide default cursor to use our custom one
    document.body.style.cursor = "none";
    
    // QuickTo for high performance 60fps tracking
    const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.2, ease: "power3" });
    const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.2, ease: "power3" });

    const moveCursor = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const handleMouseEnter = () => {
      gsap.to(cursorRef.current, { scale: 3, duration: 0.3, ease: "power3.out" });
    };
    
    const handleMouseLeave = () => {
      gsap.to(cursorRef.current, { scale: 1, duration: 0.3, ease: "power3.out" });
    };

    window.addEventListener("mousemove", moveCursor);

    // Attach listeners to interactive elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a") || target.closest("button") || target.closest(".magnetic-target")) {
        handleMouseEnter();
      } else {
        handleMouseLeave();
      }
    };
    
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleMouseOver);
      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <div 
      ref={cursorRef} 
      className="fixed top-0 left-0 w-4 h-4 rounded-full bg-white pointer-events-none z-[9999] mix-blend-difference transform -translate-x-1/2 -translate-y-1/2"
      style={{ willChange: "transform" }}
    />
  );
};
