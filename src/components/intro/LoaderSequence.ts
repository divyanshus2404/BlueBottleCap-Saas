import gsap from "gsap";

export const runIntro = () => {
  const tl = gsap.timeline();

  const overlay = document.getElementById("intro-overlay");
  const heroContent = document.querySelectorAll(".hero-reveal-element");
  const particles = document.querySelectorAll(".svg-particle");
  const wrappers = document.querySelectorAll(".magnetic-wrapper");
  const shockwave = document.getElementById("shockwave");

  // Initial UI state - hide text
  gsap.set(heroContent, { opacity: 0, y: 40 });
  
  // 0.2s - Soft floating elements appear
  tl.to(particles, {
    opacity: 0.15, // Very low opacity
    duration: 0.6,
    stagger: 0.02,
    ease: "power2.out",
  }, 0.2);

  // Floating idle animation (continuous until merge)
  const idleTween = gsap.to(particles, {
    x: "random(-40, 40)",
    y: "random(-30, 30)",
    rotation: "random(-45, 45)",
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  // 1.5s - THE MAGIC (Hyperspace Stretch & Collapse)
  // Pull the wrappers to the center
  tl.to(wrappers, {
    top: "50%",
    left: "50%",
    x: 0,
    y: 0,
    duration: 1.2,
    stagger: 0.02,
    ease: "power4.inOut",
    onStart: () => {
      // We don't necessarily need to kill idleTween if we're animating wrappers,
      // but it's cleaner. However, we're going to apply stretch to particles.
      idleTween.kill(); 
    }
  }, 1.5);

  // Animate the particles themselves to stretch and dissolve
  tl.to(particles, {
    scaleX: 3, // Hyperspace stretch
    scaleY: 0.1, // Flatten
    scale: 0, // Eventually vanish
    rotation: "+=90", // Spin into the vortex
    opacity: 0,
    duration: 1.2,
    stagger: 0.02,
    ease: "power4.inOut",
  }, 1.5);

  // 2.3s (When they fully collapse) -> THE SHOCKWAVE REVEAL
  // Explode the ring
  if (shockwave) {
    tl.to(shockwave, {
      opacity: 1,
      duration: 0.1,
    }, 2.3)
    .to(shockwave, {
      scale: 150, // Massive expansion
      borderWidth: 0, // Thins out as it expands
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    }, 2.4);
  }

  // Dissolve the dark overlay pushed slightly back by the shockwave
  tl.to(overlay, {
    opacity: 0,
    duration: 0.6,
    ease: "power2.inOut",
    onComplete: () => {
      if (overlay) overlay.style.display = 'none';
      const container = document.getElementById("svg-particles-container");
      if (container) container.style.display = 'none';
    }
  }, 2.4);

  // 2.5s - HERO REVEAL (Hero text becomes focus)
  tl.to(heroContent, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out"
  }, 2.6);

  return tl;
};
