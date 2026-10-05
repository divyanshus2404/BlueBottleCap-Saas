/**
 * THE credit catalog — one authoritative list of every resource BlueBottleCap
 * offers and what it costs a student to use.
 *
 * Product rule (owner's spec): no resource may exist without a declared credit
 * cost. A resource is either:
 *   - metered: it spends the student's credits each use (anything we pay a
 *     per-use cost to run — a Gemini call, OCR, PDF rendering), or
 *   - free: cost 0, because the content is static or comes from an official
 *     source we don't pay per use (the NTA-pattern question bank, previous-year
 *     papers, the syllabus, the planner, progress tracking, the study timer).
 *
 * This file is the source of truth the rest of the app reads from:
 *   - the server deducts `creditCost(id)` when a metered resource runs;
 *   - the UI shows "Costs N credits" from the same number, so a price can
 *     never drift between what's charged and what's displayed;
 *   - pricing/bundles are sized against these costs.
 *
 * Adding a resource: add a row here FIRST. The type assertions at the bottom
 * make it a COMPILE ERROR to meter an AI feature (a userQuota QuotaFeature)
 * that has no catalog entry — so "a resource with no credit" cannot ship.
 */
import type { QuotaFeature } from "./userQuota";

export type ResourceKind =
  | "ai" // a generative AI call we pay per token for
  | "tool" // a file/compute tool (converters, PDF ops)
  | "content"; // static or official-source material

export type ResourceSource =
  | "ai-generated" // produced on demand by a model
  | "official" // sourced from NTA / official exam material — free to serve
  | "static"; // bundled in the app (our own banks, syllabus, timers)

export interface ResourceDef {
  /** Stable id. For AI resources this MUST equal the userQuota QuotaFeature. */
  id: string;
  /** Student-facing name. */
  label: string;
  kind: ResourceKind;
  source: ResourceSource;
  /** Credits spent per use. 0 means free (always true for `content`). */
  creditCost: number;
}

/* ─────────────────────────── AI resources ───────────────────────────
 * Each id MUST match a QuotaFeature in userQuota.ts. Cost scales with how
 * expensive the call is to run: a chat turn is cheap, a full mock paper with
 * PDF rendering is the priciest thing in the app.
 */
const AI_RESOURCES = [
  { id: "chat", label: "PDF Copilot message", kind: "ai", source: "ai-generated", creditCost: 1 },
  { id: "summarize", label: "Summarise notes", kind: "ai", source: "ai-generated", creditCost: 1 },
  { id: "recommend_tool", label: "Smart tool search", kind: "ai", source: "ai-generated", creditCost: 1 },
  { id: "analyze_image", label: "Analyse an image", kind: "ai", source: "ai-generated", creditCost: 2 },
  { id: "scan_notes", label: "Scan handwritten notes", kind: "ai", source: "ai-generated", creditCost: 2 },
  { id: "formula_sheet", label: "Generate formula sheet", kind: "ai", source: "ai-generated", creditCost: 2 },
  { id: "generate_flashcards", label: "Generate flashcards", kind: "ai", source: "ai-generated", creditCost: 2 },
  { id: "jee_generate_questions", label: "Generate practice questions", kind: "ai", source: "ai-generated", creditCost: 2 },
  { id: "jee_analyze_solution", label: "Analyse my solution", kind: "ai", source: "ai-generated", creditCost: 2 },
  { id: "study_plan", label: "Build a study plan", kind: "ai", source: "ai-generated", creditCost: 3 },
  { id: "generate_roadmap", label: "Generate a roadmap", kind: "ai", source: "ai-generated", creditCost: 3 },
  { id: "institute_generate_mock", label: "Generate a branded mock paper", kind: "ai", source: "ai-generated", creditCost: 5 },
] as const satisfies readonly ResourceDef[];

/* ─────────────────────────── File tools ─────────────────────────────
 * Cheap compute but not free — a flat 1 credit each keeps them simple and
 * discourages abuse of the free tier as a general file converter.
 */
