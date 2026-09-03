/**
 * Soft (non-blocking) guardrails for large in-browser PDF/image processing.
 * Everything here runs in the tab's JS heap with no disk streaming, so very
 * large batches can be slow or memory-heavy — warn rather than fail outright,
 * since most files will still process fine. See docs/NEW_SITE_PLAYBOOK.md §9.
 */

export const MAX_PDF_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_IMAGE_COUNT = 150;

export function pdfSizeWarning(file: File): string | null {
  if (file.size > MAX_PDF_BYTES) {
    return `This file is quite large (${(file.size / (1024 * 1024)).toFixed(0)}MB) — processing may be slow or use a lot of memory in your browser.`;
  }
  return null;
}

export function imageCountWarning(count: number): string | null {
  if (count > MAX_IMAGE_COUNT) {
    return `You've added ${count} images — very large batches can be slow to assemble into one PDF. Consider splitting into smaller batches if it hangs.`;
  }
  return null;
}
