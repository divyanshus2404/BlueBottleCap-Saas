// Registry of tools available in the /tools hub. The hub renders this list and
// the AI recommendation endpoint searches against it, so every tool added here
// becomes both browsable and recommendable with no extra wiring.

export type ToolCategory = "image" | "pdf" | "text";

export interface ToolDef {
  id: string;
  name: string;
  desc: string;
  category: ToolCategory;
  // Plain-English search terms / synonyms the AI recommender uses to match
  // free-form user prompts ("make my pdf smaller" → pdf-compress).
  keywords: string[];
  emoji: string;
  // Free users get this many runs per day. -1 means unlimited (Pro only tools
  // should be marked separately via proOnly).
  freeRunsPerDay: number;
  // Hard byte cap for free tier (Pro lifts it to 50MB).
  freeMaxBytes: number;
  // If true, the tool is hidden from free users entirely.
  proOnly?: boolean;
}

export const FREE_MAX_BYTES_DEFAULT = 5 * 1024 * 1024; // 5MB free, 50MB Pro
export const PRO_MAX_BYTES = 50 * 1024 * 1024;
export const FREE_DAILY_RUNS = 3;

export const TOOLS: ToolDef[] = [
  {
    id: "png-to-jpg",
    name: "PNG → JPG",
    desc: "Convert PNG images to JPG with quality control.",
    category: "image",
    keywords: ["png", "jpg", "jpeg", "convert", "image", "format"],
    emoji: "🖼️",
    freeRunsPerDay: FREE_DAILY_RUNS,
    freeMaxBytes: FREE_MAX_BYTES_DEFAULT,
  },
  {
    id: "jpg-to-png",
    name: "JPG → PNG",
    desc: "Convert JPG images to PNG with transparency support.",
    category: "image",
    keywords: ["jpg", "jpeg", "png", "convert", "image", "format", "transparent"],
    emoji: "🌃",
    freeRunsPerDay: FREE_DAILY_RUNS,
    freeMaxBytes: FREE_MAX_BYTES_DEFAULT,
  },
  {
    id: "image-to-webp",
    name: "Image → WebP",
    desc: "Convert PNG or JPG to WebP for smaller file sizes.",
    category: "image",
    keywords: ["webp", "convert", "smaller", "compress", "web", "image"],
    emoji: "🪶",
    freeRunsPerDay: FREE_DAILY_RUNS,
    freeMaxBytes: FREE_MAX_BYTES_DEFAULT,
  },
  {
    id: "image-compress",
    name: "Image Compressor",
    desc: "Shrink image file size while keeping quality high.",
    category: "image",
    keywords: ["compress", "shrink", "smaller", "size", "quality", "image", "jpg", "png"],
    emoji: "🗜️",
    freeRunsPerDay: FREE_DAILY_RUNS,
    freeMaxBytes: FREE_MAX_BYTES_DEFAULT,
  },
  {
    id: "image-resize",
    name: "Image Resizer",
    desc: "Resize an image to a custom width / height.",
    category: "image",
    keywords: ["resize", "scale", "dimensions", "width", "height", "image"],
    emoji: "📐",
    freeRunsPerDay: FREE_DAILY_RUNS,
    freeMaxBytes: FREE_MAX_BYTES_DEFAULT,
  },
  {
    id: "pdf-merge",
    name: "PDF Merger",
    desc: "Combine multiple PDFs into a single file.",
    category: "pdf",
    keywords: ["pdf", "merge", "combine", "join", "concatenate"],
    emoji: "📚",
    freeRunsPerDay: FREE_DAILY_RUNS,
    freeMaxBytes: FREE_MAX_BYTES_DEFAULT,
  },
  {
    id: "pdf-split",
    name: "PDF Splitter",
    desc: "Split a PDF into individual pages or page ranges.",
    category: "pdf",
    keywords: ["pdf", "split", "extract", "pages", "separate"],
    emoji: "✂️",
    freeRunsPerDay: FREE_DAILY_RUNS,
    freeMaxBytes: FREE_MAX_BYTES_DEFAULT,
  },
  {
    id: "pdf-to-images",
    name: "PDF → Images",
    desc: "Export every PDF page as a PNG image.",
    category: "pdf",
    keywords: ["pdf", "image", "png", "convert", "export", "page"],
    emoji: "🖨️",
    freeRunsPerDay: FREE_DAILY_RUNS,
    freeMaxBytes: FREE_MAX_BYTES_DEFAULT,
  },
];

export function findTool(id: string): ToolDef | undefined {
  return TOOLS.find((t) => t.id === id);
}

export function toolsByCategory(): Record<ToolCategory, ToolDef[]> {
  return TOOLS.reduce((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {} as Record<ToolCategory, ToolDef[]>);
}
