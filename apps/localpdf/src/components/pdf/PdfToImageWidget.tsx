import { useState } from "react";
import Dropzone from "./Dropzone";
import ProcessAction, { type ProcessStatus } from "./ProcessAction";
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
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);

  async function handleFiles(files: File[]) {
    const file = files[0];
    if (!file) return;
    setError(null);
    setResult(null);
    setFileName(file.name);
    setStatus("working");
    setProgress(0);
    try {
      const pdf = await loadPdfForRender(file);
      const count = getPageCount(pdf);
      const entries: { name: string; blob: Blob }[] = [];
      for (let i = 0; i < count; i++) {
        const blob = await renderPageToBlob(pdf, i, 2, format);
        entries.push({ name: `page-${i + 1}.${extension}`, blob });
        setProgress(((i + 1) / count) * 100);
      }
      if (entries.length === 1) {
        setResult({ blob: entries[0].blob, name: entries[0].name });
      } else {
        const zipBlob = await zipFiles(entries);
        setResult({ blob: zipBlob, name: `${file.name.replace(/\.pdf$/i, "")}-${extension}.zip` });
      }
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not convert this PDF.");
    }
  }

  function handleDownload() {
    if (!result) return;
    downloadBlob(result.blob, result.name);
  }

  return (
    <div className="rounded-card border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-4">
        <p className="text-sm font-semibold text-neutral-800">PDF to {label}</p>
      </div>
      <div className="p-5">
        <Dropzone onFiles={handleFiles} accept="application/pdf" multiple={false} hint="Upload one PDF — every page becomes an image" />
        {error && <p className="mt-3 text-sm text-danger-500">{error}</p>}
      </div>

      {fileName && (status === "working" || status === "done") && (
        <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-5 py-4">
          <span className="shrink-0 truncate text-xs text-neutral-500">{fileName}</span>
          <div className="flex min-w-0 flex-1 justify-end">
            <ProcessAction
              status={status}
              idleLabel="Convert"
              workingLabel="Rendering pages…"
              downloadLabel={result && result.name.endsWith(".zip") ? "Download ZIP" : "Download image"}
              progress={progress}
              onStart={() => {}}
              onDownload={handleDownload}
            />
          </div>
        </div>
      )}
    </div>
  );
}