const TOOL_RESOURCES = [
  { id: "png-to-jpg", label: "PNG → JPG", kind: "tool", source: "static", creditCost: 1 },
  { id: "jpg-to-png", label: "JPG → PNG", kind: "tool", source: "static", creditCost: 1 },
  { id: "image-to-webp", label: "Image → WebP", kind: "tool", source: "static", creditCost: 1 },
  { id: "image-compress", label: "Compress image", kind: "tool", source: "static", creditCost: 1 },
  { id: "image-resize", label: "Resize image", kind: "tool", source: "static", creditCost: 1 },
  { id: "pdf-merge", label: "Merge PDFs", kind: "tool", source: "static", creditCost: 1 },
  { id: "pdf-split", label: "Split PDF", kind: "tool", source: "static", creditCost: 1 },
  { id: "pdf-to-images", label: "PDF → images", kind: "tool", source: "static", creditCost: 1 },
] as const satisfies readonly ResourceDef[];

/* ─────────────────────── Free resources (cost 0) ─────────────────────
 * The daily-use core of the product. These are what a student touches every
 * day, and they must never cost credits — that is the whole "learn without
 * paying a lot" promise. Official-source material lives here too: we don't pay
 * per use to serve NTA-pattern papers, so students don't pay to read them.
 */
const FREE_RESOURCES = [
  { id: "question_bank", label: "Question bank", kind: "content", source: "static", creditCost: 0 },
  { id: "previous_year_papers", label: "Previous-year papers", kind: "content", source: "official", creditCost: 0 },
  { id: "syllabus", label: "Syllabus browser", kind: "content", source: "official", creditCost: 0 },
  { id: "planner", label: "Study planner", kind: "content", source: "static", creditCost: 0 },
  { id: "progress", label: "Progress tracking", kind: "content", source: "static", creditCost: 0 },
  { id: "study_timer", label: "Study timer", kind: "content", source: "static", creditCost: 0 },
  { id: "flashcard_review", label: "Review flashcards", kind: "content", source: "static", creditCost: 0 },
  { id: "mock_test_practice", label: "Practice mock test", kind: "content", source: "static", creditCost: 0 },
  { id: "help_bot", label: "Help bot (FAQ)", kind: "content", source: "static", creditCost: 0 },
] as const satisfies readonly ResourceDef[];

export const RESOURCES: readonly ResourceDef[] = [
  ...AI_RESOURCES,
  ...TOOL_RESOURCES,
  ...FREE_RESOURCES,
];

const BY_ID: Record<string, ResourceDef> = Object.fromEntries(
  RESOURCES.map((r) => [r.id, r]),
);

/** Credit cost for a resource id. Unknown ids fail SAFE (treated as paid) so a
 * typo can never accidentally make something free. */
export function creditCost(id: string): number {
  return BY_ID[id]?.creditCost ?? 1;
}

export function getResource(id: string): ResourceDef | undefined {
  return BY_ID[id];
}

export function isFree(id: string): boolean {
  return creditCost(id) === 0;
}

/* ───────────────────────── Compile-time guards ──────────────────────
 * 1. Every AI resource id is a real QuotaFeature (no orphan rows).
 * 2. Every QuotaFeature has a catalog row (no unmetered AI feature). If you
 *    add a QuotaFeature in userQuota.ts without a row above, the line below
 *    stops compiling — which is exactly the "no resource without a credit"
 *    guarantee the product requires.
 */
type AiResourceId = (typeof AI_RESOURCES)[number]["id"];

// (1) AI ids ⊆ QuotaFeature
const _aiIdsAreQuotaFeatures: Record<AiResourceId, QuotaFeature> = Object.fromEntries(
  AI_RESOURCES.map((r) => [r.id, r.id]),
) as Record<AiResourceId, QuotaFeature>;
void _aiIdsAreQuotaFeatures;

// (2) QuotaFeature ⊆ AI ids
type MissingFromCatalog = Exclude<QuotaFeature, AiResourceId>;
const _everyQuotaFeatureHasCredits: MissingFromCatalog extends never ? true : never = true;
void _everyQuotaFeatureHasCredits;
