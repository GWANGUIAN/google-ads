import { useState } from "react";
import { renderQrToCanvas, canvasToPngBlob } from "@/lib/qr/generate";
import { zipFiles, downloadBlob } from "@/lib/qr/zip";

interface BatchItem {
  id: string;
  text: string;
  dataUrl?: string;
  blob?: Blob;
  error?: string;
}

const MAX_LINES = 200;

function toFilename(text: string, index: number): string {
  const slug = text
    .trim()
    .slice(0, 30)
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `qr-${index + 1}${slug ? `-${slug}` : ""}.png`;
}

export default function BatchQrWidget() {
  const [input, setInput] = useState("");
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const lineCount = input.split("\n").filter((l) => l.trim()).length;

  async function handleGenerate() {
    const lines = input
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, MAX_LINES);
    if (lines.length === 0) return;

    setIsGenerating(true);
    const next: BatchItem[] = [];
    for (let i = 0; i < lines.length; i++) {
      const text = lines[i];
      const canvas = document.createElement("canvas");
      try {
        await renderQrToCanvas(canvas, text, { size: 320, errorCorrectionLevel: "M" });
        const blob = await canvasToPngBlob(canvas);
        next.push({ id: `${i}`, text, blob, dataUrl: canvas.toDataURL("image/png") });
      } catch {
        next.push({ id: `${i}`, text, error: "Couldn't generate this line" });
      }
    }
    setItems(next);
    setIsGenerating(false);
  }

  async function handleDownloadAll() {
    const done = items.filter((item): item is BatchItem & { blob: Blob } => !!item.blob);
    if (done.length === 0) return;
    setIsZipping(true);
    try {
      const entries = done.map((item, i) => ({ name: toFilename(item.text, i), blob: item.blob }));
      const zipBlob = await zipFiles(entries);
      downloadBlob(zipBlob, "qr-codes.zip");
    } finally {
      setIsZipping(false);
    }
  }

  function handleDownloadOne(item: BatchItem, index: number) {
    if (item.blob) downloadBlob(item.blob, toFilename(item.text, index));
  }

  return (
    <div className="rounded-card border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-4">
        <p className="text-sm font-semibold text-neutral-800">Batch QR code generator</p>
      </div>

      <div className="space-y-4 p-5">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-neutral-700">
            One entry per line — URLs, text, or anything else
          </span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"https://example.com/1\nhttps://example.com/2\nhttps://example.com/3"}
            rows={6}
            className="w-full rounded-control border border-neutral-300 px-3 py-2 font-mono text-sm text-neutral-900"
          />
          <span className="mt-1 block text-xs text-neutral-400">
            {lineCount} {lineCount === 1 ? "line" : "lines"} {lineCount > MAX_LINES && `(only the first ${MAX_LINES} will be used)`}
          </span>
        </label>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={lineCount === 0 || isGenerating}
          className="rounded-control bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? "Generating…" : `Generate ${Math.min(lineCount, MAX_LINES) || ""} QR codes`}
        </button>

        {items.length > 0 && (
          <div className="border-t border-neutral-100 pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-neutral-800">{items.filter((i) => i.blob).length} generated</p>
              <button
                type="button"
                onClick={handleDownloadAll}
                disabled={isZipping}
                className="rounded-control bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
              >
                {isZipping ? "Zipping…" : "Download all as ZIP"}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((item, i) => (
                <div key={item.id} className="rounded-control border border-neutral-200 p-2 text-center">
                  {item.dataUrl ? (
                    <img src={item.dataUrl} alt={item.text} className="mx-auto h-24 w-24 object-contain" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center text-xs text-red-500">{item.error}</div>
                  )}
                  <p className="mt-1 truncate text-xs text-neutral-500" title={item.text}>
                    {item.text}
                  </p>
                  {item.blob && (
                    <button
                      type="button"
                      onClick={() => handleDownloadOne(item, i)}
                      className="mt-1 text-xs font-semibold text-accent-600 hover:text-accent-700"
                    >
                      Download
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
