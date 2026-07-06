"use client";

import { useState, useEffect, useRef } from "react";

export function useCountUp(target: number, duration = 1200, start = true): number {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (!start || target === 0) {
      setValue(target);
      return;
    }
    setValue(0);
    startTime.current = null;

    let raf: number;
    function step(ts: number) {
      if (!startTime.current) startTime.current = ts;
      const progress = Math.min((ts - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);

  return value;
}
