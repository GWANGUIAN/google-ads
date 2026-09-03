/**
 * FontFace (for the live preview) and WebAssembly (for WOFF2 read/write) are
 * both broadly supported in current browsers, but check up front and show a
 * clear message instead of letting the worker throw an opaque error mid-job.
 * See docs/NEW_SITE_PLAYBOOK.md.
 */

export interface SupportCheck {
  supported: boolean;
  reason?: string;
}

let cached: SupportCheck | null = null;

export function checkFontSupport(): SupportCheck {
  if (cached) return cached;

  const supported =
    typeof window !== "undefined" && "FontFace" in window && "Worker" in window && typeof WebAssembly !== "undefined";

  cached = supported
    ? { supported: true }
    : {
        supported: false,
        reason:
          "Your browser doesn't support the Web Font and WebAssembly APIs this tool needs to preview and convert fonts locally. Try the latest version of Chrome, Edge, Firefox, or Safari.",
      };

  return cached;
}
