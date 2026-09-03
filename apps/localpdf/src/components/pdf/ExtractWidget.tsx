import { useRef, useState } from "react";
import Dropzone from "./Dropzone";
import { downloadBlob } from "@/lib/pdf/download";
import { zipFiles } from "@/lib/pdf/zip";
import { extractAllText, getPageCount, loadPdfForRender, renderPageToBlob, type PdfDocumentProxy } from "@/lib/pdf/render";

export default function ExtractWidget() {
  const [file, setFile] = useState<File | null>(null);
  const [pdf, setPdf] = useState<PdfDocumentProxy | null>(null);
  const [tab, setTab] = useState<"text" | "images">("text");
  const [text, setText] = useState<string | null>(null);
  const [imageFormat, setImageFormat] = useState<"image/png" | "image/jpeg">("image/png");
  const [status, setStatus] = useState<"idle" | "loading" | "working" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);

  async function handleFiles(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    setFile(picked);
    setText(null);
    setError(null);
    setStatus("loading");
    try {
      const doc = await loadPdfForRender(picked);
      setPdf(doc);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not open this PDF.");
    }
  }

  async function handleExtractText() {
    if (!pdf) return;
    setStatus("working");
    setError(null);
    try {
      const extracted = await extractAllText(pdf);
      setText(extracted);
      setStatus("idle");
    } catch {
      setStatus("error");
      setError("Could not extract text from this PDF.");
    }
  }

  function handleDownloadText() {
    if (!text || !file) return;
    downloadBlob(new Blob([text], { type: "text/plain" }), `${file.name.replace(/\.pdf$/i, "")}.txt`);
  }

  async function handleDownloadImages() {
    if (!pdf || !file || busyRef.current) return;
    busyRef.current = true;
    setStatus("working");
    setError(null);
    try {
      const count = getPageCount(pdf);
      const ext = imageFormat === "image/png" ? "png" : "jpg";
      const entries = [];
      for (let i = 0; i < count; i++) {
        const blob = await renderPageToBlob(pdf, i, 2, imageFormat);
        entries.push({ name: `page-${i + 1}.${ext}`, blob });
      }
      if (entries.length === 1) {
        downloadBlob(entries[0].blob, entries[0].name);
      } else {
        const zipBlob = await zipFiles(entries);
        downloadBlob(zipBlob, `${file.name.replace(/\.pdf$/i, "")}-pages.zip`);
      }
      setStatus("idle");
    } catch {
      setStatus("error");
      setError("Could not render page images from this PDF.");
    } finally {
      busyRef.current = false;
    }
  }

  return (
    <div className="rounded-card border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-4">
        <p className="text-sm font-semibold text-neutral-800">Extract from PDF</p>
      </div>

      <div className="p-5">
        <Dropzone onFiles={handleFiles} accept="application/pdf" multiple={false} hint="Upload a PDF to extract text or page images" />
        {status === "loading" && <p className="mt-3 text-sm text-neutral-500">Opening PDF…</p>}
        {error && <p className="mt-3 text-sm text-danger-500">{error}</p>}
      </div>

      {pdf && (
        <div className="border-t border-neutral-100">
          <div className="flex gap-1 px-5 pt-4">
            <button
              type="button"
              onClick={() => setTab("text")}
              className={`rounded-control px-3 py-1.5 text-sm font-semibold ${tab === "text" ? "bg-accent-50 text-accent-700" : "text-neutral-500 hover:bg-neutral-100"}`}
            >
              Text
            </button>
            <button
              type="button"
              onClick={() => setTab("images")}
              className={`rounded-control px-3 py-1.5 text-sm font-semibold ${tab === "images" ? "bg-accent-50 text-accent-700" : "text-neutral-500 hover:bg-neutral-100"}`}
            >
              Page images
            </button>
          </div>

          {tab === "text" && (
            <div className="p-5">
              {text === null ? (
                <button
                  type="button"
                  onClick={handleExtractText}
                  disabled={status === "working"}
                  className="rounded-control bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-60"
                >
                  {status === "working" ? "Extracting…" : "Extract text"}
                </button>
              ) : (
                <div>
                  <textarea
                    readOnly
                    value={text || "(No selectable text found on this PDF — it may be a scanned image.)"}
                    className="h-56 w-full resize-y rounded-control border border-neutral-300 p-3 font-mono text-xs text-neutral-700"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleDownloadText}
                      className="rounded-control bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700"
                    >
                      Download .txt
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "images" && (
            <div className="p-5">
              <p className="text-sm text-neutral-600">
                Each page is rendered as its own image — this is a page snapshot, not extraction of individual
                embedded pictures.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                  Format
                  <select
                    value={imageFormat}
                    onChange={(e) => setImageFormat(e.target.value as "image/png" | "image/jpeg")}
                    className="rounded-control border border-neutral-300 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-900 focus:border-accent-500 focus:outline-none"
                  >
                    <option value="image/png">PNG</option>
                    <option value="image/jpeg">JPG</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={handleDownloadImages}
                  disabled={status === "working"}
                  className="rounded-control bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-60"
                >
                  {status === "working" ? "Rendering…" : "Download page images"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
