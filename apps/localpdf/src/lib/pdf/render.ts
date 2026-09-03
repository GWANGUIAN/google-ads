import { pdfjsLib } from "./pdfjsClient";
import { UnsupportedPdfError } from "./types";

export type PdfDocumentProxy = Awaited<ReturnType<typeof pdfjsLib.getDocument>["promise"]>;

/** Loads a PDF for main-thread rendering/text-extraction via PDF.js. pdf.js
 * already parses off the main thread inside its own internal worker
 * (configured in pdfjsClient.ts), so no additional worker layer is needed
 * here — see docs/NEW_SITE_PLAYBOOK.md. */
export async function loadPdfForRender(file: File): Promise<PdfDocumentProxy> {
  const data = await file.arrayBuffer();
  try {
    return await pdfjsLib.getDocument({ data }).promise;
  } catch {
    throw new UnsupportedPdfError();
  }
}

export function getPageCount(pdf: PdfDocumentProxy): number {
  return pdf.numPages;
}

async function renderToCanvas(
  pdf: PdfDocumentProxy,
  pageIndex: number,
  scale: number,
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageIndex + 1); // pdf.js pages are 1-indexed
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable.");
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

export async function renderPageToCanvas(
  pdf: PdfDocumentProxy,
  pageIndex: number,
  scale = 1.5,
): Promise<HTMLCanvasElement> {
  return renderToCanvas(pdf, pageIndex, scale);
}

export async function renderThumbnailDataUrl(
  pdf: PdfDocumentProxy,
  pageIndex: number,
  maxDim = 220,
): Promise<string> {
  const page = await pdf.getPage(pageIndex + 1);
  const base = page.getViewport({ scale: 1 });
  const scale = maxDim / Math.max(base.width, base.height);
  const canvas = await renderToCanvas(pdf, pageIndex, scale);
  return canvas.toDataURL("image/png");
}

export async function renderPageToBlob(
  pdf: PdfDocumentProxy,
  pageIndex: number,
  scale: number,
  mimeType: "image/png" | "image/jpeg",
  quality = 0.92,
): Promise<Blob> {
  const canvas = await renderToCanvas(pdf, pageIndex, scale);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to render page."))),
      mimeType,
      mimeType === "image/jpeg" ? quality : undefined,
    );
  });
}

export async function extractPageText(pdf: PdfDocumentProxy, pageIndex: number): Promise<string> {
  const page = await pdf.getPage(pageIndex + 1);
  const content = await page.getTextContent();
  return content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
}

export async function extractAllText(pdf: PdfDocumentProxy): Promise<string> {
  const pages: string[] = [];
  for (let i = 0; i < pdf.numPages; i++) {
    pages.push(await extractPageText(pdf, i));
  }
  return pages.join("\n\n");
}
