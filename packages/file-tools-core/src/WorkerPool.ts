/**
 * Generic round-robin pool of already-constructed Web Workers that run
 * per-file work off the main thread, so large multi-file batches don't
 * freeze the UI. Framework-agnostic: it knows nothing about what a "job"
 * actually does — callers parametrize `TOptions` (the job's input options)
 * and `TResult` (the job's success payload).
 *
 * Workers themselves are NOT constructed here: `new Worker(new URL(...))`
 * needs a literal relative URL at each app's own call site so Vite's
 * bundler can locate that app's worker file. Callers build the `Worker[]`
 * (e.g. via `defaultPoolSize()` below) and hand it to the constructor.
 */

export type WorkerJobResponse<TResult> =
  | { id: string; ok: true; result: TResult }
  | { id: string; ok: false; error: string };

export interface WorkerJobRequest<TOptions> {
  id: string;
  file: File;
  options: TOptions;
}

interface PendingJob<TResult> {
  resolve: (result: TResult) => void;
  reject: (error: Error) => void;
}

/** `Math.min(navigator.hardwareConcurrency, max)`, capped so large batches never spawn dozens of workers. */
export function defaultPoolSize(max = 4): number {
  return Math.min(navigator.hardwareConcurrency || max, max);
}

export class WorkerPool<TOptions, TResult> {
  private workers: Worker[];
  private nextWorker = 0;
  private pending = new Map<string, PendingJob<TResult>>();

  constructor(workers: Worker[]) {
    this.workers = workers;
    this.workers.forEach((worker) => {
      worker.onmessage = (event: MessageEvent<WorkerJobResponse<TResult>>) => this.handleMessage(event.data);
    });
  }

  private handleMessage(message: WorkerJobResponse<TResult>) {
    const job = this.pending.get(message.id);
    if (!job) return;
    this.pending.delete(message.id);
    if (message.ok) {
      job.resolve(message.result);
    } else {
      job.reject(new Error(message.error));
    }
  }

  run(id: string, file: File, options: TOptions): Promise<TResult> {
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      const worker = this.workers[this.nextWorker];
      this.nextWorker = (this.nextWorker + 1) % this.workers.length;
      const request: WorkerJobRequest<TOptions> = { id, file, options };
      worker?.postMessage(request);
    });
  }

  destroy() {
    this.workers.forEach((w) => w.terminate());
    this.workers = [];
    this.pending.clear();
  }
}
