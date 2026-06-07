"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const SplitTextReveal: React.FC<{ text: string, className?: string, delay?: number }> = ({ text, className = "", delay = 0 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const words = containerRef.current.querySelectorAll('.split-word');
    
    gsap.fromTo(words, 
      { y: 120, opacity: 0, rotateZ: 8 },
      {
        y: 0,
        opacity: 1,
        rotateZ: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.04,
        delay: delay,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, [delay]);

  return (
    <div ref={containerRef} className={`flex flex-wrap gap-x-3 gap-y-1 justify-center ${className}`}>
      {text.split(' ').map((word, i) => (
        <div key={i} className="overflow-hidden inline-flex">
          <span className="split-word inline-block origin-bottom-left will-change-transform">{word}</span>
        </div>
      ))}
    </div>
  );
};
