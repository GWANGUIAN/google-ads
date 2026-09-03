export type OutputFormatCode = "png" | "jpg" | "webp" | "bmp";

export interface ConvertOptions {
  targetFormat: OutputFormatCode;
  quality?: number; // 0-1, only used for lossy targets (jpg/webp)
}

export interface ConvertResult {
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

export interface WorkerJobRequest {
  id: string;
  file: File;
  options: ConvertOptions;
}

export type WorkerJobResponse =
  | { id: string; ok: true; result: Omit<ConvertResult, "blob"> & { blob: Blob } }
  | { id: string; ok: false; error: string };
