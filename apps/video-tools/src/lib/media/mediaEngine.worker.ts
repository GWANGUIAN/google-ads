import { compressVideo, trimVideo } from "./mediaEngine";
import type { CompressPayload, MediaEngineJobRequest, MediaEngineJobResponse, TrimPayload } from "./types";

self.onmessage = async (event: MessageEvent<MediaEngineJobRequest>) => {
  const { id, op, payload } = event.data;

  const onProgress = (pct: number) => {
    const message: MediaEngineJobResponse = { id, type: "progress", pct };
    (self as unknown as Worker).postMessage(message);
  };

  try {
    const result =
      op === "compress"
        ? await compressVideo(payload as CompressPayload, onProgress)
        : await trimVideo(payload as TrimPayload, onProgress);
    const response: MediaEngineJobResponse = { id, type: "done", ok: true, result };
    // Transfer the ArrayBuffer instead of structured-cloning it — video
    // output can be tens of megabytes, and a transfer is effectively free.
    (self as unknown as Worker).postMessage(response, [result.buffer]);
  } catch (err) {
    const response: MediaEngineJobResponse = {
      id,
      type: "done",
      ok: false,
      error: err instanceof Error ? err.message : "Video processing failed.",
    };
    (self as unknown as Worker).postMessage(response);
  }
};
