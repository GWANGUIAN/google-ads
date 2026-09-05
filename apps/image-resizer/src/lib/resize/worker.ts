import { resizeImage } from "./engine";
import type { WorkerJobRequest, WorkerJobResponse } from "@repo/file-tools-core/WorkerPool.ts";
import type { ResizeOptions, ResizeResult } from "./types";

self.onmessage = async (event: MessageEvent<WorkerJobRequest<ResizeOptions>>) => {
  const { id, file, options } = event.data;
  try {
    const result = await resizeImage(file, options);
    const response: WorkerJobResponse<ResizeResult> = { id, ok: true, result };
    // Blob is structured-cloneable (not a Transferable itself), so no transfer list needed.
    (self as unknown as Worker).postMessage(response);
  } catch (err) {
    const response: WorkerJobResponse<ResizeResult> = {
      id,
      ok: false,
      error: err instanceof Error ? err.message : "Resize failed.",
    };
    (self as unknown as Worker).postMessage(response);
  }
};
