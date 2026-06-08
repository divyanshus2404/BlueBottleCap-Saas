"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";

const quotes = [
  "Consistency > Motivation",
  "Study smart, not hard",
  "Discipline builds freedom",
  "Focus is your superpower",
  "Deep work wins"
];

const topics = [
  "Data Structures",
  "Operating Systems",
  "Physics",
  "Chemistry",
  "Math",
  "AI Suite",
  "Mock Tests"
];

const fastWords = [
  "FASTER", "ACE EXAMS", "STUDY", "RETAIN", "PRACTICE", "LEARN", "SOLVE"
];

interface MarqueeLayerProps {
  items: string[];
  direction: 1 | -1;
  duration: number;
  className: string;
}

const MarqueeLayer: React.FC<MarqueeLayerProps> = ({ items, direction, duration, className }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!trackRef.current) return;
    
    // Initial setup: clone children to ensure seamless looping
    const track = trackRef.current;
    
    gsap.set(track, {
      xPercent: direction === 1 ? -50 : 0
    });

    const tl = gsap.to(track, {
      xPercent: direction === 1 ? 0 : -50,
      duration: duration,
      ease: "none",
      repeat: -1
    });

    // Attach timeline to element so parent can control timeScale
    (track as any).animation = tl;

    return () => {
      tl.kill();
    };
  }, [direction, duration]);

  const textString = items.join(" • ") + " • ";

  return (
    <div className={`w-full overflow-hidden flex whitespace-nowrap select-none ${className}`}>
      <div ref={trackRef} className="flex min-w-max items-center marquee-track">
        {/* Render twice for seamless loop */}
        <h1 className="tracking-tighter uppercase pr-12">{textString}</h1>
        <h1 className="tracking-tighter uppercase pr-12">{textString}</h1>
      </div>
    </div>
  );
};

export const HeroBackgroundMarquee = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Optional mouse parallax
    const moveX = gsap.quickTo(wrapperRef.current, "x", { duration: 0.8, ease: "power3.out" });
    const moveY = gsap.quickTo(wrapperRef.current, "y", { duration: 0.8, ease: "power3.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 40; // -20 to 20px
      const yPos = (clientY / window.innerHeight - 0.5) * 40;
      moveX(xPos);
      moveY(yPos);
    };

    const handleMouseEnter = () => {
      // Find all track animations and slow them down smoothly
      const tracks = container.querySelectorAll(".marquee-track");
      tracks.forEach(track => {
        const tl = (track as any).animation;
        if (tl) {
          gsap.to(tl, { timeScale: 0.15, duration: 0.8, ease: "power2.out" });
        }
      });
      // Slight blur reduction / focus effect
      gsap.to(wrapperRef.current, { scale: 1.02, opacity: 0.8, duration: 0.8, ease: "power2.out" });
    };

    const handleMouseLeave = () => {
      const tracks = container.querySelectorAll(".marquee-track");
      tracks.forEach(track => {
        const tl = (track as any).animation;
        if (tl) {
          gsap.to(tl, { timeScale: 1, duration: 0.8, ease: "power2.in" });
        }
      });
      gsap.to(wrapperRef.current, { scale: 1, opacity: 0.6, duration: 0.8, ease: "power2.in" });
    };

    window.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-0 flex flex-col justify-center items-center overflow-hidden pointer-events-auto opacity-100"
      style={{
        // Premium edge fading mask
        WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)"
      }}
    >
      <div 
        ref={wrapperRef}
        className="flex flex-col gap-6 -rotate-6 scale-110 w-[120%]"
        style={{ willChange: "transform" }}
      >
        {/* Layer 1: Slow, huge, highly transparent */}
        <MarqueeLayer 
          items={quotes} 
          direction={-1} 
          duration={80} 
          className="text-[8rem] md:text-[12rem] lg:text-[16rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-900/5 to-slate-800/5 dark:from-slate-200/5 dark:to-slate-100/5" 
        />
        
        {/* Layer 2: Medium speed, medium size, slight offset */}
        <MarqueeLayer 
          items={topics} 
          direction={1} 
          duration={45} 
          className="text-[5rem] md:text-[8rem] lg:text-[11rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900/10 to-slate-800/5 dark:from-slate-200/10 dark:to-slate-100/5 ml-12" 
        />
        
        {/* Layer 3: Fast, smaller, more visible */}
        <MarqueeLayer 
          items={fastWords} 
          direction={-1} 
          duration={25} 
          className="text-[4rem] md:text-[6rem] lg:text-[8rem] font-black text-transparent bg-clip-text bg-gradient-to-tr from-slate-900/15 to-slate-800/10 dark:from-slate-300/15 dark:to-slate-200/10" 
        />
      </div>
    </div>
  );
};
