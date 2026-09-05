export interface ResizeOptions {
  /** Exact target pixel dimensions. All aspect-ratio-lock and no-upscale
   * decisions are made by the caller (the React widget) before this is
   * built — the engine/worker just produce exactly this size. */
  width: number;
  height: number;
}

export interface ResizeResult {
  blob: Blob;
  width: number;
  height: number;
  originalBytes: number;
  newBytes: number;
}

export class UnsupportedInputError extends Error {
  constructor(message = "This file format could not be read by your browser.") {
    super(message);
    this.name = "UnsupportedInputError";
  }
}
