export class UnsupportedMediaError extends Error {
  constructor(
    message = "This file could not be processed. It may not be a valid MP4/WebM video, or your browser couldn't decode it.",
  ) {
    super(message);
    this.name = "UnsupportedMediaError";
  }
}

export type QualityPreset = "high" | "balanced" | "smaller";

export interface CompressPayload {
  file: File;
  quality: QualityPreset;
}

export interface TrimPayload {
  file: File;
  /** Seconds, inclusive. */
  start: number;
  end: number;
}

export type MediaEngineOp = "compress" | "trim";

export interface MediaEngineJobRequest {
  id: string;
  op: MediaEngineOp;
  payload: CompressPayload | TrimPayload;
}

export interface EngineResult {
  buffer: ArrayBuffer;
  mimeType: string;
  extension: string;
}

export type MediaEngineJobResponse =
  | { id: string; type: "progress"; pct: number }
  | { id: string; type: "done"; ok: true; result: EngineResult }
  | { id: string; type: "done"; ok: false; error: string };
