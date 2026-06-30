"use client";

import React, { useMemo, useState } from "react";
import { Sparkles, Search, X, Lock } from "lucide-react";
import { TOOLS, ToolDef, ToolCategory, FREE_DAILY_RUNS, PRO_MAX_BYTES } from "@/src/lib/tools";
import { useGlobalState } from "@/src/context/GlobalStateContext";
import { useRouter } from "next/navigation";
import { getToolRunsToday, recordToolRun } from "@/src/lib/toolUsage";
import { ImageConverter } from "./tools/ImageConverter";
import { PdfMergeTool, PdfSplitTool, PdfToImagesTool } from "./tools/PdfTools";

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  image: "Image tools",
  pdf: "PDF tools",
  text: "Text tools",
};

export const ToolsHub: React.FC = () => {
  const router = useRouter();
  const { userStats, showToast } = useGlobalState();
  const isPro = userStats.activePlan === "Pro";

  const [filter, setFilter] = useState<"all" | ToolCategory>("all");
  const [query, setQuery] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[] | null>(null);
  const [openTool, setOpenTool] = useState<ToolDef | null>(null);

  const visible = useMemo(() => {
    let list = TOOLS;
    if (filter !== "all") list = list.filter((t) => t.category === filter);
    if (query.trim() && !aiSuggestions) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.desc.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.includes(q)),
      );
    }
    if (aiSuggestions && aiSuggestions.length > 0) {
      const order = new Map(aiSuggestions.map((id, i) => [id, i]));
      list = list
        .filter((t) => order.has(t.id))
        .sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
    }
    return list;
  }, [filter, query, aiSuggestions]);

  const askAi = async () => {
    const q = query.trim();
    if (!q) return;
    setAiBusy(true);
    setAiSuggestions(null);
    try {
      const resp = await fetch("/api/gemini/recommend-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await resp.json();
      if (Array.isArray(data?.toolIds) && data.toolIds.length > 0) {
        setAiSuggestions(data.toolIds);
      } else {
        showToast?.("No matching tool found — try different words.", "warning");
      }
    } catch (e) {
      showToast?.("AI search failed — using keyword filter instead.", "error");
    } finally {
      setAiBusy(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setAiSuggestions(null);
  };

  const handleOpen = (tool: ToolDef) => {
    if (tool.proOnly && !isPro) {
      router.push("/pricing");
      return;
    }
    setOpenTool(tool);
  };

  const tryRun = (tool: ToolDef): boolean => {
    if (isPro) return true;
    const used = getToolRunsToday(tool.id);
    if (used >= tool.freeRunsPerDay) {
      showToast?.(`Daily free limit reached (${tool.freeRunsPerDay}/day). Upgrade for unlimited.`, "warning");
      return false;
    }
    recordToolRun(tool.id);
    return true;
  };

  return (
    <div className="bbc relative min-h-screen overflow-hidden">
      <div className="bbc-grid" aria-hidden="true" />
      <div className="relative z-[2] mx-auto max-w-[1180px] px-7 py-16">
        <div className="mb-10 text-center">
          <p className="bbc-eyebrow">Tools</p>
          <h1 className="bbc-serif mx-auto mt-3 max-w-[20ch] text-[clamp(32px,4.4vw,52px)] leading-[1.06] tracking-[-.02em]">
            Every file tool, in one place.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] text-[var(--color-ink-soft)]">
            Convert, compress, merge, split. All in your browser — your files never leave your device.
          </p>
        </div>

        {/* AI search + filters */}
        <div className="mb-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-4">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-white px-3 py-2">
            <Sparkles className="h-4 w-4 text-[var(--color-blue-ink)]" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setAiSuggestions(null); }}
              onKeyDown={(e) => e.key === "Enter" && askAi()}
              placeholder="Describe what you need — e.g. 'make my pdf smaller' or 'png to jpg'"
              className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[var(--color-ink-faint)]"
            />
            {query && (
              <button onClick={clearSearch} aria-label="Clear" className="text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]">
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={askAi}
              disabled={!query.trim() || aiBusy}
              className="bbc-btn bbc-btn-primary px-3 py-1.5 text-[11px] disabled:opacity-50"
            >
              {aiBusy ? "Thinking…" : "Ask AI"}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {(["all", "image", "pdf"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full border px-3 py-1 text-[12px] font-semibold transition ${
                  filter === c
                    ? "border-[var(--color-blue-ink)] bg-[var(--color-blue-ink)] text-white"
                    : "border-[var(--color-line)] bg-white text-[var(--color-ink-soft)] hover:border-[var(--color-line-strong)]"
                }`}
              >
                {c === "all" ? "All tools" : CATEGORY_LABELS[c]}
              </button>
            ))}

            {aiSuggestions && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)] px-3 py-1 text-[11px] font-bold text-[var(--color-blue-ink)]">
                <Sparkles className="h-3 w-3" /> AI matched {aiSuggestions.length} {aiSuggestions.length === 1 ? "tool" : "tools"}
              </span>
            )}
          </div>
        </div>

        {/* Tool grid */}
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-12 text-center text-[var(--color-ink-soft)]">
            No tools match that. Try a broader description.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((tool) => {
              const used = isPro ? 0 : getToolRunsToday(tool.id);
              const left = isPro ? null : Math.max(0, tool.freeRunsPerDay - used);
              const blocked = !isPro && left === 0;
              const proGated = tool.proOnly && !isPro;
              return (
                <button
                  key={tool.id}
                  onClick={() => handleOpen(tool)}
                  className={`group relative flex flex-col items-start gap-3 rounded-2xl border bg-[var(--color-paper-card)] p-5 text-left transition hover:-translate-y-0.5 ${
                    proGated || blocked
                      ? "border-[var(--color-line)] opacity-80"
                      : "border-[var(--color-line)] hover:border-[var(--color-blue-ink)]"
                  }`}
                >
                  <div className="flex w-full items-start justify-between">
                    <span className="text-2xl">{tool.emoji}</span>
                    {proGated ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-blue-ink)] px-2 py-0.5 text-[10px] font-bold text-white">
                        <Lock className="h-3 w-3" /> Pro
                      </span>
                    ) : isPro ? (
                      <span className="rounded-full bg-[var(--color-blue-wash)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-blue-ink)]">
                        Unlimited
                      </span>
                    ) : (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        blocked ? "bg-red-100 text-red-700" : "bg-[var(--color-line)] text-[var(--color-ink-soft)]"
                      }`}>
                        {blocked ? "Limit hit" : `${left}/${tool.freeRunsPerDay} today`}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[var(--color-ink)] group-hover:text-[var(--color-blue-ink)]">{tool.name}</h3>
                    <p className="mt-1 text-[12.5px] text-[var(--color-ink-soft)]">{tool.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Free tier callout */}
        {!isPro && (
          <div className="mt-10 rounded-2xl border border-[var(--color-line)] bg-[var(--color-blue-wash)] p-6 text-center">
            <p className="text-[13px] text-[var(--color-ink-soft)]">
              <strong className="text-[var(--color-ink)]">Free tier:</strong> {FREE_DAILY_RUNS} runs per tool per day · 5 MB max.
              <button onClick={() => router.push("/pricing")} className="ml-2 font-bold text-[var(--color-blue-ink)] hover:underline">
                Get Pro for unlimited + {(PRO_MAX_BYTES / 1024 / 1024).toFixed(0)} MB files →
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Tool dialog */}
      {openTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--color-line)] px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{openTool.emoji}</span>
                <div>
                  <h2 className="bbc-serif text-[20px] tracking-[-.01em] text-[var(--color-ink)]">{openTool.name}</h2>
                  <p className="text-[12px] text-[var(--color-ink-faint)]">{openTool.desc}</p>
                </div>
              </div>
              <button onClick={() => setOpenTool(null)} aria-label="Close" className="rounded-full p-1 hover:bg-[var(--color-paper)]">
                <X className="h-5 w-5 text-[var(--color-ink-soft)]" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
              <ToolUI tool={openTool} isPro={isPro} onRun={() => tryRun(openTool)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ToolUI: React.FC<{ tool: ToolDef; isPro: boolean; onRun: () => boolean }> = ({ tool, isPro, onRun }) => {
  const maxBytes = isPro ? PRO_MAX_BYTES : tool.freeMaxBytes;
  switch (tool.id) {
    case "png-to-jpg":
      return <ImageConverter tool={tool} mode="format" targetFormat="image/jpeg" maxBytes={maxBytes} onRun={onRun} />;
    case "jpg-to-png":
      return <ImageConverter tool={tool} mode="format" targetFormat="image/png" maxBytes={maxBytes} onRun={onRun} />;
    case "image-to-webp":
      return <ImageConverter tool={tool} mode="format" targetFormat="image/webp" maxBytes={maxBytes} onRun={onRun} />;
    case "image-compress":
      return <ImageConverter tool={tool} mode="compress" targetFormat="image/jpeg" maxBytes={maxBytes} onRun={onRun} />;
    case "image-resize":
      return <ImageConverter tool={tool} mode="resize" targetFormat="image/png" maxBytes={maxBytes} onRun={onRun} />;
    case "pdf-merge":
      return <PdfMergeTool tool={tool} maxBytes={maxBytes} onRun={onRun} />;
    case "pdf-split":
      return <PdfSplitTool tool={tool} maxBytes={maxBytes} onRun={onRun} />;
    case "pdf-to-images":
      return <PdfToImagesTool tool={tool} maxBytes={maxBytes} onRun={onRun} />;
    default:
      return <p className="text-[var(--color-ink-soft)]">Tool not implemented yet.</p>;
  }
};
