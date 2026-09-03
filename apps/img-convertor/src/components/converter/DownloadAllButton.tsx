import { useState } from "react";
import { zipFiles, downloadBlob } from "@/lib/convert/zip";
import type { QueueItem } from "./ConverterWidget";

export default function DownloadAllButton({ items }: { items: QueueItem[] }) {
  const [isZipping, setIsZipping] = useState(false);
  const doneItems = items.filter((i) => i.status === "done" && i.result);

  if (doneItems.length < 2) return null;

  async function handleClick() {
    setIsZipping(true);
    try {
      const entries = doneItems.map((item) => ({
        name: item.outputFilename,
        blob: item.result!.blob,
      }));
      const zipBlob = await zipFiles(entries);
      downloadBlob(zipBlob, "converted-images.zip");
    } finally {
      setIsZipping(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isZipping}
      className="rounded-control bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
    >
      {isZipping ? "Zipping…" : `Download all as ZIP (${doneItems.length})`}
    </button>
  );
}
