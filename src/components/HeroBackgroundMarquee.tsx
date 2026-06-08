"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";

interface MarqueeRowProps {
  text: string;
  direction?: "left" | "right";
  baseSpeed?: number;
}

const MarqueeRow: React.FC<MarqueeRowProps> = ({ text, direction = "left", baseSpeed = 0.08 }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!trackRef.current) return;
    
    let xPercent = direction === "right" ? -50 : 0;
    let animationFrameId: number;
    const dirMulti = direction === "right" ? 1 : -1;
    
    // We'll attach a global hover slowdown
    let speedMultiplier = 1;
    
    const animate = () => {
      if (!trackRef.current) return;
      if (direction === "left" && xPercent <= -50) xPercent = 0;
      if (direction === "right" && xPercent >= 0) xPercent = -50;
      
      gsap.set(trackRef.current, { xPercent: xPercent });
      
      // Look up if parent group is hovered
      const parent = trackRef.current.closest('.hero-marquee-group');
      const isHovered = parent?.matches(':hover');
      
      // smooth slowdown
      if (isHovered) {
        speedMultiplier += (0.01 - speedMultiplier) * 0.05; // Slow down almost to a halt
      } else {
        speedMultiplier += (1 - speedMultiplier) * 0.05; // Back to 100% speed
      }
      
      xPercent += baseSpeed * dirMulti * speedMultiplier;
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [direction, baseSpeed]);

  return (
    <div className="w-full overflow-hidden flex whitespace-nowrap select-none">
      <div ref={trackRef} className="flex gap-16 pr-16 items-center min-w-max">
        <h1 className="text-[6rem] md:text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-200/50 to-slate-100/10 tracking-tighter uppercase">{text}</h1>
        <h1 className="text-[6rem] md:text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-200/50 to-slate-100/10 tracking-tighter uppercase">{text}</h1>
        <h1 className="text-[6rem] md:text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-200/50 to-slate-100/10 tracking-tighter uppercase">{text}</h1>
        <h1 className="text-[6rem] md:text-[10rem] lg:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-200/50 to-slate-100/10 tracking-tighter uppercase">{text}</h1>
      </div>
    </div>
  );
};

export const HeroBackgroundMarquee = () => {
  return (
    <div className="absolute inset-0 z-0 flex flex-col justify-center items-center overflow-hidden pointer-events-auto hero-marquee-group mix-blend-multiply opacity-60">
      <div className="scale-110 flex flex-col -mt-10">
        <MarqueeRow text="FASTER • ACE EXAMS • STUDY •" direction="left" baseSpeed={0.06} />
        <MarqueeRow text="PHYSICS • CHEMISTRY • MATH • AI SUITE •" direction="right" baseSpeed={0.05} />
        <MarqueeRow text="DOUBT SOLVING • FORMULA SHEETS •" direction="left" baseSpeed={0.07} />
      </div>
    </div>
  );
};
