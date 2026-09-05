import { useCallback, useEffect, useRef, useState } from "react";
import Dropzone from "@repo/file-tools-core/Dropzone.tsx";
import FormatSelect from "./FormatSelect";
import FileQueueRow from "./FileQueueRow";
import DownloadAllButton from "./DownloadAllButton";
import { WorkerPool, defaultPoolSize } from "@repo/file-tools-core/WorkerPool.ts";
import { downloadBlob } from "@repo/file-tools-core/zip.ts";
import type { ConvertOptions, ConvertResult, OutputFormatCode } from "@/lib/convert/types";

/** Builds this app's own Worker[] — Vite needs the `new URL("./worker.ts", import.meta.url)`
 * literal at this call site (relative to this file) so its bundler can locate the worker file. */
function createConvertWorkers(): Worker[] {
  const size = defaultPoolSize();
  return Array.from(
    { length: size },
    () => new Worker(new URL("../../lib/convert/worker.ts", import.meta.url), { type: "module" }),
  );
}

export interface QueueItem {
  id: string;
  file: File;
  status: "queued" | "converting" | "done" | "error";
  result?: ConvertResult;
  error?: string;
  outputFilename: string;
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `f${idCounter}-${Date.now()}`;
}

function withOutputExtension(filename: string, format: OutputFormatCode): string {
  const base = filename.replace(/\.[^./]+$/, "");
  const ext = format === "jpg" ? "jpg" : format;
  return `${base}.${ext}`;
}

export default function ConverterWidget({
  initialTarget = "webp",
  lockTarget = false,
  accept,
}: {
  initialTarget?: OutputFormatCode;
  lockTarget?: boolean;
  accept?: string;
}) {
  const [target, setTarget] = useState<OutputFormatCode>(initialTarget);
  const [items, setItems] = useState<QueueItem[]>([]);
  const poolRef = useRef<WorkerPool<ConvertOptions, ConvertResult> | null>(null);

  useEffect(() => {
    poolRef.current = new WorkerPool<ConvertOptions, ConvertResult>(createConvertWorkers());
    return () => poolRef.current?.destroy();
  }, []);

  const convertItem = useCallback(
    async (item: QueueItem, formatToUse: OutputFormatCode) => {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "converting" } : i)));
      try {
        const result = await poolRef.current!.run(item.id, item.file, { targetFormat: formatToUse });
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: "done",
                  result,
                  outputFilename: withOutputExtension(i.file.name, formatToUse),
                }
              : i,
          ),
        );
      } catch (err) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: "error", error: err instanceof Error ? err.message : "Conversion failed." }
              : i,
          ),
        );
      }
    },
    [],
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      const newItems: QueueItem[] = files.map((file) => ({
        id: nextId(),
        file,
        status: "queued",
        outputFilename: withOutputExtension(file.name, target),
      }));
      setItems((prev) => [...prev, ...newItems]);
      newItems.forEach((item) => convertItem(item, target));
    },
    [convertItem, target],
  );

  function handleDownload(item: QueueItem) {
    if (item.result) downloadBlob(item.result.blob, item.outputFilename);
  }

  function handleRemove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleClearAll() {
    setItems([]);
  }

  return (
    <div className="rounded-card border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
        <p className="text-sm font-semibold text-neutral-800">Image converter</p>
        {!lockTarget && <FormatSelect value={target} onChange={setTarget} />}
      </div>

      <div className="p-5">
        <Dropzone onFiles={handleFiles} accept={accept} />
      </div>

      {items.length > 0 && (
        <div className="border-t border-neutral-100">
          <div className="max-h-96 overflow-y-auto">
            {items.map((item) => (
              <FileQueueRow key={item.id} item={item} onDownload={handleDownload} onRemove={handleRemove} />
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
