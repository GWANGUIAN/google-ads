export class UnsupportedPdfError extends Error {
  constructor(message = "This file could not be read as a PDF. It may be corrupted or not a valid PDF.") {
    super(message);
    this.name = "UnsupportedPdfError";
  }
}

export class EncryptedPdfError extends Error {
  constructor(message = "This PDF is password-protected, so it can't be opened by this tool.") {
    super(message);
    this.name = "EncryptedPdfError";
  }
}

export class UnsupportedImageError extends Error {
  constructor(message = "Your browser could not decode this image file.") {
    super(message);
    this.name = "UnsupportedImageError";
  }
}

/** Rotation keyed by the page's original index (0-based) in the source PDF. */
export type RotationMap = Record<number, 0 | 90 | 180 | 270>;

export interface ImagesToPdfPayload {
  files: File[];
}

export interface MergePdfsPayload {
  files: File[];
}

export interface ApplyPageEditsPayload {
  file: File;
  /** Original (0-based) page indices, in the desired output order. Omitted
   * pages are deleted. */
  pageOrder: number[];
  rotations?: RotationMap;
}

export interface SplitPdfPayload {
  file: File;
  /** 1-based, inclusive page ranges, e.g. [[1,3],[4,6]]. */
  ranges: [number, number][];
}

export type PdfEngineOp = "imagesToPdf" | "mergePdfs" | "applyPageEdits" | "splitPdf";

export interface PdfEngineJobRequest {
  id: string;
  op: PdfEngineOp;
  payload: ImagesToPdfPayload | MergePdfsPayload | ApplyPageEditsPayload | SplitPdfPayload;
}

export type PdfEngineJobResponse =
  | { id: string; ok: true; result: Blob | Blob[] }
  | { id: string; ok: false; error: string };
