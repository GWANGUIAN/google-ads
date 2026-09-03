import type { FontFormatCode } from "@/data/formats";

export class UnsupportedFontError extends Error {
  constructor(
    message = "This file could not be processed. It may not be a valid TTF/OTF/WOFF/WOFF2 font, or it uses a feature this tool doesn't support.",
  ) {
    super(message);
    this.name = "UnsupportedFontError";
  }
}

export interface ConvertPayload {
  file: File;
  source: FontFormatCode;
  target: FontFormatCode;
}

export interface EngineResult {
  buffer: ArrayBuffer;
  mimeType: string;
  extension: string;
}

export interface FontEngineJobRequest {
  id: string;
  payload: ConvertPayload;
  /** Absolute URL to woff2.wasm — computed on the main thread (where
   * import.meta.env.BASE_URL / withBase() are available) and passed in,
   * since the worker's own module URL resolution differs. */
  wasmUrl: string;
}

export type FontEngineJobResponse =
  | { id: string; type: "done"; ok: true; result: EngineResult }
  | { id: string; type: "done"; ok: false; error: string };
