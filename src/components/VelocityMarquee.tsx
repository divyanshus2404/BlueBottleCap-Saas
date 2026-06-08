"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const VelocityMarquee: React.FC<{ text: string, className?: string }> = ({ text, className = "" }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!trackRef.current) return;
    
    let direction = -1; 
    let xPercent = 0;
    let speedMultiplier = 1;
    let animationFrameId: number;
    
    const animate = () => {
      if (!trackRef.current) return;
      if (xPercent <= -50) {
        xPercent = 0;
      } else if (xPercent > 0) {
        xPercent = -50;
      }
      gsap.set(trackRef.current, { xPercent: xPercent });
      xPercent += 0.08 * direction * speedMultiplier;
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    ScrollTrigger.create({
      onUpdate: (self) => {
        direction = self.direction === 1 ? -1 : 1;
        speedMultiplier = 1 + Math.abs(self.getVelocity() / 100);
        
        gsap.to({ speed: speedMultiplier }, {
          speed: 1,
          duration: 0.8,
          ease: "power3.out",
          onUpdate: function() {
            speedMultiplier = this.targets()[0].speed;
          }
        });
      }
    });
    
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className={`w-full overflow-hidden flex whitespace-nowrap select-none border-y border-border-subtle py-6 bg-surface-solid ${className}`}>
      <div ref={trackRef} className="flex gap-16 pr-16 items-center min-w-max">
        <h1 className="text-7xl md:text-[9rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-300 tracking-tighter uppercase">{text}</h1>
        <h1 className="text-7xl md:text-[9rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-300 tracking-tighter uppercase">{text}</h1>
        <h1 className="text-7xl md:text-[9rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-300 tracking-tighter uppercase">{text}</h1>
        <h1 className="text-7xl md:text-[9rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-300 tracking-tighter uppercase">{text}</h1>
      </div>
    </div>
  );
};
