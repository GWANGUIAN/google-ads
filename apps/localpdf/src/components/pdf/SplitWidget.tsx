import { useRef, useState } from "react";
import Dropzone from "./Dropzone";
import { PdfEngineClient } from "@/lib/pdf/pdfEngineClient";
import { downloadBlob } from "@/lib/pdf/download";
import { zipFiles } from "@/lib/pdf/zip";
import { loadPdfForRender, getPageCount } from "@/lib/pdf/render";

function parseRanges(input: string, pageCount: number): [number, number][] | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
  const ranges: [number, number][] = [];
  for (const part of parts) {
    const match = /^(\d+)(?:-(\d+))?$/.exec(part);
    if (!match) return null;
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    if (start < 1 || end > pageCount || start > end) return null;
    ranges.push([start, end]);
  }
  return ranges.length ? ranges : null;
}

export default function SplitWidget() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [rangeInput, setRangeInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "working" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<PdfEngineClient | null>(null);

  if (!clientRef.current) clientRef.current = new PdfEngineClient();

  async function handleFiles(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    setError(null);
    setFile(picked);
    setPageCount(null);
    setStatus("loading");
    try {
      const pdf = await loadPdfForRender(picked);
      const count = getPageCount(pdf);
      setPageCount(count);
      setRangeInput(`1-${count}`);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not open this PDF.");
    }
  }

  async function handleSplit() {
    if (!file || !pageCount || !clientRef.current) return;
    const ranges = parseRanges(rangeInput, pageCount);
    if (!ranges) {
      setError(`Enter page ranges like "1-3, 4-6" using pages 1–${pageCount}.`);
      return;
    }
    setStatus("working");
    setError(null);
    try {
      const blobs = await clientRef.current.run<Blob[]>("splitPdf", { file, ranges });
      if (blobs.length === 1) {
        downloadBlob(blobs[0], `${file.name.replace(/\.pdf$/i, "")}-split.pdf`);
      } else {
        const zipBlob = await zipFiles(
          blobs.map((blob, i) => ({ name: `part-${i + 1}.pdf`, blob })),
        );
        downloadBlob(zipBlob, "split-pdfs.zip");
      }
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not split this PDF.");
    }
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
          {status === "loading" && <p className="mt-2 text-xs text-neutral-500">Reading page count…</p>}
          {pageCount !== null && (
            <div className="mt-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Page ranges ({pageCount} page{pageCount === 1 ? "" : "s"} total)
              </label>
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder="e.g. 1-3, 4-6"
                className="mt-1.5 w-full rounded-control border border-neutral-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none"
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                Each comma-separated range becomes its own PDF. Multiple ranges download as a ZIP.
              </p>
            </div>
          )}

          {error && <p className="mt-3 text-xs text-danger-500">{error}</p>}

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSplit}
              disabled={status === "working" || status === "loading" || !pageCount}
              className="rounded-control bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-60"
            >
              {status === "working" ? "Splitting…" : "Split PDF"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
