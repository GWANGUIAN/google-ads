/**
 * WebCodecs support is genuinely uneven across browsers (older Safari/Firefox
 * releases lack VideoEncoder/VideoDecoder entirely). Check up front and show
 * a clear message instead of letting mediabunny's Conversion throw an opaque
 * error mid-job. See docs/NEW_SITE_PLAYBOOK.md.
 */

export interface SupportCheck {
  supported: boolean;
  reason?: string;
}

let cached: SupportCheck | null = null;

export function checkMediaSupport(): SupportCheck {
  if (cached) return cached;

  const supported =
    typeof window !== "undefined" &&
    "VideoEncoder" in window &&
    "VideoDecoder" in window &&
    "OffscreenCanvas" in window;

  cached = supported
    ? { supported: true }
    : {
        supported: false,
        reason:
          "Your browser doesn't support the WebCodecs APIs this tool needs to compress or trim video locally. Try the latest version of Chrome, Edge, or Firefox.",
      };

  return cached;
}
