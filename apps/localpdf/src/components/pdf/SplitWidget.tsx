import { useRef, useState } from "react";
import Dropzone from "./Dropzone";
import SplitPageThumbnail from "./SplitPageThumbnail";
import ProcessAction, { type ProcessStatus } from "./ProcessAction";
import { PdfEngineClient } from "@/lib/pdf/pdfEngineClient";
import { downloadBlob } from "@/lib/pdf/download";
import { getPageCount, loadPdfForRender, renderThumbnailDataUrl } from "@/lib/pdf/render";

export default function SplitWidget() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [thumbUrls, setThumbUrls] = useState<(string | null)[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | ProcessStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Blob | null>(null);
  const clientRef = useRef<PdfEngineClient | null>(null);

  if (!clientRef.current) clientRef.current = new PdfEngineClient();

  const selectedCount = selected.filter(Boolean).length;

  function invalidateResult() {
    if (result) setResult(null);
    if (status === "done") setStatus("idle");
  }

  async function handleFiles(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    setError(null);
    setFile(picked);
    setPageCount(null);
    setSelected([]);
    setThumbUrls([]);
    setResult(null);
    setStatus("loading");
    try {
      const pdf = await loadPdfForRender(picked);
      const count = getPageCount(pdf);
      setPageCount(count);
      setSelected(new Array(count).fill(true));
      setThumbUrls(new Array(count).fill(null));
      setStatus("idle");

      // Render thumbnails one page at a time so a large PDF doesn't block
      // the main thread in one long burst (each render.ts call yields to
      // the event loop between pages).
      for (let i = 0; i < count; i++) {
        const url = await renderThumbnailDataUrl(pdf, i);
        setThumbUrls((prev) => {
          const next = [...prev];
          next[i] = url;
          return next;
        });
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not open this PDF.");
    }
  }

  function togglePage(index: number) {
    setSelected((prev) => prev.map((v, i) => (i === index ? !v : v)));
    setError(null);
    invalidateResult();
  }

  function selectAll() {
    setSelected((prev) => prev.map(() => true));
    invalidateResult();
  }

  function deselectAll() {
    setSelected((prev) => prev.map(() => false));
    invalidateResult();
  }

  async function handleSplit() {
    if (!file || !pageCount || !clientRef.current) return;
    const pageOrder = selected.reduce<number[]>((acc, isSelected, i) => {
      if (isSelected) acc.push(i);
      return acc;
    }, []);
    if (pageOrder.length === 0) return;
    setStatus("working");
    setError(null);
    try {
      const blob = await clientRef.current.run<Blob>("applyPageEdits", { file, pageOrder });
      setResult(blob);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not split this PDF.");
    }
  }

  function handleDownload() {
    if (!result || !file) return;
    downloadBlob(result, `${file.name.replace(/\.pdf$/i, "")}-split.pdf`);
  }

  return (
    <div className="rounded-card border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-4">
        <p className="text-sm font-semibold text-neutral-800">Split PDF</p>
      </div>

      <div className="p-5">
        <Dropzone onFiles={handleFiles} accept="application/pdf" multiple={false} hint="Upload one PDF to split" />
      </div>

      {file && (
        <div className="border-t border-neutral-100 p-5">
          <p className="text-sm font-medium text-neutral-800">{file.name}</p>
          {status === "loading" && <p className="mt-2 text-xs text-neutral-500">Reading pages…</p>}

          {pageCount !== null && (
            <>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {selectedCount} of {pageCount} page{pageCount === 1 ? "" : "s"} selected
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="rounded-control px-2.5 py-1 text-xs font-semibold text-accent-700 hover:bg-accent-50"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="rounded-control px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
                  >
                    Deselect all
                  </button>
                </div>
              </div>
              <p className="mt-1.5 text-xs text-neutral-500">
                Uncheck any page to leave it out — the download contains only the pages you've kept, in order.
              </p>

              <div className="mt-4 grid max-h-[32rem] grid-cols-2 gap-3 overflow-y-auto rounded-control border border-neutral-100 bg-neutral-50/50 p-4 sm:grid-cols-3 md:grid-cols-4">
                {selected.map((isSelected, i) => (
                  <SplitPageThumbnail
                    key={i}
                    pageNumber={i + 1}
                    thumbUrl={thumbUrls[i] ?? null}
                    selected={isSelected}
                    onToggle={() => togglePage(i)}
                  />
                ))}
              </div>
            </>
          )}

          {error && <p className="mt-3 text-xs text-danger-500">{error}</p>}

          <div className="mt-4 flex justify-end">
            <ProcessAction
              status={status === "loading" ? "idle" : status}
              idleLabel="Split PDF"
              workingLabel="Splitting…"
              downloadLabel="Download PDF"
              onStart={handleSplit}
              onDownload={handleDownload}
              startDisabled={status === "loading" || !pageCount || selectedCount === 0}
            />
          </div>
        </div>
      )}
    </div>
  );
}
