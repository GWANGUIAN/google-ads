import { UnsupportedInputError, type ResizeOptions, type ResizeResult } from "./types";

const DEFAULT_QUALITY = 0.92;

/** Encodes back out in the same format as the input file (this tool resizes,
 * it doesn't convert format) — falls back to the file extension when the
 * browser didn't report a MIME type, and to PNG (lossless, safe) if neither
 * is recognized. */
function mimeForFile(file: File): string {
  if (file.type === "image/png" || file.type === "image/webp" || file.type === "image/jpeg") {
    return file.type;
  }
  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  return file.type || "image/png";
}

/**
 * Decodes `file` and re-encodes it stretched to `options.width` x
 * `options.height`. Runs against OffscreenCanvas so it works both on the
 * main thread and inside a Worker. This function is intentionally "dumb":
 * whether those target dimensions preserve the source's aspect ratio (via
 * aspect-ratio lock) or clamp to avoid upscaling is decided by the caller
 * (ResizerWidget) before options are built — see docs/NEW_SITE_PLAYBOOK.md.
 */
export async function resizeImage(file: File, options: ResizeOptions): Promise<ResizeResult> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new UnsupportedInputError(
      `Your browser could not decode this file. It may be an unsupported format, or the file may be corrupted.`,
    );
  }

  const targetWidth = Math.max(1, Math.round(options.width));
  const targetHeight = Math.max(1, Math.round(options.height));

  const canvas = new OffscreenCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas 2D context unavailable.");
  }
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  const mimeType = mimeForFile(file);
  const isLossy = mimeType === "image/jpeg" || mimeType === "image/webp";
  const blob = await canvas.convertToBlob({
    type: mimeType,
    quality: isLossy ? DEFAULT_QUALITY : undefined,
  });

  return {
    blob,
    width: targetWidth,
    height: targetHeight,
    originalBytes: file.size,
    newBytes: blob.size,
  };
}

/**
 * Reads a file's natural pixel dimensions without resizing it. Used on the
 * main thread (not inside the worker) so the UI can show "native WxH",
 * establish the locked aspect ratio from the first dropped file, and decide
 * whether the no-upscale guard applies — before any worker job is queued.
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new UnsupportedInputError(
      `Your browser could not decode this file. It may be an unsupported format, or the file may be corrupted.`,
    );
  }
  const { width, height } = bitmap;
  bitmap.close();
  return { width, height };
}
