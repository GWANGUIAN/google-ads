import { useCallback, useEffect, useRef, useState } from "react";
import Dropzone from "@repo/file-tools-core/Dropzone.tsx";
import { WorkerPool, defaultPoolSize } from "@repo/file-tools-core/WorkerPool.ts";
import { downloadBlob } from "@repo/file-tools-core/zip.ts";
import ResizerQueueRow from "./ResizerQueueRow";
import DownloadAllButton from "./DownloadAllButton";
import { getImageDimensions } from "@/lib/resize/engine";
import { RESIZE_PRESETS, findPreset } from "@/data/presets";
import type { ResizeOptions, ResizeResult } from "@/lib/resize/types";

/** Builds this app's own Worker[] — Vite needs the `new URL("./worker.ts", import.meta.url)`
 * literal at this call site (relative to this file) so its bundler can locate the worker file. */
function createResizeWorkers(): Worker[] {
  const size = defaultPoolSize();
  return Array.from(
    { length: size },
    () => new Worker(new URL("../../lib/resize/worker.ts", import.meta.url), { type: "module" }),
  );
}

export interface QueueItem {
  id: string;
  file: File;
  status: "queued" | "converting" | "done" | "error";
  naturalWidth?: number;
  naturalHeight?: number;
  targetWidth?: number;
  targetHeight?: number;
  /** True when the no-upscale guard kept this file at its native size
   * instead of stretching it up to the requested target. */
  clamped?: boolean;
  result?: ResizeResult;
  error?: string;
  outputFilename: string;
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `f${idCounter}-${Date.now()}`;
}

function withResizedSuffix(filename: string, width: number, height: number): string {
  const dot = filename.lastIndexOf(".");
  const base = dot > 0 ? filename.slice(0, dot) : filename;
  const ext = dot > 0 ? filename.slice(dot) : "";
  return `${base}-${width}x${height}${ext}`;
}

const DEBOUNCE_MS = 250;

