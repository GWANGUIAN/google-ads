import { withBase } from "@repo/file-tools-core/url.ts";
import type { ConvertPayload, EngineResult, FontEngineJobResponse } from "./types";

interface PendingJob {
  resolve: (result: EngineResult) => void;
  reject: (error: Error) => void;
}

/**
 * A single dedicated Worker for font conversion jobs — mirrors video-tools'
 * MediaEngineClient / localpdf's PdfEngineClient rather than img-convertor's
 * round-robin ConvertWorkerPool: the WOFF2 WASM module only needs to be
 * initialized once, and font conversion is CPU-light and near-instant per
 * file, so a pool would just pay that init cost N times for no real
 * parallelism benefit. Jobs from a multi-file batch queue through this one
 * worker sequentially.
 */
export class FontEngineClient {
  private worker: Worker | null = null;
  private pending = new Map<string, PendingJob>();
  private nextId = 0;

  private ensureWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL("./fontEngine.worker.ts", import.meta.url), { type: "module" });
      this.worker.onmessage = (event: MessageEvent<FontEngineJobResponse>) => this.handleMessage(event.data);
    }
    return this.worker;
  }

  private handleMessage(message: FontEngineJobResponse) {
    const job = this.pending.get(message.id);
    if (!job) return;
    this.pending.delete(message.id);
    if (message.ok) {
      job.resolve(message.result);
    } else {
      job.reject(new Error(message.error));
    }
  }

  run(payload: ConvertPayload): Promise<EngineResult> {
    this.nextId += 1;
    const id = `job${this.nextId}-${Date.now()}`;
    const wasmUrl = new URL(withBase("woff2.wasm"), window.location.origin).toString();
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ensureWorker().postMessage({ id, payload, wasmUrl });
    });
  }

  destroy() {
    this.worker?.terminate();
    this.worker = null;
    this.pending.clear();
  }
}
