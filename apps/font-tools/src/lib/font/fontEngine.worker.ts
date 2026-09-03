import { convertFont } from "./fontEngine";
import type { FontEngineJobRequest, FontEngineJobResponse } from "./types";

self.onmessage = async (event: MessageEvent<FontEngineJobRequest>) => {
  const { id, payload, wasmUrl } = event.data;

  try {
    const result = await convertFont(payload, wasmUrl);
    const response: FontEngineJobResponse = { id, type: "done", ok: true, result };
    // Transfer the ArrayBuffer instead of structured-cloning it.
    (self as unknown as Worker).postMessage(response, [result.buffer]);
  } catch (err) {
    const response: FontEngineJobResponse = {
      id,
      type: "done",
      ok: false,
      error: err instanceof Error ? err.message : "Font conversion failed.",
    };
    (self as unknown as Worker).postMessage(response);
  }
};
