import { useEffect, useRef, useState } from "react";
import Dropzone from "./Dropzone";
import PdfFileListItem from "./PdfFileListItem";
import { PdfEngineClient } from "@/lib/pdf/pdfEngineClient";
import { downloadBlob } from "@/lib/pdf/download";
import { imageCountWarning } from "@/lib/pdf/fileGuards";

interface QueuedImage {
  id: string;
  file: File;
  thumbUrl: string;
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `img${idCounter}-${Date.now()}`;
}

export default function ImagesToPdfWidget({ accept }: { accept?: string }) {
  const [items, setItems] = useState<QueuedImage[]>([]);
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<PdfEngineClient | null>(null);

  useEffect(() => {
    clientRef.current = new PdfEngineClient();
    return () => clientRef.current?.destroy();
  }, []);

  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => {
    return () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.thumbUrl));
  }, []);

  function handleFiles(files: File[]) {
    setError(null);
    const newItems = files.map((file) => ({ id: nextId(), file, thumbUrl: URL.createObjectURL(file) }));
    setItems((prev) => [...prev, ...newItems]);
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
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.thumbUrl);
      return prev.filter((i) => i.id !== id);
    });
  }

  async function handleCreate() {
    if (!clientRef.current || items.length === 0) return;
    setStatus("working");
    setError(null);
    try {
      const blob = await clientRef.current.run<Blob>("imagesToPdf", { files: items.map((i) => i.file) });
      downloadBlob(blob, "images.pdf");
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not create the PDF.");
    }
  }

  const warning = imageCountWarning(items.length);

  return (
    <div className="rounded-card border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-4">
        <p className="text-sm font-semibold text-neutral-800">Images → PDF</p>
      </div>

      <div className="p-5">
        <Dropzone onFiles={handleFiles} accept={accept ?? "image/*"} hint="Add as many images as you like — reorder them below" />
      </div>

      {items.length > 0 && (
        <div className="border-t border-neutral-100">
          <div className="max-h-96 overflow-y-auto">
            {items.map((item, index) => (
              <PdfFileListItem
                key={item.id}
                name={item.file.name}
                sizeBytes={item.file.size}
                thumbnailUrl={item.thumbUrl}
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

          <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-5 py-4">
            <span className="text-xs text-neutral-500">
              {items.length} image{items.length === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={handleCreate}
              disabled={status === "working"}
              className="rounded-control bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-60"
            >
              {status === "working" ? "Creating PDF…" : "Create PDF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
