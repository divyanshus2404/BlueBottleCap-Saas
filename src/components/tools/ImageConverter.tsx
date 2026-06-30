"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ImageFormat, convertImage, downloadBlob, extensionFor } from "@/src/lib/converters/image";
import { ToolDef } from "@/src/lib/tools";

type Mode = "format" | "compress" | "resize";

interface Props {
  tool: ToolDef;
  // The ImageConverter handles five different tool IDs because they're all
  // just Canvas re-encodes with different defaults. The hub picks the mode
  // and target format from the tool id and passes them in.
  mode: Mode;
  targetFormat: ImageFormat;
  maxBytes: number;
  onRun: () => boolean; // returns false if quota exceeded
}

export const ImageConverter: React.FC<Props> = ({ tool, mode, targetFormat, maxBytes, onRun }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [quality, setQuality] = useState(82);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string; size: number } | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onPick = useCallback((f: File) => {
    setError(null);
    setResult(null);
    if (f.size > maxBytes) {
      setError(`File too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Limit: ${(maxBytes / 1024 / 1024).toFixed(0)} MB.`);
      return;
    }
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    const img = new Image();
    img.onload = () => {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = url;
  }, [maxBytes, previewUrl]);

  const run = async () => {
    if (!file) return;
    if (!onRun()) return;
    setBusy(true);
    setError(null);
    try {
      const opts: { quality?: number; width?: number; height?: number } = {};
      if (mode === "compress") opts.quality = quality / 100;
      if (mode === "resize") {
        opts.width = Math.max(1, Math.round(width));
        opts.height = Math.max(1, Math.round(height));
      }
      if (mode === "format" && targetFormat === "image/jpeg") opts.quality = 0.92;
      const { blob } = await convertImage(file, targetFormat, opts);
      const base = file.name.replace(/\.[^.]+$/, "");
      const ext = extensionFor(targetFormat);
      const name = `${base}.${ext}`;
      setResult({ blob, name, size: blob.size });
    } catch (e: any) {
      setError(e?.message || "Conversion failed.");
    } finally {
      setBusy(false);
    }
  };

  const accept = mode === "format" && targetFormat === "image/png"
    ? "image/jpeg"
    : mode === "format" && targetFormat === "image/jpeg"
    ? "image/png"
    : "image/png,image/jpeg,image/webp";

  return (
    <div className="space-y-5">
      <FilePicker onPick={onPick} accept={accept} hint={`Max ${(maxBytes / 1024 / 1024).toFixed(0)}MB · PNG / JPG / WebP`} />

      {previewUrl && (
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
          <div className="flex items-start gap-4">
            <img src={previewUrl} alt="Preview" className="h-24 w-24 rounded-lg object-cover" />
            <div className="flex-1 text-[12.5px] text-[var(--color-ink-soft)]">
              <div className="font-bold text-[var(--color-ink)]">{file?.name}</div>
              <div>
                {file ? `${(file.size / 1024).toFixed(0)} KB` : ""}
                {naturalSize ? ` · ${naturalSize.w} × ${naturalSize.h}` : ""}
              </div>
            </div>
          </div>

          {mode === "compress" && (
            <div className="mt-4">
              <label className="bbc-eyebrow text-[10px]">Quality: {quality}%</label>
              <input
                type="range"
                min={20}
                max={95}
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                className="mt-2 w-full accent-[var(--color-blue-ink)]"
              />
            </div>
          )}

          {mode === "resize" && naturalSize && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="bbc-eyebrow text-[10px]">Width (px)</span>
                <input
                  type="number"
                  value={width}
                  min={1}
                  max={10000}
                  onChange={(e) => setWidth(parseInt(e.target.value, 10) || 0)}
                  className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="bbc-eyebrow text-[10px]">Height (px)</span>
                <input
                  type="number"
                  value={height}
                  min={1}
                  max={10000}
                  onChange={(e) => setHeight(parseInt(e.target.value, 10) || 0)}
                  className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm"
                />
              </label>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-800">{error}</div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={run}
          disabled={!file || busy}
          className="bbc-btn bbc-btn-primary px-5 py-3 text-[13px] disabled:opacity-50"
        >
          {busy ? "Working…" : `Convert with ${tool.name}`}
        </button>
        {result && (
          <button
            onClick={() => downloadBlob(result.blob, result.name)}
            className="bbc-btn bbc-btn-ghost px-5 py-3 text-[13px]"
          >
            ↓ Download {result.name} ({(result.size / 1024).toFixed(0)} KB)
          </button>
        )}
      </div>
    </div>
  );
};

interface FilePickerProps {
  onPick: (file: File) => void;
  accept: string;
  hint: string;
  multiple?: boolean;
  onPickMany?: (files: File[]) => void;
}

export const FilePicker: React.FC<FilePickerProps> = ({ onPick, accept, hint, multiple, onPickMany }) => {
  const [dragging, setDragging] = useState(false);

  const handle = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (multiple && onPickMany) {
      onPickMany(Array.from(files));
    } else {
      onPick(files[0]);
    }
  };

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files); }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition ${
        dragging
          ? "border-[var(--color-blue-ink)] bg-[var(--color-blue-wash)]"
          : "border-[var(--color-line)] bg-[var(--color-paper)] hover:border-[var(--color-line-strong)]"
      }`}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handle(e.target.files)}
        className="sr-only"
      />
      <span className="text-3xl">📤</span>
      <span className="text-[14px] font-bold text-[var(--color-ink)]">Drop a file or click to upload</span>
      <span className="text-[11px] text-[var(--color-ink-faint)]">{hint}</span>
    </label>
  );
};
