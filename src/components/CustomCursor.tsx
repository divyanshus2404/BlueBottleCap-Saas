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
    
    // Set initial transform properties to avoid conflicts later
    gsap.set(ring, { xPercent: -50, yPercent: -50, transformOrigin: "center center" });
    gsap.set(dot, { xPercent: -50, yPercent: -50, transformOrigin: "center center" });
    
    document.body.style.cursor = "none";
    
    let hasMoved = false;
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let ringPos = { x: mouse.x, y: mouse.y };
    let dotPos = { x: mouse.x, y: mouse.y };

    const ringX = gsap.quickSetter(ring, "x", "px");
    const ringY = gsap.quickSetter(ring, "y", "px");
    const dotX = gsap.quickSetter(dot, "x", "px");
    const dotY = gsap.quickSetter(dot, "y", "px");

    const moveCursor = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (!hasMoved) {
        hasMoved = true;
        ringPos.x = mouse.x; ringPos.y = mouse.y;
        dotPos.x = mouse.x; dotPos.y = mouse.y;
        gsap.to([ring, dot], { opacity: 1, duration: 0.4 });
      }
    };

    // Smooth Interpolation Loop
    const tickerFunction = () => {
      // The magic Awwwards smooth interpolation math
      ringPos.x += (mouse.x - ringPos.x) * 0.15;
      ringPos.y += (mouse.y - ringPos.y) * 0.15;
      
      // Dot follows almost instantly but still smooth
      dotPos.x += (mouse.x - dotPos.x) * 0.6;
      dotPos.y += (mouse.y - dotPos.y) * 0.6;
      
      ringX(ringPos.x);
      ringY(ringPos.y);
      dotX(dotPos.x);
      dotY(dotPos.y);
    };
    
    gsap.ticker.add(tickerFunction);

    let isHoveringButton = false;

    const handleMouseOver = (e: MouseEvent) => {
      if (!hasMoved) return;
      const target = e.target as HTMLElement;
      
      // Button / Magnetic Links
      if (target.closest("a") || target.closest("button") || target.closest(".magnetic-target") || target.closest("[role='button']")) {
        isHoveringButton = true;
        gsap.to(ring, { scale: 1.5, background: "rgba(255, 255, 255, 0.1)", duration: 0.3, ease: "power2.out" });
        gsap.to(dot, { scale: 0, opacity: 0, duration: 0.3, ease: "power2.out" });
      } 
      // Text hover mode (grow the ring lightly)
      else if (target.closest("p") || target.closest("h1") || target.closest("h2") || target.closest("h3") || target.closest("span")) {
        isHoveringButton = false;
        gsap.to(ring, { scale: 2.0, background: "transparent", duration: 0.3, ease: "power2.out" });
        gsap.to(dot, { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" });
      }
      // Default state
      else {
        isHoveringButton = false;
        gsap.to(ring, { scale: 1, background: "transparent", duration: 0.3, ease: "power2.out" });
        gsap.to(dot, { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" });
      }
    };

    const handleMouseDown = () => {
      if (!hasMoved) return;
      gsap.to(ring, { scale: isHoveringButton ? 1.2 : 0.7, duration: 0.15, ease: "power2.inOut" });
      gsap.to(dot, { scale: isHoveringButton ? 0 : 0.5, duration: 0.15, ease: "power2.inOut" });
    };

    const handleMouseUp = () => {
      if (!hasMoved) return;
      gsap.to(ring, { scale: isHoveringButton ? 1.5 : 1, duration: 0.3, ease: "elastic.out(1, 0.4)" });
      gsap.to(dot, { scale: isHoveringButton ? 0 : 1, duration: 0.3, ease: "elastic.out(1, 0.4)" });
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      gsap.ticker.remove(tickerFunction);
      document.body.style.cursor = "auto";
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-white pointer-events-none z-[9998] mix-blend-difference"
        style={{ opacity: 0 }}
      />
      <div 
        ref={dotRef} 
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-white pointer-events-none z-[9999] mix-blend-difference"
        style={{ opacity: 0 }}
      />
    </>
  );
};
