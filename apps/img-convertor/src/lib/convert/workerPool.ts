import type { ConvertOptions, ConvertResult, WorkerJobResponse } from "./types";

interface PendingJob {
  resolve: (result: ConvertResult) => void;
  reject: (error: Error) => void;
}

/**
 * Small pool of Web Workers that run image conversion off the main thread,
 * so large multi-file batches don't freeze the UI. Capped concurrency avoids
 * spawning dozens of workers for large batches.
 */
export class ConvertWorkerPool {
  private workers: Worker[] = [];
  private nextWorker = 0;
  private pending = new Map<string, PendingJob>();

  constructor(size = Math.min(navigator.hardwareConcurrency || 4, 4)) {
    for (let i = 0; i < size; i++) {
      const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (event: MessageEvent<WorkerJobResponse>) => this.handleMessage(event.data);
      this.workers.push(worker);
    }
  }

  private handleMessage(message: WorkerJobResponse) {
    const job = this.pending.get(message.id);
    if (!job) return;
    this.pending.delete(message.id);
    if (message.ok) {
      job.resolve(message.result);
    } else {
      job.reject(new Error(message.error));
    }
  }

  convert(id: string, file: File, options: ConvertOptions): Promise<ConvertResult> {
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      const worker = this.workers[this.nextWorker];
      this.nextWorker = (this.nextWorker + 1) % this.workers.length;
      worker?.postMessage({ id, file, options });
    });
  }

  destroy() {
    this.workers.forEach((w) => w.terminate());
    this.workers = [];
    this.pending.clear();
  }
}
