import { applyPageEdits, imagesToPdf, mergePdfs, splitPdf } from "./pdfEngine";
import type {
  ApplyPageEditsPayload,
  ImagesToPdfPayload,
  MergePdfsPayload,
  PdfEngineJobRequest,
  PdfEngineJobResponse,
  SplitPdfPayload,
} from "./types";

self.onmessage = async (event: MessageEvent<PdfEngineJobRequest>) => {
  const { id, op, payload } = event.data;
  try {
    let result: Blob | Blob[];
    switch (op) {
      case "imagesToPdf":
        result = await imagesToPdf(payload as ImagesToPdfPayload);
        break;
      case "mergePdfs":
        result = await mergePdfs(payload as MergePdfsPayload);
        break;
      case "applyPageEdits":
        result = await applyPageEdits(payload as ApplyPageEditsPayload);
        break;
      case "splitPdf":
        result = await splitPdf(payload as SplitPdfPayload);
        break;
    }
    const response: PdfEngineJobResponse = { id, ok: true, result };
    (self as unknown as Worker).postMessage(response);
  } catch (err) {
    const response: PdfEngineJobResponse = {
      id,
      ok: false,
      error: err instanceof Error ? err.message : "PDF processing failed.",
    };
    (self as unknown as Worker).postMessage(response);
  }
};
