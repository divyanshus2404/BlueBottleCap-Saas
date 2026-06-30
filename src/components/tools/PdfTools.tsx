"use client";

import React, { useState } from "react";
import { ToolDef } from "@/src/lib/tools";
import { getPdfPageCount, mergePdfs, pdfToImages, splitPdf } from "@/src/lib/converters/pdf";
import { downloadBlob } from "@/src/lib/converters/image";
import { FilePicker } from "./ImageConverter";

interface Props {
  tool: ToolDef;
  maxBytes: number;
  onRun: () => boolean;
}

export const PdfMergeTool: React.FC<Props> = ({ tool, maxBytes, onRun }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPickMany = (picked: File[]) => {
    setError(null);
    const oversize = picked.find((f) => f.size > maxBytes);
    if (oversize) {
      setError(`${oversize.name} is over the ${(maxBytes / 1024 / 1024).toFixed(0)}MB limit.`);
      return;
    }
    setFiles((prev) => [...prev, ...picked]);
  };

  const remove = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const run = async () => {
    if (files.length < 2) {
      setError("Pick at least 2 PDFs to merge.");
      return;
    }
    if (!onRun()) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await mergePdfs(files);
      downloadBlob(blob, "merged.pdf");
    } catch (e: any) {
      setError(e?.message || "Merge failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <FilePicker
        onPick={() => {}}
        onPickMany={onPickMany}
        multiple
        accept="application/pdf"
        hint={`Drop 2 or more PDFs · Max ${(maxBytes / 1024 / 1024).toFixed(0)}MB each`}
      />

      {files.length > 0 && (
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
          <p className="bbc-eyebrow mb-3 text-[10px]">Merge order ({files.length} files)</p>
          <ol className="space-y-2">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-[13px]">
                <span className="truncate">
                  <span className="bbc-mono mr-2 text-[10px] text-[var(--color-ink-faint)]">{String(i + 1).padStart(2, "0")}</span>
                  {f.name}
                </span>
                <button onClick={() => remove(i)} className="text-[11px] font-bold text-red-600 hover:underline">remove</button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-800">{error}</div>}

      <button
        onClick={run}
        disabled={files.length < 2 || busy}
        className="bbc-btn bbc-btn-primary px-5 py-3 text-[13px] disabled:opacity-50"
      >
        {busy ? "Merging…" : `Merge ${files.length || ""} PDF${files.length === 1 ? "" : "s"}`}
      </button>
    </div>
  );
};

export const PdfSplitTool: React.FC<Props> = ({ maxBytes, onRun }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [spec, setSpec] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = async (f: File) => {
    setError(null);
    if (f.size > maxBytes) {
      setError(`File too large. Limit: ${(maxBytes / 1024 / 1024).toFixed(0)}MB.`);
      return;
    }
    setFile(f);
    try {
      const count = await getPdfPageCount(f);
      setPageCount(count);
      setSpec(`1-${count}`);
    } catch (e: any) {
      setError(e?.message || "Could not read PDF.");
    }
  };

  const run = async () => {
    if (!file) return;
    if (!onRun()) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await splitPdf(file, spec);
      const base = file.name.replace(/\.[^.]+$/, "");
      downloadBlob(blob, `${base}_pages_${spec.replace(/[^0-9-]/g, "_")}.pdf`);
    } catch (e: any) {
      setError(e?.message || "Split failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <FilePicker onPick={onPick} accept="application/pdf" hint={`Max ${(maxBytes / 1024 / 1024).toFixed(0)}MB · single PDF`} />

      {file && pageCount !== null && (
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
          <p className="text-[13px] text-[var(--color-ink-soft)]">
            <span className="font-bold text-[var(--color-ink)]">{file.name}</span> · {pageCount} pages
          </p>
          <label className="mt-4 block">
            <span className="bbc-eyebrow text-[10px]">Pages to extract</span>
            <input
              type="text"
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              placeholder="e.g. 1-3, 5, 7-9"
              className="mt-1 w-full rounded-lg border border-[var(--color-line)] bg-white px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-[11px] text-[var(--color-ink-faint)]">
              Use commas and ranges. Example: <code className="bbc-mono">1-3, 5, 7-9</code>
            </span>
          </label>
        </div>
      )}

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-800">{error}</div>}

      <button onClick={run} disabled={!file || busy} className="bbc-btn bbc-btn-primary px-5 py-3 text-[13px] disabled:opacity-50">
        {busy ? "Splitting…" : "Extract pages"}
      </button>
    </div>
  );
};

export const PdfToImagesTool: React.FC<Props> = ({ maxBytes, onRun }) => {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Array<{ blob: Blob; name: string }>>([]);

  const onPick = (f: File) => {
    setError(null);
    setResults([]);
    if (f.size > maxBytes) {
      setError(`File too large. Limit: ${(maxBytes / 1024 / 1024).toFixed(0)}MB.`);
      return;
    }
    setFile(f);
  };

  const run = async () => {
    if (!file) return;
    if (!onRun()) return;
    setBusy(true);
    setError(null);
    try {
      const blobs = await pdfToImages(file, 2);
      const base = file.name.replace(/\.[^.]+$/, "");
      setResults(blobs.map((blob, i) => ({ blob, name: `${base}_page_${String(i + 1).padStart(2, "0")}.png` })));
    } catch (e: any) {
      setError(e?.message || "Render failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <FilePicker onPick={onPick} accept="application/pdf" hint={`Max ${(maxBytes / 1024 / 1024).toFixed(0)}MB · single PDF`} />

      {file && (
        <p className="text-[13px] text-[var(--color-ink-soft)]">
          <span className="font-bold text-[var(--color-ink)]">{file.name}</span> · {(file.size / 1024).toFixed(0)} KB
        </p>
      )}

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] text-red-800">{error}</div>}

      <button onClick={run} disabled={!file || busy} className="bbc-btn bbc-btn-primary px-5 py-3 text-[13px] disabled:opacity-50">
        {busy ? "Rendering pages…" : "Convert to PNG images"}
      </button>

      {results.length > 0 && (
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] p-4">
          <p className="bbc-eyebrow mb-3 text-[10px]">{results.length} page{results.length === 1 ? "" : "s"} ready</p>
          <div className="grid gap-2">
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => downloadBlob(r.blob, r.name)}
                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-[13px] hover:bg-[var(--color-blue-wash)]"
              >
                <span>↓ {r.name}</span>
                <span className="text-[11px] text-[var(--color-ink-faint)]">{(r.blob.size / 1024).toFixed(0)} KB</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
