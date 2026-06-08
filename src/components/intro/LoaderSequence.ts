import gsap from "gsap";

export const runIntro = () => {
  const tl = gsap.timeline();

  const overlay = document.getElementById("intro-overlay");
  const heroContent = document.querySelectorAll(".hero-reveal-element");

  // Initial UI state - hide text
  gsap.set(heroContent, { opacity: 0, y: 40 });
  
  // 1.5s - THE MAGIC: Neural Constellation forms the Brain
  tl.add(() => {
    if ((window as any).triggerBrainForm) {
      (window as any).triggerBrainForm();
    }
  }, 1.5);

  // 3.0s - THE SHATTER: The Brain holds for 1.5s, then shatters
  tl.add(() => {
    if ((window as any).triggerBrainShatter) {
      (window as any).triggerBrainShatter();
    }
  }, 3.0);

  // Dissolve the dark overlay as it shatters
  tl.to(overlay, {
    opacity: 0,
    duration: 0.8,
    ease: "power2.inOut",
    onComplete: () => {
      if (overlay) overlay.style.display = 'none';
      const container = document.getElementById("neural-canvas");
      if (container) {
        // Let shatter finish, then hide
        setTimeout(() => {
          container.style.display = 'none';
        }, 1000);
      }
    }
  }, 3.1);

  // 3.5s - HERO REVEAL (Hero text becomes focus)
  tl.to(heroContent, {
    opacity: 1,
    y: 0,
    duration: 1.0,
    stagger: 0.1,
    ease: "power3.out"
  }, 3.3);

  return tl;
};
