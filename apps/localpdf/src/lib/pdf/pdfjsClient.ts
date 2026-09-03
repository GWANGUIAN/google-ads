import * as pdfjsLib from "pdfjs-dist";

// Vite statically recognizes `new URL(specifier, import.meta.url)` and
// treats the referenced file as an asset: copied into dist/ with a content
// hash in production, served straight from node_modules in dev. This is NOT
// a `new Worker(...)` call — pdf.js constructs the Worker itself later using
// this already-resolved absolute URL string. Every file that needs pdf.js
// MUST import `pdfjsLib` from this module (never `pdfjs-dist` directly) so
// this assignment always runs before any getDocument() call.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export { pdfjsLib };
