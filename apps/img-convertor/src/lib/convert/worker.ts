import { convertImage } from "./engine";
import type { WorkerJobRequest, WorkerJobResponse } from "./types";

self.onmessage = async (event: MessageEvent<WorkerJobRequest>) => {
  const { id, file, options } = event.data;
  try {
    const result = await convertImage(file, options);
    const response: WorkerJobResponse = { id, ok: true, result };
    // Blob is structured-cloneable (not a Transferable itself), so no transfer list needed.
    (self as unknown as Worker).postMessage(response);
  } catch (err) {
    const response: WorkerJobResponse = {
      id,
      ok: false,
      error: err instanceof Error ? err.message : "Conversion failed.",
    };
    (self as unknown as Worker).postMessage(response);
  }
};
