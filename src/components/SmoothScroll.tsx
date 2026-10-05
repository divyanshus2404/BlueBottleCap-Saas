import React from "react";

/**
 * Native scroll.
 *
 * This used to wrap the whole app in Lenis (JS-driven smooth-scroll). For a
 * study tool people use for hours every day, hijacked scrolling is the wrong
 * call: it adds latency, fights the trackpad/touch momentum students expect,
 * and feels worst on the mid-range Android phones that are most of the
 * audience. Native scrolling is snappier and calmer, which is the whole point
 * of the "minimal for daily use" direction.
 *
 * Kept as a passthrough component so the mount in ClientLayout doesn't need to
 * change. If a marketing page ever wants Lenis again, scope it to that page
 * rather than the entire app.
 */
export const SmoothScroll: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
