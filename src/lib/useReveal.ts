"use client";

import { useEffect, useRef, type RefObject } from "react";

// Shared scroll-reveal wiring for interior pages — same behaviour as the
// landing page's inline observer: each `.bbc-reveal` under the returned
// ref fades up once when it enters the viewport (CSS in globals.css).
//
// Only put `.bbc-reveal` on elements that exist at mount. Elements added
// later (filtered lists, tab panels) are never observed and would stay
// invisible.
export function useReveal<T extends HTMLElement>(): RefObject<T | null> {
  const rootRef = useRef<T>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("bbc-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    root.querySelectorAll<HTMLElement>(".bbc-reveal").forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i, 6) * 60}ms`;
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return rootRef;
}
