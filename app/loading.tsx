import { Loader2 } from "lucide-react";

// Route-level loading UI. Next.js shows this instantly on navigation while the
// page/data resolves, so users never stare at a blank screen mid-transition.
// Server component — no client JS needed.

export default function Loading() {
  return (
    <div className="bbc flex min-h-[70vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-7 w-7 animate-spin text-[var(--color-blue-ink)]" strokeWidth={1.8} />
      <p className="bbc-mono text-[11.5px] uppercase tracking-[.2em] text-[var(--color-ink-faint)]">Loading</p>
    </div>
  );
}
