export type InputFormatCode = "jpg" | "png" | "webp";

export interface CompressOptions {
  /** 0-1. Only affects lossy encodes (JPG/WEBP) — ignored for PNG, which has
   * no lossy quality knob and is re-encoded losslessly instead. */
  quality: number;
}

export interface CompressResult {
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
