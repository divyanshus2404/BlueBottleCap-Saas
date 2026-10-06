const TARGET_MAX_DIM = 2400;
const TARGET_QUALITY = 0.92;
const TARGET_MAX_BYTES = 950_000; // stay under OCR.space 1MB

export async function preprocessForOcr(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  const scale = Math.min(1, TARGET_MAX_DIM / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d")!;

  // Draw original
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  // Grayscale + contrast boost
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    // Luminance grayscale
    let gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

    // Contrast stretch: push darks darker, lights lighter
    gray = ((gray / 255 - 0.5) * 1.4 + 0.5) * 255;
    gray = Math.max(0, Math.min(255, gray));

    // Slight sharpen via threshold: if near-white, push to white
    if (gray > 200) gray = 255;

    d[i] = d[i + 1] = d[i + 2] = gray;
  }
  ctx.putImageData(imageData, 0, 0);

  // Encode as JPEG, reduce quality if needed to fit size limit
  let quality = TARGET_QUALITY;
  let blob: Blob;
  do {
    blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
    quality -= 0.08;
  } while (blob.size > TARGET_MAX_BYTES && quality > 0.4);

  return new File([blob], "preprocessed.jpg", { type: "image/jpeg" });
}
