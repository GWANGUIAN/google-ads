import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Dropzone from "./Dropzone";
import PageThumbnail from "./PageThumbnail";
import ProcessAction, { type ProcessStatus } from "./ProcessAction";
import { PdfEngineClient } from "@/lib/pdf/pdfEngineClient";
import { downloadBlob } from "@/lib/pdf/download";
import { getPageCount, loadPdfForRender, renderThumbnailDataUrl, type PdfDocumentProxy } from "@/lib/pdf/render";
import type { RotationMap } from "@/lib/pdf/types";

interface PageState {
  key: string;
  originalIndex: number;
  rotation: 0 | 90 | 180 | 270;
  thumbUrl: string | null;
}

let keyCounter = 0;
function nextKey() {
  keyCounter += 1;
  return `pg${keyCounter}`;
}

export default function PageOrganizer({ actionLabel }: { actionLabel: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageState[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | ProcessStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const pdfRef = useRef<PdfDocumentProxy | null>(null);
  const engineRef = useRef<PdfEngineClient | null>(null);
  const dragIndexRef = useRef<number | null>(null);

  if (!engineRef.current) engineRef.current = new PdfEngineClient();

  function invalidateResult() {
    setResult(null);
    setStatus((s) => (s === "done" ? "idle" : s));
  }

  async function handleFiles(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    setError(null);
    setFile(picked);
    setPages([]);
    setResult(null);
    setStatus("loading");
    try {
      const pdf = await loadPdfForRender(picked);
      pdfRef.current = pdf;
      const count = getPageCount(pdf);
      const initial: PageState[] = Array.from({ length: count }, (_, i) => ({
        key: nextKey(),
        originalIndex: i,
        rotation: 0,
        thumbUrl: null,
      }));
      setPages(initial);
      setStatus("idle");

      // Thumbnails render one page at a time (each render.ts call is async
      // and yields to the event loop between pages) rather than all at once,
      // so large PDFs don't block the main thread in one long burst.
      for (let i = 0; i < count; i++) {
        const url = await renderThumbnailDataUrl(pdf, i);
        setPages((prev) => prev.map((p) => (p.originalIndex === i ? { ...p, thumbUrl: url } : p)));
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not open this PDF.");
    }
  }

  function moveTo(from: number, to: number) {
    setPages((prev) => {
      if (to < 0 || to >= prev.length || from === to) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    invalidateResult();
  }

  function rotate(index: number) {
    setPages((prev) =>
      prev.map((p, i) => (i === index ? { ...p, rotation: (((p.rotation + 90) % 360) as 0 | 90 | 180 | 270) } : p)),
    );
    invalidateResult();
  }

  function remove(index: number) {
    setPages((prev) => prev.filter((_, i) => i !== index));
    invalidateResult();
  }

  function handleDragHandlePointerDown(e: ReactPointerEvent<HTMLButtonElement>, index: number) {
    dragIndexRef.current = index;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleContainerPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (dragIndexRef.current === null) return;
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-page-index]");
    if (!el) return;
    const targetIndex = Number(el.dataset.pageIndex);
    if (!Number.isNaN(targetIndex) && targetIndex !== dragIndexRef.current) {
      moveTo(dragIndexRef.current, targetIndex);
      dragIndexRef.current = targetIndex;
    }
  }

  function handleContainerPointerUp() {
    dragIndexRef.current = null;
  }

  async function handleSave() {
    if (!file || !engineRef.current || pages.length === 0) return;
    setStatus("working");
    setError(null);
    try {
      const pageOrder = pages.map((p) => p.originalIndex);
      const rotations: RotationMap = {};
      pages.forEach((p) => {
        if (p.rotation) rotations[p.originalIndex] = p.rotation;
      });
      const blob = await engineRef.current.run<Blob>("applyPageEdits", { file, pageOrder, rotations });
      setResult(blob);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not save this PDF.");
    }
  }

  function handleDownload() {
    if (!result || !file) return;
    downloadBlob(result, `${file.name.replace(/\.pdf$/i, "")}-edited.pdf`);
  }

  return (
    <div className="rounded-card border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-4">
        <p className="text-sm font-semibold text-neutral-800">{actionLabel}</p>
      </div>

      <div className="p-5">
        <Dropzone onFiles={handleFiles} accept="application/pdf" multiple={false} hint="Upload one PDF to edit its pages" />
      </div>

      {status === "loading" && <p className="px-5 pb-5 text-sm text-neutral-500">Reading pages…</p>}
      {error && <p className="px-5 pb-5 text-sm text-danger-500">{error}</p>}

      {pages.length > 0 && (
        <div className="border-t border-neutral-100">
          <div
            onPointerMove={handleContainerPointerMove}
            onPointerUp={handleContainerPointerUp}
            className="grid max-h-[32rem] grid-cols-2 gap-3 overflow-y-auto p-5 sm:grid-cols-3 md:grid-cols-4"
          >
            {pages.map((page, index) => (
              <PageThumbnail
                key={page.key}
                index={index}
                total={pages.length}
                pageNumber={page.originalIndex + 1}
                thumbUrl={page.thumbUrl}
                rotation={page.rotation}
                onMoveLeft={() => moveTo(index, index - 1)}
                onMoveRight={() => moveTo(index, index + 1)}
                onRotate={() => rotate(index)}
                onRemove={() => remove(index)}
                onDragHandlePointerDown={(e) => handleDragHandlePointerDown(e, index)}
              />
            ))}
          </div>

          {pages.length === 0 && (
            <p className="px-5 pb-5 text-sm text-neutral-500">
              Every page has been deleted — upload the PDF again to start over.
            </p>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-5 py-4">
            <span className="shrink-0 text-xs text-neutral-500">
              {pages.length} page{pages.length === 1 ? "" : "s"}
            </span>
            <div className="flex min-w-0 flex-1 justify-end">
              <ProcessAction
                status={status === "loading" ? "idle" : status}
                idleLabel="Save PDF"
                workingLabel="Saving…"
                downloadLabel="Download PDF"
                onStart={handleSave}
                onDownload={handleDownload}
                startDisabled={pages.length === 0}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
