import { useEffect, useRef, useState } from "react";
import Dropzone from "./Dropzone";
import PdfFileListItem from "./PdfFileListItem";
import { PdfEngineClient } from "@/lib/pdf/pdfEngineClient";
import { downloadBlob } from "@/lib/pdf/download";
import { pdfSizeWarning } from "@/lib/pdf/fileGuards";

interface QueuedPdf {
  id: string;
  file: File;
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `pdf${idCounter}-${Date.now()}`;
}

export default function MergeWidget() {
  const [items, setItems] = useState<QueuedPdf[]>([]);
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<PdfEngineClient | null>(null);

  useEffect(() => {
    clientRef.current = new PdfEngineClient();
    return () => clientRef.current?.destroy();
  }, []);

  function handleFiles(files: File[]) {
    setError(null);
    setItems((prev) => [...prev, ...files.map((file) => ({ id: nextId(), file }))]);
  }

  function move(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleMerge() {
    if (!clientRef.current || items.length < 2) return;
    setStatus("working");
    setError(null);
    try {
      const blob = await clientRef.current.run<Blob>("mergePdfs", { files: items.map((i) => i.file) });
      downloadBlob(blob, "merged.pdf");
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not merge these PDFs.");
    }
  }

  const warning = items.map((i) => pdfSizeWarning(i.file)).find(Boolean);

  return (
    <div className="rounded-card border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-4">
        <p className="text-sm font-semibold text-neutral-800">Merge PDFs</p>
      </div>

      <div className="p-5">
        <Dropzone onFiles={handleFiles} accept="application/pdf" hint="Add two or more PDFs — reorder them below" />
      </div>

      {items.length > 0 && (
        <div className="border-t border-neutral-100">
          <div className="max-h-96 overflow-y-auto">
            {items.map((item, index) => (
              <PdfFileListItem
                key={item.id}
                name={item.file.name}
                sizeBytes={item.file.size}
                index={index}
                total={items.length}
                onMoveUp={() => move(index, -1)}
                onMoveDown={() => move(index, 1)}
                onRemove={() => remove(item.id)}
              />
            ))}
          </div>

          {warning && <p className="border-t border-neutral-100 px-5 py-2 text-xs text-amber-600">{warning}</p>}
          {error && <p className="border-t border-neutral-100 px-5 py-2 text-xs text-danger-500">{error}</p>}
          {items.length === 1 && (
            <p className="border-t border-neutral-100 px-5 py-2 text-xs text-neutral-500">Add at least one more PDF to merge.</p>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-5 py-4">
            <span className="text-xs text-neutral-500">
              {items.length} file{items.length === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={handleMerge}
              disabled={status === "working" || items.length < 2}
              className="rounded-control bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-60"
            >
              {status === "working" ? "Merging…" : "Merge PDFs"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