export default function ResizerWidget({ initialPresetSlug }: { initialPresetSlug?: string }) {
  const initialPreset = initialPresetSlug ? findPreset(initialPresetSlug) : undefined;

  const [presetSlug, setPresetSlug] = useState<string>(initialPreset ? initialPreset.slug : "custom");
  const [width, setWidth] = useState<number>(initialPreset?.width ?? 1080);
  const [height, setHeight] = useState<number>(initialPreset?.height ?? 1080);
  const [aspectLocked, setAspectLocked] = useState(true);
  const [noUpscale, setNoUpscale] = useState(true);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [hasRatio, setHasRatio] = useState(false);

  const poolRef = useRef<WorkerPool<ResizeOptions, ResizeResult> | null>(null);
  // Aspect ratio (width / height) of the first dropped file — used to keep
  // aspect-lock computations consistent across a batch of mixed-ratio files.
  const ratioRef = useRef<number | null>(null);
  const itemsRef = useRef<QueueItem[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped on every recompute request per item id so a stale worker result
  // (from settings that have since changed again) is discarded on arrival.
  const versionRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    poolRef.current = new WorkerPool<ResizeOptions, ResizeResult>(createResizeWorkers());
    return () => poolRef.current?.destroy();
  }, []);

  const runResize = useCallback((item: QueueItem, targetWidth: number, targetHeight: number, clamped: boolean) => {
    const myVersion = (versionRef.current.get(item.id) ?? 0) + 1;
    versionRef.current.set(item.id, myVersion);

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, status: "converting", targetWidth, targetHeight, clamped } : i,
      ),
    );

    poolRef.current!.run(item.id, item.file, { width: targetWidth, height: targetHeight }).then(
      (result) => {
        if (versionRef.current.get(item.id) !== myVersion) return; // superseded by a newer request
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: "done",
                  result,
                  outputFilename: withResizedSuffix(i.file.name, targetWidth, targetHeight),
                }
              : i,
          ),
        );
      },
      (err) => {
        if (versionRef.current.get(item.id) !== myVersion) return;
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: "error", error: err instanceof Error ? err.message : "Resize failed." }
              : i,
          ),
        );
      },
    );
  }, []);

  const computeAndRun = useCallback(
    (item: QueueItem, targetW: number, targetH: number, noUp: boolean) => {
      let effectiveW = Math.max(1, Math.round(targetW));
      let effectiveH = Math.max(1, Math.round(targetH));
      let clamped = false;

      if (noUp && item.naturalWidth && item.naturalHeight) {
        if (effectiveW > item.naturalWidth || effectiveH > item.naturalHeight) {
          effectiveW = item.naturalWidth;
          effectiveH = item.naturalHeight;
          clamped = true;
        }
      }

      runResize(item, effectiveW, effectiveH, clamped);
    },
    [runResize],
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      const newItems: QueueItem[] = files.map((file) => ({
        id: nextId(),
        file,
        status: "queued",
        outputFilename: file.name,
      }));
      setItems((prev) => [...prev, ...newItems]);

      newItems.forEach((item) => {
        getImageDimensions(item.file).then(
          (dims) => {
            if (ratioRef.current === null) {
              ratioRef.current = dims.width / dims.height;
              setHasRatio(true);
            }
            const withDims: QueueItem = { ...item, naturalWidth: dims.width, naturalHeight: dims.height };
            setItems((prev) => prev.map((i) => (i.id === item.id ? withDims : i)));
            computeAndRun(withDims, width, height, noUpscale);
          },
          () => {
            setItems((prev) =>
              prev.map((i) =>
                i.id === item.id ? { ...i, status: "error", error: "Could not read this image." } : i,
              ),
            );
          },
        );
      });
    },
    [computeAndRun, width, height, noUpscale],
  );

  // Debounced recompute: whenever the target width/height or the no-upscale
  // guard changes, re-run every file whose natural dimensions are already
  // known (aspect-lock itself doesn't need its own trigger — it only changes
  // how width/height get derived when the user edits one of the fields).
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      itemsRef.current.forEach((item) => {
        if (item.naturalWidth && item.naturalHeight) {
          computeAndRun(item, width, height, noUpscale);
        }
      });
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [width, height, noUpscale, computeAndRun]);

  function handleWidthInput(value: number) {
    if (!Number.isFinite(value) || value <= 0) return;
    setPresetSlug("custom");
    setWidth(value);
    if (aspectLocked && ratioRef.current) {
      setHeight(Math.max(1, Math.round(value / ratioRef.current)));
    }
  }

  function handleHeightInput(value: number) {
    if (!Number.isFinite(value) || value <= 0) return;
    setPresetSlug("custom");
    setHeight(value);
    if (aspectLocked && ratioRef.current) {
      setWidth(Math.max(1, Math.round(value * ratioRef.current)));
    }
  }

  function handlePresetSelect(slug: string) {
    setPresetSlug(slug);
    const preset = findPreset(slug);
    if (preset) {
      setWidth(preset.width);
      setHeight(preset.height);
    }
  }

  function handleAspectToggle(checked: boolean) {
    setAspectLocked(checked);
    if (checked && ratioRef.current) {
      setHeight(Math.max(1, Math.round(width / ratioRef.current)));
    }
  }

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
      <div className="space-y-3 border-b border-neutral-100 px-5 py-4">
        <p className="text-sm font-semibold text-neutral-800">Image resizer</p>

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
            Preset
            <select
              value={presetSlug}
              onChange={(e) => handlePresetSelect(e.target.value)}
              className="rounded-control border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-800"
            >
              <option value="custom">Custom size</option>
              {RESIZE_PRESETS.map((preset) => (
                <option key={preset.slug} value={preset.slug}>
                  {preset.label} ({preset.width}×{preset.height})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
            Width (px)
            <input
              type="number"
              min={1}
              value={width}
              onChange={(e) => handleWidthInput(Number(e.target.value))}
              className="w-24 rounded-control border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-800"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600">
            Height (px)
            <input
              type="number"
              min={1}
              value={height}
              onChange={(e) => handleHeightInput(Number(e.target.value))}
              className="w-24 rounded-control border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-800"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={aspectLocked}
              onChange={(e) => handleAspectToggle(e.target.checked)}
              className="h-3.5 w-3.5 accent-accent-600"
            />
            Lock aspect ratio
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={noUpscale}
              onChange={(e) => setNoUpscale(e.target.checked)}
              className="h-3.5 w-3.5 accent-accent-600"
            />
            Don&apos;t upscale
          </label>
          {aspectLocked && hasRatio && (
            <span className="text-neutral-400">Aspect ratio locked to your first image</span>
          )}
        </div>
      </div>

      <div className="p-5">
        <Dropzone onFiles={handleFiles} />
      </div>

      {items.length > 0 && (
        <div className="border-t border-neutral-100">
          <div className="max-h-96 overflow-y-auto">
            {items.map((item) => (
              <ResizerQueueRow key={item.id} item={item} onDownload={handleDownload} onRemove={handleRemove} />
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
