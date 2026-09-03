/**
 * Soft (non-blocking) guardrail for large in-browser video processing.
 * Everything here runs in the tab's JS heap/GPU memory with no disk
 * streaming, so very large files can be slow or memory-heavy — warn rather
 * than block, since most files will still process fine. See
 * docs/NEW_SITE_PLAYBOOK.md §9.
 */

export const MAX_VIDEO_BYTES = 300 * 1024 * 1024; // 300MB

export function videoSizeWarning(file: File): string | null {
  if (file.size > MAX_VIDEO_BYTES) {
    return `This file is quite large (${(file.size / (1024 * 1024)).toFixed(0)}MB) — processing may be slow or use a lot of memory in your browser, since everything runs locally rather than on a server.`;
  }
  return null;
}
