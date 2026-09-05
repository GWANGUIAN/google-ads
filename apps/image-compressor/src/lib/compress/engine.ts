import { UnsupportedInputError, type CompressOptions, type CompressResult } from "./types";

/** This compressor keeps the input's own format — it re-encodes at a lower
 * quality (JPG/WEBP) or losslessly (PNG) rather than converting between
 * formats. Anything outside this set is rejected with a clear error rather
 * than silently mis-handled. */
const SUPPORTED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const LOSSY_MIME_TYPES = new Set(["image/jpeg", "image/webp"]);

const DEFAULT_QUALITY = 0.8;

/**
 * Decodes `file` and re-encodes it in its own format at `options.quality`
 * (lossy formats) or losslessly (PNG). Runs against OffscreenCanvas so it
 * works both on the main thread and inside a Worker.
 */
export async function compressImage(file: File, options: CompressOptions): Promise<CompressResult> {
  const mimeType = file.type;
  if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
    throw new UnsupportedInputError(
      "This tool only compresses JPG, PNG, and WEBP images. Convert your file to one of those formats first.",
    );
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new UnsupportedInputError(
      "Your browser could not decode this file. It may be corrupted or use an unsupported variant of this format.",
    );
  }

  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable.");
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const isLossy = LOSSY_MIME_TYPES.has(mimeType);
  const blob = await canvas.convertToBlob({
    type: mimeType,
    ...(isLossy ? { quality: options.quality ?? DEFAULT_QUALITY } : {}),
  });

  return {
    blob,
    width: canvas.width,
    height: canvas.height,
    originalBytes: file.size,
    newBytes: blob.size,
  };
}
