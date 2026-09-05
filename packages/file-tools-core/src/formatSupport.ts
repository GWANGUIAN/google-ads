/**
 * Feature detection for formats whose browser support is inconsistent
 * (HEIC decode: Safari-only; AVIF encode: recent Chromium-only). Probes are
 * run once and cached, so the UI can hide/disable options that won't work
 * rather than let a conversion fail silently mid-batch.
 */

let avifEncodeSupport: Promise<boolean> | null = null;

export function supportsAvifEncode(): Promise<boolean> {
  if (!avifEncodeSupport) {
    avifEncodeSupport = new Promise((resolve) => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        canvas.toBlob(
          (blob) => resolve(!!blob && blob.type === "image/avif"),
          "image/avif",
        );
      } catch {
        resolve(false);
      }
    });
  }
  return avifEncodeSupport;
}

export function isLikelySafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
}

/** HEIC decode via createImageBitmap is only reliable in Safari as of 2026. */
export function likelySupportsHeicInput(): boolean {
  return isLikelySafari();
}
