import type { PdfEngineJobRequest, PdfEngineJobResponse, PdfEngineOp } from "./types";

interface PendingJob {
  resolve: (result: Blob | Blob[]) => void;
  reject: (error: Error) => void;
}

/**
 * A single dedicated Worker for pdf-lib operations (merge/images-to-pdf/page
 * edits/split). Unlike img-convertor's round-robin ConvertWorkerPool, this
 * doesn't need multiple workers: each user action is one job, not a batch of
 * independent per-file jobs, so concurrency is inherently 1 per action.
 */
export class PdfEngineClient {
  private worker: Worker | null = null;
  private pending = new Map<string, PendingJob>();
  private nextId = 0;

  private ensureWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL("./pdfEngine.worker.ts", import.meta.url), { type: "module" });
      this.worker.onmessage = (event: MessageEvent<PdfEngineJobResponse>) => this.handleMessage(event.data);
    }
    return this.worker;
  }

  private handleMessage(message: PdfEngineJobResponse) {
    const job = this.pending.get(message.id);
    if (!job) return;
    this.pending.delete(message.id);
    if (message.ok) {
      job.resolve(message.result);
    } else {
      job.reject(new Error(message.error));
    }
  }

  run<T extends Blob | Blob[]>(op: PdfEngineOp, payload: PdfEngineJobRequest["payload"]): Promise<T> {
    this.nextId += 1;
    const id = `job${this.nextId}-${Date.now()}`;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (result: Blob | Blob[]) => void, reject });
      this.ensureWorker().postMessage({ id, op, payload });
    });
  }

  destroy() {
    this.worker?.terminate();
    this.worker = null;
    this.pending.clear();
  }
}
