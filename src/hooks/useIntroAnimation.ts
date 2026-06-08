import { useEffect } from "react";
import { runIntro } from "../components/intro/LoaderSequence";

export default function useIntroAnimation() {
  useEffect(() => {
    // Only run once per session to avoid fatiguing users
    const hasSeenIntro = sessionStorage.getItem("bluebottlecap_intro_played");
    
    if (!hasSeenIntro) {
      // Ensure components are mounted then start sequence
      setTimeout(() => {
        runIntro();
        sessionStorage.setItem("bluebottlecap_intro_played", "true");
      }, 100);
    } else {
      // If already played, immediately hide overlay and show content
      const overlay = document.getElementById("intro-overlay");
      const heroContent = document.querySelectorAll(".hero-reveal-element");
      
      if (overlay) overlay.style.display = "none";
      heroContent.forEach((el: any) => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
      
      const canvasContainer = document.getElementById("intro-canvas-container");
      if (canvasContainer) canvasContainer.style.display = "none";
    }
  }, []);
}
