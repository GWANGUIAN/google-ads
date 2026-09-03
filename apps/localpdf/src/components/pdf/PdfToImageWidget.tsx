import { useState } from "react";
import Dropzone from "./Dropzone";
import { downloadBlob } from "@/lib/pdf/download";
import { zipFiles } from "@/lib/pdf/zip";
import { getPageCount, loadPdfForRender, renderPageToBlob } from "@/lib/pdf/render";

export default function PdfToImageWidget({
  format,
  extension,
  label,
}: {
  format: "image/png" | "image/jpeg";
  extension: string;
  label: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: File[]) {
    const file = files[0];
    if (!file) return;
    setError(null);
    setStatus("loading");
    try {
      const pdf = await loadPdfForRender(file);
      const count = getPageCount(pdf);
      const entries: { name: string; blob: Blob }[] = [];
      for (let i = 0; i < count; i++) {
        const blob = await renderPageToBlob(pdf, i, 2, format);
        entries.push({ name: `page-${i + 1}.${extension}`, blob });
      }
      if (entries.length === 1) {
        downloadBlob(entries[0].blob, entries[0].name);
      } else {
        const zipBlob = await zipFiles(entries);
        downloadBlob(zipBlob, `${file.name.replace(/\.pdf$/i, "")}-${extension}.zip`);
      }
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not convert this PDF.");
    }
  }

  return (
    <div className="rounded-card border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-4">
        <p className="text-sm font-semibold text-neutral-800">PDF to {label}</p>
      </div>
      <div className="p-5">
        <Dropzone onFiles={handleFiles} accept="application/pdf" multiple={false} hint="Upload one PDF — every page becomes an image" />
        {status === "loading" && <p className="mt-3 text-sm text-neutral-500">Rendering pages…</p>}
        {error && <p className="mt-3 text-sm text-danger-500">{error}</p>}
      </div>
    </div>
  );
}
