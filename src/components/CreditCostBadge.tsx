import React from "react";
import { Zap } from "lucide-react";
import { creditCost } from "@/src/lib/resourceCredits";

/**
 * Shows what a resource costs before a student spends on it — the other half of
 * the credit wallet (the balance lives in the nav). Reads straight from the
 * catalog so the price shown always matches the price charged.
 *
 * Free resources (cost 0) render a calm "Free" chip so the daily-study core
 * never looks like it's gated behind credits.
 */
export const CreditCostBadge: React.FC<{
  resourceId: string;
  className?: string;
}> = ({ resourceId, className = "" }) => {
  const cost = creditCost(resourceId);

  if (cost <= 0) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-[var(--color-paper)] px-2 py-0.5 text-[10.5px] font-bold text-[var(--color-ink-soft)] ${className}`}
      >
        Free
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-[var(--color-blue-wash)] px-2 py-0.5 text-[10.5px] font-bold text-[var(--color-blue-ink)] ${className}`}
      title={`Uses ${cost} credit${cost === 1 ? "" : "s"} from your balance`}
    >
      <Zap className="h-3 w-3" />
      {cost} {cost === 1 ? "credit" : "credits"}
    </span>
  );
};
