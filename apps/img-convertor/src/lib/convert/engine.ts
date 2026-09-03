import { encodeBmp } from "./bmpEncoder";
import { UnsupportedInputError, type ConvertOptions, type ConvertResult } from "./types";

const MIME_BY_FORMAT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
};

const DEFAULT_QUALITY = 0.92;

/**
 * Decodes `file` and re-encodes it as `options.targetFormat`. Runs against
 * OffscreenCanvas so it works both on the main thread and inside a Worker.
 */
export async function convertImage(file: File, options: ConvertOptions): Promise<ConvertResult> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new UnsupportedInputError(
      `Your browser could not decode this file. It may be an unsupported format, or the file may be corrupted.`,
    );
  }

  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context unavailable.");
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  let blob: Blob;
  if (options.targetFormat === "bmp") {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    blob = encodeBmp(imageData);
  } else {
    const mimeType = MIME_BY_FORMAT[options.targetFormat];
    blob = await canvas.convertToBlob({
      type: mimeType,
      quality: options.quality ?? DEFAULT_QUALITY,
    });
  }

  return {
    blob,
    width: canvas.width,
    height: canvas.height,
    originalBytes: file.size,
    newBytes: blob.size,
  };
}
