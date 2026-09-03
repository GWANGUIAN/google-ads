import { PDFDocument, degrees } from "pdf-lib";
import {
  EncryptedPdfError,
  UnsupportedImageError,
  UnsupportedPdfError,
  type ApplyPageEditsPayload,
  type ImagesToPdfPayload,
  type MergePdfsPayload,
  type SplitPdfPayload,
} from "./types";

/**
 * Pure pdf-lib functions — no DOM/worker-specific code beyond
 * OffscreenCanvas (available both on the main thread and inside module
 * workers), so this file works unmodified whether called directly or via
 * pdfEngine.worker.ts. See docs/NEW_SITE_PLAYBOOK.md.
 */

const PDF_MIME = "application/pdf";

async function loadPdf(file: File): Promise<PDFDocument> {
  const bytes = await file.arrayBuffer();
  try {
    return await PDFDocument.load(bytes);
  } catch (err) {
    const message = err instanceof Error ? err.message.toLowerCase() : "";
    if (message.includes("encrypt")) {
      throw new EncryptedPdfError();
    }
    throw new UnsupportedPdfError();
  }
}

async function saveAsBlob(doc: PDFDocument): Promise<Blob> {
  const bytes = await doc.save();
  // pdf-lib's .save() return type doesn't line up 1:1 with the DOM lib's
  // BlobPart typing across TS versions — the runtime value is always a
  // plain Uint8Array, so this cast is safe.
  return new Blob([bytes as BlobPart], { type: PDF_MIME });
}

/** Decodes any browser-supported image format and re-encodes it as PNG
 * bytes, for formats pdf-lib can't embed directly (webp/gif/bmp/heic). */
async function toPngBytes(file: File): Promise<Uint8Array> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new UnsupportedImageError(
      `Your browser could not decode "${file.name}". It may be an unsupported format, or the file may be corrupted.`,
    );
  }
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await canvas.convertToBlob({ type: "image/png" });
  return new Uint8Array(await blob.arrayBuffer());
}

export async function imagesToPdf({ files }: ImagesToPdfPayload): Promise<Blob> {
  const doc = await PDFDocument.create();

  for (const file of files) {
    const isJpg = file.type === "image/jpeg" || file.type === "image/jpg";
    const isPng = file.type === "image/png";

    const bytes = isJpg || isPng ? new Uint8Array(await file.arrayBuffer()) : await toPngBytes(file);
    const image = isJpg ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);

    // Page size matches the image's own pixel dimensions (1px = 1pt) so
    // every image fits its page exactly, with no scaling/cropping decisions.
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }

  return saveAsBlob(doc);
}

export async function mergePdfs({ files }: MergePdfsPayload): Promise<Blob> {
  const merged = await PDFDocument.create();

  for (const file of files) {
    const src = await loadPdf(file);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  return saveAsBlob(merged);
}

export async function applyPageEdits({ file, pageOrder, rotations }: ApplyPageEditsPayload): Promise<Blob> {
  const src = await loadPdf(file);
  const result = await PDFDocument.create();
  const pages = await result.copyPages(src, pageOrder);

  pages.forEach((page, i) => {
    const rotation = rotations?.[pageOrder[i]];
    if (rotation) page.setRotation(degrees(rotation));
    result.addPage(page);
  });

  return saveAsBlob(result);
}

export async function splitPdf({ file, ranges }: SplitPdfPayload): Promise<Blob[]> {
  const src = await loadPdf(file);
  const blobs: Blob[] = [];

  for (const [start, end] of ranges) {
    const indices: number[] = [];
    for (let i = start - 1; i <= end - 1; i++) indices.push(i);

    const doc = await PDFDocument.create();
    const pages = await doc.copyPages(src, indices);
    pages.forEach((page) => doc.addPage(page));
    blobs.push(await saveAsBlob(doc));
  }

  return blobs;
}
