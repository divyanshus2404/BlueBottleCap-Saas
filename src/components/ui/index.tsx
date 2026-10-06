"use client";

/**
 * BlueBottleCap UI kit.
 *
 * Small set of token-driven primitives so every screen reads as one design
 * system instead of ad-hoc Tailwind per page. All colours/radius/shadow come
 * from the CSS variables defined in globals.css (the design-system layer) — no
 * raw hex here. Import from "@/src/components/ui".
 *
 * Kept intentionally tiny: Button, Card, Badge, StatTile, SectionHeading,
 * Input, Field. Add to it only when a pattern genuinely repeats.
 */

import React from "react";

/* Utility: join class names, dropping falsy. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ── Button ─────────────────────────────────────────────────────────── */
type ButtonVariant = "primary" | "secondary" | "ghost" | "dark";
type ButtonSize = "sm" | "md" | "lg";

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue-ink)] focus-visible:ring-offset-2";

const BTN_VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-blue-ink)] text-white shadow-sm hover:bg-[var(--color-blue-deep)]",
  secondary:
    "border border-[var(--color-line-strong)] bg-white text-[var(--color-ink)] hover:border-[var(--color-blue-ink)] hover:text-[var(--color-blue-ink)]",
  ghost:
    "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-card)] hover:text-[var(--color-ink)]",
  dark: "bg-[var(--color-ink)] text-white hover:opacity-90",
};

const BTN_SIZE: Record<ButtonSize, string> = {
  sm: "min-h-[40px] px-4 text-[13.5px]",
  md: "min-h-[44px] px-5 text-[14.5px]",
  lg: "min-h-[52px] px-7 text-[16px]",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  block = false,
  className,
  children,
  ...rest
}) => (
  <button
    className={cx(BTN_BASE, BTN_VARIANT[variant], BTN_SIZE[size], block && "w-full", className)}
    {...rest}
  >
    {children}
  </button>
);

/* ── Card ───────────────────────────────────────────────────────────── */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds hover lift + stronger shadow (for clickable cards). */
  interactive?: boolean;
  /** Padding preset. */
  pad?: "sm" | "md" | "lg" | "none";
}

const CARD_PAD = { none: "", sm: "p-4", md: "p-6", lg: "p-7 md:p-8" };

export const Card: React.FC<CardProps> = ({
  interactive = false,
  pad = "md",
  className,
  children,
  ...rest
}) => (
  <div
    className={cx(
      "rounded-[var(--radius-xl)] border border-[var(--color-line)] bg-white",
      CARD_PAD[pad],
      interactive &&
        "transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-blue-ink)]/40 hover:shadow-[var(--shadow-lg)]",
      className,
    )}
    {...rest}
  >
    {children}
  </div>
);

/* ── Badge ──────────────────────────────────────────────────────────── */
type BadgeTone = "blue" | "violet" | "emerald" | "amber" | "rose" | "neutral";

const BADGE_TONE: Record<BadgeTone, string> = {
  blue: "bg-[var(--color-blue-wash)] text-[var(--color-blue-ink)]",
  violet: "bg-[var(--color-accent-wash)] text-[var(--color-accent)]",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-600",
  neutral: "bg-[var(--color-paper-card)] text-[var(--color-ink-soft)]",
};

export const Badge: React.FC<{
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}> = ({ tone = "blue", className, children }) => (
  <span
    className={cx(
      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
      BADGE_TONE[tone],
      className,
    )}
  >
    {children}
  </span>
);

/* ── StatTile ───────────────────────────────────────────────────────── */
export const StatTile: React.FC<{
  value: React.ReactNode;
  label: string;
  className?: string;
}> = ({ value, label, className }) => (
  <div className={cx("text-center", className)}>
    <p className="text-[clamp(26px,3.4vw,38px)] font-extrabold leading-none tracking-[-.02em] text-[var(--color-blue-ink)]">
      {value}
    </p>
    <p className="mt-2 text-[12.5px] font-medium text-[var(--color-ink-soft)]">{label}</p>
  </div>
);

/* ── SectionHeading ─────────────────────────────────────────────────── */
export const SectionHeading: React.FC<{
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}> = ({ eyebrow, title, subtitle, align = "left", className }) => (
  <div className={cx(align === "center" ? "mx-auto max-w-[46ch] text-center" : "max-w-[46ch]", className)}>
    {eyebrow && (
      <p className="text-[12px] font-bold uppercase tracking-[.16em] text-[var(--color-blue-ink)]">{eyebrow}</p>
    )}
    <h2 className="mt-3 text-[clamp(28px,3.6vw,44px)] font-extrabold leading-[1.08] tracking-[-.03em] text-[var(--color-ink)]">
      {title}
    </h2>
    {subtitle && (
      <p className="mt-4 text-[16px] leading-[1.6] text-[var(--color-ink-soft)]">{subtitle}</p>
    )}
  </div>
);

/* ── Input + Field ──────────────────────────────────────────────────── */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => (
    <input
      ref={ref}
      className={cx(
        "w-full rounded-[var(--radius-md)] border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-[14.5px] text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-blue-ink)] focus:ring-2 focus:ring-[var(--color-blue-ink)]/15",
        className,
      )}
      {...rest}
    />
  ),
);
Input.displayName = "Input";

export const Field: React.FC<{
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, htmlFor, hint, children }) => (
  <label htmlFor={htmlFor} className="block">
    <span className="mb-1.5 block text-[13px] font-semibold text-[var(--color-ink)]">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-[12px] text-[var(--color-ink-faint)]">{hint}</span>}
  </label>
);
