import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface CinematicIntroProps {
  onComplete: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Lock scroll
    document.body.style.overflow = "hidden";
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !isAnimating) {
        setIsAnimating(true);
        startZoomAnimation();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isAnimating]);

  const startZoomAnimation = () => {
    if (!containerRef.current || !imageRef.current || !textRef.current) return;

    // First fade out the instruction text
    gsap.to(textRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out",
    });

    // Then trigger the massive cinematic zoom into the monitor
    // The monitor in the image is roughly at left: 25%, top: 55%
    gsap.to(imageRef.current, {
      scale: 50,
      transformOrigin: "23% 53%",
      duration: 2.5,
      ease: "power4.inOut",
      onComplete: () => {
        // Fade the whole container out to reveal the actual site
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: onComplete,
        });
      },
    });
  };

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden touch-none"
    >
      {/* The background image wrapper */}
      <div 
        ref={imageRef}
        className="absolute w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/cinematic-intro.jpg')" }}
      >
        {/* The word "BlueBottleCap" floating on his screen. 
            Adjusting top/left slightly so it sits right on the glowing monitor. */}
        <div className="absolute top-[50%] left-[20%] -translate-y-1/2 -translate-x-1/2 rotate-[-5deg]">
          <h1 className="text-[8px] md:text-xs font-display font-black text-cyan-300 tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,1)] opacity-80 mix-blend-screen">
            BLUEBOTTLECAP
          </h1>
        </div>
      </div>

      {/* Foreground prompt text */}
      <div 
        ref={textRef}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10"
      >
        <div className="bg-black/50 backdrop-blur-md border border-white/10 px-8 py-3 rounded-full flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          <p className="font-mono text-sm tracking-widest text-white/90 animate-pulse">
            [ PRESS ENTER TO HACK IN ]
          </p>
        </div>
      </div>
    </div>
  );
};
