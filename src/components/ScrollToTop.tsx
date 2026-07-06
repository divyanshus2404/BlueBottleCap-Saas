"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="fixed bottom-20 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-blue-ink)] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl active:scale-95"
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}
