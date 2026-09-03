import { useEffect, useRef, useState } from "react";
import Dropzone from "./Dropzone";
import { getPageCount, loadPdfForRender, renderPageToCanvas, type PdfDocumentProxy } from "@/lib/pdf/render";

export default function PdfViewerWidget() {
  const [pdf, setPdf] = useState<PdfDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  async function handleFiles(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    setError(null);
    setStatus("loading");
    setPdf(null);
    try {
      const doc = await loadPdfForRender(picked);
      setPdf(doc);
      setPageNum(1);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not open this PDF.");
    }
  }

  useEffect(() => {
    if (!pdf || !containerRef.current) return;
    let cancelled = false;
    renderPageToCanvas(pdf, pageNum - 1, scale).then((canvas) => {
      if (cancelled || !containerRef.current) return;
      canvas.className = "mx-auto shadow-sm";
      containerRef.current.replaceChildren(canvas);
    });
    return () => {
      cancelled = true;
    };
  }, [pdf, pageNum, scale]);

  const pageCount = pdf ? getPageCount(pdf) : 0;

  return (
    <div className="rounded-card border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-4">
        <p className="text-sm font-semibold text-neutral-800">PDF viewer</p>
      </div>

      {!pdf && (
        <div className="p-5">
          <Dropzone onFiles={handleFiles} accept="application/pdf" multiple={false} hint="Upload a PDF to view its pages" />
          {status === "loading" && <p className="mt-3 text-sm text-neutral-500">Opening PDF…</p>}
          {error && <p className="mt-3 text-sm text-danger-500">{error}</p>}
        </div>
      )}

      {pdf && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pageNum <= 1}
                onClick={() => setPageNum((p) => p - 1)}
                className="rounded-control bg-neutral-100 px-2.5 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-200 disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-sm text-neutral-600">
                Page {pageNum} of {pageCount}
              </span>
              <button
                type="button"
                disabled={pageNum >= pageCount}
                onClick={() => setPageNum((p) => p + 1)}
                className="rounded-control bg-neutral-100 px-2.5 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-200 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
                aria-label="Zoom out"
                className="rounded-control bg-neutral-100 px-2.5 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-200"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => setScale((s) => Math.min(3, s + 0.2))}
                aria-label="Zoom in"
                className="rounded-control bg-neutral-100 px-2.5 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-200"
              >
                +
              </button>
            </div>
          </div>
          <div className="max-h-[36rem] overflow-auto bg-neutral-100 p-5">
            <div ref={containerRef} />
          </div>
        </div>
      )}
    </div>
  );
}
