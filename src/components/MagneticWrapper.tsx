"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export const MagneticWrapper: React.FC<{ children: React.ReactNode, strength?: number, className?: string }> = ({ children, strength = 40, className = "" }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    
    const magnetic = ref.current;
    
    const xTo = gsap.quickTo(magnetic, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(magnetic, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = magnetic.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      // Calculate how far the mouse is from the center, scale by strength
      xTo((clientX - centerX) * (strength / 100));
      yTo((clientY - centerY) * (strength / 100));
    };

    const handleMouseLeave = () => {
      // Snap back to 0 with elastic spring physics
      xTo(0);
      yTo(0);
    };

    magnetic.addEventListener("mousemove", handleMouseMove);
    magnetic.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      magnetic.removeEventListener("mousemove", handleMouseMove);
      magnetic.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={`inline-block magnetic-target ${className}`}>
      {children}
    </div>
  );
};
