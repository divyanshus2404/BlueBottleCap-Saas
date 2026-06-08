import gsap from "gsap";

export const runIntro = () => {
  const tl = gsap.timeline();

  const overlay = document.getElementById("intro-overlay");
  const heroContent = document.querySelectorAll(".hero-reveal-element");
  const particles = document.querySelectorAll(".svg-particle");

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
  // We use a separate tween that isn't on the main timeline so it can loop
  const idleTween = gsap.to(particles, {
    x: "random(-40, 40)",
    y: "random(-30, 30)",
    rotation: "random(-20, 20)",
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  // 1.5s - THE MAGIC (merge effect)
  // Attract to center and disappear
  tl.to(particles, {
    x: 0, // Assuming container is relative/absolute and 0 is their initial origin...
    // Wait, x/y to center: since they are absolute positioned randomly,
    // getting them to the exact screen center requires calculating offset.
    // Instead, we can use top/left: 50% for the merge.
    top: "50%",
    left: "50%",
    scale: 0,
    opacity: 0,
    stagger: 0.02, // The user pseudocode says 0.05
    duration: 1.2,
    ease: "power4.inOut",
    onStart: () => {
      idleTween.kill(); // Stop the random floating when they start merging
    }
  }, 1.5);

  // Dissolve the dark overlay as they collapse
  tl.to(overlay, {
    opacity: 0,
    duration: 0.8,
    ease: "power2.inOut",
    onComplete: () => {
      if (overlay) overlay.style.display = 'none';
      const container = document.getElementById("svg-particles-container");
      if (container) container.style.display = 'none';
    }
  }, 2.0);

  // 2.2s - HERO REVEAL (Hero text becomes focus)
  tl.to(heroContent, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out"
  }, 2.2);

  return tl;
};
