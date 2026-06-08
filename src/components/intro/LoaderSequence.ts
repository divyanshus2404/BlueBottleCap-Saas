import gsap from "gsap";

export const introState = {
  particleOpacity: 0,
  convergenceProgress: 0,
  scale: 1,
  rotationSpeed: 0.05
};

export const runIntro = () => {
  const tl = gsap.timeline();

  const overlay = document.getElementById("intro-overlay");
  const heroContent = document.querySelectorAll(".hero-reveal-element");

  // Initial UI state
  gsap.set(heroContent, { opacity: 0, y: 40 });
  
  // 0.2s - Knowledge particles appear
  tl.to(introState, {
    particleOpacity: 0.12,
    duration: 0.6,
    ease: "power2.out",
  }, 0.2);

  // 0.8s - Subtle intelligence kick (Rotation slows, alignment starts)
  tl.to(introState, {
    rotationSpeed: 0.01,
    duration: 0.4,
    ease: "power2.out"
  }, 0.8);

  // 1.2s - MAGNET EFFECT (pull to center)
  tl.to(introState, {
    convergenceProgress: 1,
    duration: 0.4,
    ease: "power4.inOut",
  }, 1.2);

  // 1.6s - FORMATION (Brain shape) implicitly held here

  // 2.0s - DISSOLVE
  tl.to(introState, {
    scale: 0,
    particleOpacity: 0,
    duration: 0.2,
    ease: "power2.inOut",
  }, 2.0);

  tl.to(overlay, {
    opacity: 0,
    duration: 0.6,
    ease: "power2.inOut",
    onComplete: () => {
      if (overlay) overlay.style.display = 'none';
    }
  }, 2.0);

  // 2.2s - HERO REVEAL
  tl.to(heroContent, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out"
  }, 2.2);

  return tl;
};
