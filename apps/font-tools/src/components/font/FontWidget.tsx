import { useEffect, useRef, useState } from "react";
import Dropzone from "./Dropzone";
import FontPreview from "./FontPreview";
import { FontEngineClient } from "@/lib/font/fontEngineClient";
import { downloadBuffer } from "@/lib/font/download";
import { zipFiles } from "@/lib/font/zip";
import { checkFontSupport, type SupportCheck } from "@/lib/font/capability";
import { FORMATS, TARGET_FORMATS, detectSourceFormat, type FontFormatCode } from "@/data/formats";
import type { EngineResult } from "@/lib/font/types";

function outputFilename(original: string, targetExt: string): string {
  const base = original.replace(/\.[^.]+$/, "");
  return `${base}.${targetExt}`;
}

interface FileItem {
  id: string;
  file: File;
  source: FontFormatCode | null;
  status: "queued" | "converting" | "done" | "error";
  error?: string;
  result?: EngineResult;
}

interface Props {
  initialTarget?: FontFormatCode;
  lockTarget?: boolean;
  acceptSource?: FontFormatCode;
}

let nextItemId = 0;

export default function FontWidget({ initialTarget = "woff2", lockTarget = false, acceptSource }: Props) {
  const [target, setTarget] = useState<FontFormatCode>(initialTarget);
  const [items, setItems] = useState<FileItem[]>([]);
  // Assume supported until the client-only check runs in an effect — checking
  // `window` during the initial render would differ between server and
  // client, causing a React hydration mismatch (SSR always sees no window).
  const [support, setSupport] = useState<SupportCheck>({ supported: true });
  const clientRef = useRef<FontEngineClient | null>(null);

  useEffect(() => {
    setSupport(checkFontSupport());
    clientRef.current = new FontEngineClient();
    return () => clientRef.current?.destroy();
  }, []);

  const accept = acceptSource ? FORMATS[acceptSource].extensions.join(",") : ".ttf,.otf,.woff,.woff2";

  function handleFiles(files: File[]) {
    const newItems: FileItem[] = files.map((file) => ({
      id: `f${nextItemId++}`,
      file,
      source: detectSourceFormat(file.name),
      status: "queued",
    }));
    setItems((prev) => [...prev, ...newItems]);
  }

  async function convertItem(item: FileItem, targetFormat: FontFormatCode) {
    if (!item.source || !clientRef.current) return;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "converting", error: undefined } : i)));
    try {
      const result = await clientRef.current.run({ file: item.file, source: item.source, target: targetFormat });
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "done", result } : i)));
    } catch (err) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "error", error: err instanceof Error ? err.message : "Conversion failed." } : i,
        ),
      );
    }
  }

  async function handleConvertAll() {
    const toConvert = items.filter((i) => i.status === "queued" || i.status === "error");
    for (const item of toConvert) {
      await convertItem(item, target);
    }
  }

  function handleDownload(item: FileItem) {
    if (!item.result) return;
    downloadBuffer(item.result.buffer, item.result.mimeType, outputFilename(item.file.name, item.result.extension));
  }

  async function handleDownloadAll() {
    const done = items.filter((i) => i.status === "done" && i.result);
    if (done.length < 2) return;
    const blob = await zipFiles(
      done.map((i) => ({
        name: outputFilename(i.file.name, i.result!.extension),
        blob: new Blob([i.result!.buffer], { type: i.result!.mimeType }),
      })),
    );
    downloadBuffer(await blob.arrayBuffer(), "application/zip", "fonts.zip");
  }

  function handleRemove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const doneCount = items.filter((i) => i.status === "done").length;
  const hasQueued = items.some((i) => i.status === "queued" || i.status === "error");

  if (!support.supported) {
    return <div className="rounded-card border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">{support.reason}</div>;
  }

  return (
    <div className="rounded-card border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-4">
        <p className="text-sm font-semibold text-neutral-800">Convert font</p>
      </div>

      <div className="p-5">
        {!lockTarget && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-medium text-neutral-700">
            Convert to
            <div className="flex gap-1">
              {TARGET_FORMATS.map((f) => (
                <button
                  key={f.code}
                  type="button"
                  onClick={() => setTarget(f.code)}
                  className={`rounded-control px-3 py-1.5 text-sm font-semibold ${
                    target === f.code ? "bg-accent-50 text-accent-700" : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <Dropzone onFiles={handleFiles} accept={accept} multiple hint="Upload TTF, OTF, WOFF, or WOFF2 font files" />
      </div>

      {items.length > 0 && (
        <div className="space-y-3 border-t border-neutral-100 p-5">
          {items.map((item) => (
            <div key={item.id} className="rounded-control border border-neutral-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-800">{item.file.name}</p>
                  <p className="text-xs text-neutral-500">
                    {item.source ? FORMATS[item.source].label : "Unrecognized format"}
                    {item.status === "done" && item.result ? ` → ${FORMATS[target].label}` : null}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {item.status === "done" && (
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      className="rounded-control border border-accent-600 px-3 py-1.5 text-xs font-semibold text-accent-700 hover:bg-accent-50"
                    >
                      Download
                    </button>
                  )}
                  {item.status === "converting" && <span className="text-xs text-neutral-500">Converting…</span>}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="text-xs text-neutral-400 hover:text-neutral-600"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {!item.source && <p className="mt-2 text-xs text-danger-500">This file's extension isn't a recognized font format.</p>}
              {item.error && <p className="mt-2 text-xs text-danger-500">{item.error}</p>}

              {item.source && item.status !== "converting" && (
                <div className="mt-3">
                  <FontPreview file={item.file} />
                </div>
              )}
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleConvertAll}
              disabled={!hasQueued}
              className="rounded-control bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-60"
            >
              Convert {items.length > 1 ? "all" : ""} to {FORMATS[target].label}
            </button>
            {doneCount >= 2 && (
              <button
                type="button"
                onClick={handleDownloadAll}
                className="rounded-control border border-accent-600 px-4 py-2 text-sm font-semibold text-accent-700 hover:bg-accent-50"
              >
                Download all as ZIP
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
