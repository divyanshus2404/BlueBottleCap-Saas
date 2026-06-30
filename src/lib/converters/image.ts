// Pure browser-side image conversion via Canvas. No deps, no API calls — every
// operation here runs entirely in the user's browser and never touches the
// server, so free-tier usage costs us nothing.

export type ImageFormat = "image/jpeg" | "image/png" | "image/webp";

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    // The browser keeps the decoded bitmap, so the object URL can be released.
    URL.revokeObjectURL(url);
  }
}

function drawToCanvas(img: HTMLImageElement, width: number, height: number, background?: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, format: ImageFormat, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Image encoding failed."))),
      format,
      quality,
    );
  });
}

export async function convertImage(
  file: File,
  format: ImageFormat,
  options: { quality?: number; width?: number; height?: number } = {},
): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImage(file);
  const width = options.width ?? img.naturalWidth;
  const height = options.height ?? img.naturalHeight;
  // JPG has no alpha — fill white so transparent PNGs don't become black blocks.
  const background = format === "image/jpeg" ? "#ffffff" : undefined;
  const canvas = drawToCanvas(img, width, height, background);
  const blob = await canvasToBlob(canvas, format, options.quality ?? 0.92);
  return { blob, width, height };
}

export function extensionFor(format: ImageFormat): string {
  if (format === "image/jpeg") return "jpg";
  if (format === "image/png") return "png";
  if (format === "image/webp") return "webp";
  return "bin";
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Slight delay so the click handler can grab the URL before revoke.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
