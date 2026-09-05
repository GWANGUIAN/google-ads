import { compressImage } from "./engine";
import type { WorkerJobRequest, WorkerJobResponse } from "@repo/file-tools-core/WorkerPool.ts";
import type { CompressOptions, CompressResult } from "./types";

self.onmessage = async (event: MessageEvent<WorkerJobRequest<CompressOptions>>) => {
  const { id, file, options } = event.data;
  try {
    const result = await compressImage(file, options);
    const response: WorkerJobResponse<CompressResult> = { id, ok: true, result };
    // Blob is structured-cloneable (not a Transferable itself), so no transfer list needed.
    (self as unknown as Worker).postMessage(response);
  } catch (err) {
    const response: WorkerJobResponse<CompressResult> = {
      id,
      ok: false,
      error: err instanceof Error ? err.message : "Compression failed.",
    };
    (self as unknown as Worker).postMessage(response);
  }
};
