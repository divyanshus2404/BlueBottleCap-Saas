import React from "react";

/**
 * Generic page-loading skeleton. Renders a neutral title placeholder and a
 * grid of blank cards so route transitions and Firestore-hydrating pages
 * don't flash white. Kept intentionally light — no animation delay, no
 * fancy shimmer — so first paint stays fast.
 */
export function PageSkeleton({
  title = true,
  rows = 3,
  cols = 2,
  className = "",
}: {
  title?: boolean;
  rows?: number;
  cols?: 1 | 2 | 3;
  className?: string;
}) {
  const colClass = cols === 1 ? "grid-cols-1" : cols === 3 ? "grid-cols-3" : "grid-cols-2";
  return (
    <div className={`bbc mx-auto max-w-[820px] px-7 py-12 ${className}`} aria-busy="true" aria-live="polite">
      <div className="animate-pulse space-y-6">
        {title && (
          <div>
            <div className="h-3 w-24 rounded bg-[var(--color-line)]" />
            <div className="mt-4 h-9 w-2/3 rounded bg-[var(--color-line)]" />
            <div className="mt-3 h-4 w-1/2 rounded bg-[var(--color-line)]" />
          </div>
        )}
        <div className={`grid gap-4 ${colClass}`}>
          {Array.from({ length: rows * cols }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)]" />
          ))}
        </div>
      </div>
    </div>
  );
}
