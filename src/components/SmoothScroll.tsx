import React, { useEffect } from "react";
import Lenis from "lenis";

export const SmoothScroll: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const lenis = new Lenis({ 
      lerp: 0.08, // Buttery smooth easing
      smoothWheel: true
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};
