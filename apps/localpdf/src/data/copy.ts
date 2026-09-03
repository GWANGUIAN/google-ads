import { IMAGE_FORMATS } from "./imageFormats";
import type { ImageToPdfPair } from "./imageToPdfPairs";
import type { PdfToImagePair } from "./pdfToImagePairs";

/** Templated per-pair intro/why copy, assembled from format facts (not
 * hand-written per page) so every generated page reads as genuinely
 * different rather than mail-merged filler. See docs/NEW_SITE_PLAYBOOK.md. */

export function buildImageToPdfIntro(pair: ImageToPdfPair): string {
  const from = IMAGE_FORMATS[pair.from];
  return `${from.label} is a format typically used for ${from.typicalUse}. Turning one or more ${from.label} files into a single PDF makes them easier to share, print, or archive as one document instead of loose image files. Drop your ${from.label} files below — the PDF is created instantly, entirely on your own device.`;
}

export function buildImageToPdfWhy(pair: ImageToPdfPair): string {
  const from = IMAGE_FORMATS[pair.from];
  if (from.code === "heic") {
    return `HEIC photos from an iPhone often can't be opened directly on Windows or by many websites. Converting them into a PDF produces a file that opens correctly everywhere, and lets you combine several photos into one document.`;
  }
  if (from.code === "webp" || from.code === "gif" || from.code === "bmp") {
    return `PDF is the most universally compatible document format — converting your ${from.label} file to PDF guarantees it opens correctly in any browser, office suite, or print workflow, and lets you combine multiple images into a single multi-page file.`;
  }
  return `Combining your ${from.label} files into a PDF makes them far easier to email, print, or archive as one document, rather than juggling separate image files.`;
}

export function buildPdfToImageIntro(pair: PdfToImagePair): string {
  return `Turn each page of a PDF into a standalone ${pair.label} image — useful for pulling a page into a slide deck, sharing a single page on social media, or archiving pages as pictures. Every page is rendered at high resolution, entirely in your browser.`;
}

export function buildPdfToImageWhy(pair: PdfToImagePair): string {
  if (pair.to === "png") {
    return `PNG is lossless, so page text and line art stay perfectly sharp — a good choice if the page will be edited further or contains fine text.`;
  }
  return `JPG produces smaller files than PNG, which is convenient when you're exporting many pages or need to keep upload sizes small.`;
}
