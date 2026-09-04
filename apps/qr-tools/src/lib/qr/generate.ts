import QRCode from "qrcode";

/** All QR rendering runs client-side via the `qrcode` package — no server,
 * no WASM needed (unlike video/font tools' heavier codecs) since QR encoding
 * is cheap enough to run synchronously on the main thread. */

export interface QrStyleOptions {
  foreground?: string;
  background?: string;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  margin?: number;
  size?: number;
  /** Drawn centered on top of the code after rendering. Bumps the effective
   * error-correction level to "H" automatically if not set explicitly, since
   * covering part of the code needs the extra redundancy to stay scannable. */
  logo?: HTMLImageElement | null;
  logoScale?: number;
}

export async function renderQrToCanvas(canvas: HTMLCanvasElement, text: string, opts: QrStyleOptions = {}): Promise<void> {
  await QRCode.toCanvas(canvas, text, {
    errorCorrectionLevel: opts.errorCorrectionLevel ?? (opts.logo ? "H" : "M"),
    margin: opts.margin ?? 2,
    width: opts.size ?? 512,
    color: {
      dark: opts.foreground ?? "#000000",
      light: opts.background ?? "#ffffff",
    },
  });

  if (opts.logo) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scale = opts.logoScale ?? 0.22;
    const logoSize = canvas.width * scale;
    const x = (canvas.width - logoSize) / 2;
    const y = (canvas.height - logoSize) / 2;
    const pad = logoSize * 0.12;
    ctx.fillStyle = opts.background ?? "#ffffff";
    ctx.fillRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2);
    ctx.drawImage(opts.logo, x, y, logoSize, logoSize);
  }
}

/** SVG export doesn't support the logo overlay (would require hand-splicing
 * an <image> node into the library's output) — PNG is the logo-capable path,
 * SVG stays a clean vector code. The widget disables logo when SVG is picked. */
export function renderQrToSvg(text: string, opts: QrStyleOptions = {}): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: opts.errorCorrectionLevel ?? "M",
    margin: opts.margin ?? 2,
    color: {
      dark: opts.foreground ?? "#000000",
      light: opts.background ?? "#ffffff",
    },
  });
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to export PNG"));
    }, "image/png");
  });
}
