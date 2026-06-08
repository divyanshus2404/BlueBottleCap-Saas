import { useEffect } from "react";
import { runIntro } from "../components/intro/LoaderSequence";

export default function useIntroAnimation() {
  useEffect(() => {
    // Force run intro for now
    const overlay = document.getElementById("intro-overlay");
    if (overlay) overlay.style.display = "block";
    
    setTimeout(() => {
      runIntro();
    }, 100);
  }, []);
}
