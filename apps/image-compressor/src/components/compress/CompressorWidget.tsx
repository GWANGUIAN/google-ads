import { useCallback, useEffect, useRef, useState } from "react";
import Dropzone from "@repo/file-tools-core/Dropzone.tsx";
import CompressorQueueRow from "./CompressorQueueRow";
import DownloadAllButton from "./DownloadAllButton";
import { WorkerPool, defaultPoolSize } from "@repo/file-tools-core/WorkerPool.ts";
import { downloadBlob } from "@repo/file-tools-core/zip.ts";
import type { CompressOptions, CompressResult } from "@/lib/compress/types";

/** Builds this app's own Worker[] — Vite needs the `new URL("./worker.ts", import.meta.url)`
 * literal at this call site (relative to this file) so its bundler can locate the worker file. */
function createCompressWorkers(): Worker[] {
  const size = defaultPoolSize();
  return Array.from(
    { length: size },
    () => new Worker(new URL("../../lib/compress/worker.ts", import.meta.url), { type: "module" }),
  );
}

export interface QueueItem {
  id: string;
  file: File;
  status: "queued" | "converting" | "done" | "error";
  result?: CompressResult;
  error?: string;
  /** PNG has no lossy quality knob — the slider has no effect on it. */
  isLossy: boolean;
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `f${idCounter}-${Date.now()}`;
}

const LOSSY_MIME_TYPES = new Set(["image/jpeg", "image/webp"]);
const QUALITY_RECOMPRESS_DEBOUNCE_MS = 250;

export default function CompressorWidget({ accept }: { accept?: string }) {
  const [quality, setQuality] = useState(80);
  const [items, setItems] = useState<QueueItem[]>([]);
  const poolRef = useRef<WorkerPool<CompressOptions, CompressResult> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    poolRef.current = new WorkerPool<CompressOptions, CompressResult>(createCompressWorkers());
    return () => poolRef.current?.destroy();
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const compressItem = useCallback(async (item: QueueItem, qualityPercent: number) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "converting" } : i)));
    try {
      const result = await poolRef.current!.run(item.id, item.file, { quality: qualityPercent / 100 });
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "done", result } : i)));
    } catch (err) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: "error", error: err instanceof Error ? err.message : "Compression failed." }
            : i,
        ),
      );
    }
  }, []);

  const handleFiles = useCallback(
    (files: File[]) => {
      const newItems: QueueItem[] = files.map((file) => ({
        id: nextId(),
        file,
        status: "queued",
        isLossy: LOSSY_MIME_TYPES.has(file.type),
      }));
      setItems((prev) => [...prev, ...newItems]);
      newItems.forEach((item) => compressItem(item, quality));
    },
    [compressItem, quality],
  );

  // The quality NUMBER updates instantly on every drag tick (setQuality is
  // synchronous, no debounce) so the UI never feels laggy. The actual worker
  // recompute — real per-file re-encoding — is debounced so a fast drag
  // doesn't spam the worker pool with a job per pixel of movement. Only
  // lossy (JPG/WEBP) items are re-queued: PNG ignores quality entirely, so
  // recomputing it on a quality-only change would just repeat the same work.
  function handleQualityChange(next: number) {
    setQuality(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setItems((currentItems) => {
        currentItems
          .filter((i) => i.isLossy && (i.status === "done" || i.status === "error"))
          .forEach((i) => compressItem(i, next));
        return currentItems;
      });
    }, QUALITY_RECOMPRESS_DEBOUNCE_MS);
  }

  function handleDownload(item: QueueItem) {
    if (item.result) downloadBlob(item.result.blob, item.file.name);
  }

  function handleRemove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleClearAll() {
    setItems([]);
  }

  const hasLossyItems = items.some((i) => i.isLossy);

  return (
    <div className="rounded-card border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 px-5 py-4">
        <p className="text-sm font-semibold text-neutral-800">Image compressor</p>
        <label className="flex flex-1 items-center gap-3 text-sm font-medium text-neutral-700 sm:max-w-xs">
          Quality
          <input
            type="range"
            min={10}
            max={100}
            value={quality}
            onChange={(e) => handleQualityChange(Number(e.target.value))}
            className="flex-1 accent-accent-600"
            aria-label="Compression quality"
          />
          <span className="w-10 shrink-0 text-right font-semibold text-accent-700">{quality}</span>
        </label>
      </div>

      {hasLossyItems && (
        <p className="border-b border-neutral-100 px-5 py-2 text-xs text-neutral-500">
          Quality applies to JPG and WEBP files. PNG has no lossy quality setting — it's re-encoded losslessly.
        </p>
      )}

      <div className="p-5">
        <Dropzone onFiles={handleFiles} accept={accept} />
      </div>

      {items.length > 0 && (
        <div className="border-t border-neutral-100">
          <div className="max-h-96 overflow-y-auto">
            {items.map((item) => (
              <CompressorQueueRow key={item.id} item={item} onDownload={handleDownload} onRemove={handleRemove} />
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-5 py-4">
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-700"
            >
              Clear all
            </button>
            <DownloadAllButton items={items} />
          </div>
        </div>
      )}
    </div>
  );
}
