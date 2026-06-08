"use client";
import React, { useEffect, useState, useRef } from "react";
import { Book, PenTool, BookOpen, Calculator, GraduationCap, FileText, FlaskConical, Atom, Globe, Code2 } from "lucide-react";
import gsap from "gsap";

const icons = [Book, PenTool, BookOpen, Calculator, GraduationCap, FileText, FlaskConical, Atom, Globe, Code2];

export default function SvgParticles() {
  const [particles, setParticles] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate 25 random particles
    const generated = [...Array(25)].map((_, i) => {
      const IconComp = icons[Math.floor(Math.random() * icons.length)];
      return {
        id: i,
        Icon: IconComp,
        x: Math.random() * 100, // percentage string
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        scale: 0.6 + Math.random() * 0.8,
        // unique parallax speed for magnetic effect
        speed: 0.02 + Math.random() * 0.05,
      };
    });
    setParticles(generated);
  }, []);

  useEffect(() => {
    // Magnetic mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      // We only apply this while the particles are not merging.
      // LoaderSequence handles the merge, so we'll just track global mouse.
      const { innerWidth, innerHeight } = window;
      const mouseX = e.clientX - innerWidth / 2;
      const mouseY = e.clientY - innerHeight / 2;

      // We'll target the wrappers
      const wrappers = document.querySelectorAll(".magnetic-wrapper");
      wrappers.forEach((el, index) => {
        const speed = particles[index]?.speed || 0.05;
        // Move opposite to mouse for a floating parallax feel
        gsap.to(el, {
          x: -mouseX * speed,
          y: -mouseY * speed,
          duration: 1,
          ease: "power2.out",
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [particles]);

  if (particles.length === 0) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[60] pointer-events-none overflow-hidden flex items-center justify-center" id="svg-particles-container">
      {/* The shockwave element, positioned exactly at center */}
      <div 
        id="shockwave" 
        className="absolute w-4 h-4 rounded-full border-[2px] border-white/80 opacity-0"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      />
      
      {particles.map((p) => (
        <div
          key={p.id}
          className="magnetic-wrapper absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
        >
          <div
            className="svg-particle opacity-0 flex items-center justify-center"
            style={{
              transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
              color: "rgba(255, 255, 255, 0.4)", // White with low opacity initially
              transformOrigin: "center center",
            }}
          >
            <p.Icon className="w-8 h-8 stroke-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
