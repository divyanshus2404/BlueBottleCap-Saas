"use client";
import React, { useEffect, useState } from "react";
import { Book, PenTool, BookOpen, Calculator, GraduationCap, FileText, FlaskConical, Atom, Globe, Code2 } from "lucide-react";

const icons = [Book, PenTool, BookOpen, Calculator, GraduationCap, FileText, FlaskConical, Atom, Globe, Code2];

export default function SvgParticles() {
  const [particles, setParticles] = useState<any[]>([]);

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
      };
    });
    setParticles(generated);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden" id="svg-particles-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="svg-particle absolute opacity-0"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
            color: "rgba(255, 255, 255, 0.4)", // White with low opacity initially
          }}
        >
          <p.Icon className="w-8 h-8 stroke-1" />
        </div>
      ))}
    </div>
  );
}
