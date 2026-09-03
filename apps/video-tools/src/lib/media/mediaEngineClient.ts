import type { CompressPayload, EngineResult, MediaEngineJobResponse, MediaEngineOp, TrimPayload } from "./types";

interface PendingJob {
  resolve: (result: EngineResult) => void;
  reject: (error: Error) => void;
  onProgress?: (pct: number) => void;
}

/**
 * A single dedicated Worker for video compress/trim jobs. Unlike
 * img-convertor's round-robin ConvertWorkerPool, this doesn't need multiple
 * workers: each user action is one heavy job, not a batch of independent
 * per-file jobs, so concurrency is inherently 1 per action — same reasoning
 * as apps/localpdf's PdfEngineClient, which this mirrors, plus progress
 * events since video jobs take real wall-clock time.
 */
export class MediaEngineClient {
  private worker: Worker | null = null;
  private pending = new Map<string, PendingJob>();
  private nextId = 0;

  private ensureWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL("./mediaEngine.worker.ts", import.meta.url), { type: "module" });
      this.worker.onmessage = (event: MessageEvent<MediaEngineJobResponse>) => this.handleMessage(event.data);
    }
    return this.worker;
  }

  private handleMessage(message: MediaEngineJobResponse) {
    const job = this.pending.get(message.id);
    if (!job) return;

    if (message.type === "progress") {
      job.onProgress?.(message.pct);
      return;
    }

    this.pending.delete(message.id);
    if (message.ok) {
      job.resolve(message.result);
    } else {
      job.reject(new Error(message.error));
    }
  }

  run(op: MediaEngineOp, payload: CompressPayload | TrimPayload, onProgress?: (pct: number) => void): Promise<EngineResult> {
    this.nextId += 1;
    const id = `job${this.nextId}-${Date.now()}`;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, onProgress });
      this.ensureWorker().postMessage({ id, op, payload });
    });
  }

  destroy() {
    this.worker?.terminate();
    this.worker = null;
    this.pending.clear();
  }
}
