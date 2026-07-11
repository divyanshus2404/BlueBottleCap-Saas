// Browser-side PDF manipulation. pdf-lib runs entirely on the client so PDF
// content never leaves the user's machine. For rendering pages as images we
// also pull in pdfjs-dist (already a project dep).

import { PDFDocument } from "pdf-lib";

export async function mergePdfs(files: File[]): Promise<Blob> {
  const out = await PDFDocument.create();
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  const merged = await out.save();
  return new Blob([merged as BlobPart], { type: "application/pdf" });
}

/**
 * Parse a page-range spec like "1-3,5,7-9" into a sorted, de-duplicated list
 * of zero-based page indices, clamped to the document's range.
 */
export function parsePageRanges(spec: string, totalPages: number): number[] {
  const out = new Set<number>();
  const parts = spec
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const part of parts) {
    const range = part.split("-").map((s) => parseInt(s.trim(), 10));
    if (range.length === 1 && Number.isFinite(range[0])) {
      const i = range[0] - 1;
      if (i >= 0 && i < totalPages) out.add(i);
    } else if (range.length === 2 && range.every(Number.isFinite)) {
      const [a, b] = range[0] <= range[1] ? range : [range[1], range[0]];
      for (let i = a - 1; i <= b - 1; i++) {
        if (i >= 0 && i < totalPages) out.add(i);
      }
    }
  }
  return Array.from(out).sort((a, b) => a - b);
}

export async function splitPdf(file: File, pageSpec: string): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const indices = parsePageRanges(pageSpec, src.getPageCount());
  if (indices.length === 0) {
    throw new Error("No valid pages selected.");
  }
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, indices);
  copied.forEach((p) => out.addPage(p));
  const split = await out.save();
  return new Blob([split as BlobPart], { type: "application/pdf" });
}

export async function getPdfPageCount(file: File): Promise<number> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.getPageCount();
}

/**
 * Render every PDF page as a PNG blob using pdfjs-dist. Returns one blob per
 * page in source order. Heavy on memory for large PDFs, so the caller should
 * gate this behind a sensible page-count limit.
 */
export async function pdfToImages(file: File, scale = 2): Promise<Blob[]> {
  const pdfjs = await import("pdfjs-dist");
  // Use the CDN-hosted worker that matches the installed pdfjs-dist version so
  // we don't have to ship the worker through Next.js's static pipeline.
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const blobs: Blob[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable.");
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG encode failed"))), "image/png");
    });
    blobs.push(blob);
  }
  return blobs;
}
