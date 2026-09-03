import { useEffect, useState } from "react";
import type { QueueItem } from "./ConverterWidget";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileQueueRow({
  item,
  onDownload,
  onRemove,
}: {
  item: QueueItem;
  onDownload: (item: QueueItem) => void;
  onRemove: (id: string) => void;
}) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(item.file);
    setThumbUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [item.file]);

  const savings =
    item.status === "done" && item.result
      ? Math.round((1 - item.result.newBytes / item.result.originalBytes) * 100)
      : null;

  return (
    <div className="flex items-center gap-4 border-b border-neutral-100 px-4 py-3 last:border-b-0">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-control bg-neutral-100">
        {thumbUrl && <img src={thumbUrl} alt="" className="h-full w-full object-cover" />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-800">{item.file.name}</p>
        <p className="text-xs text-neutral-500">
          {formatBytes(item.file.size)}
          {item.status === "done" && item.result && (
            <>
              {" "}
              → {formatBytes(item.result.newBytes)}{" "}
              {savings !== null && savings > 0 && (
                <span className="font-medium text-success-500">(-{savings}%)</span>
              )}
            </>
          )}
          {item.status === "error" && <span className="text-danger-500"> — {item.error}</span>}
        </p>
      </div>

      <div className="shrink-0">
        {item.status === "queued" && <span className="text-xs text-neutral-400">Queued</span>}
        {item.status === "converting" && (
          <span className="flex items-center gap-1.5 text-xs text-accent-600">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent-300 border-t-accent-600" />
            Converting
          </span>
        )}
        {item.status === "done" && (
          <button
            type="button"
            onClick={() => onDownload(item)}
            className="rounded-control bg-accent-50 px-3 py-1.5 text-xs font-semibold text-accent-700 hover:bg-accent-100"
          >
            Download
          </button>
        )}
        {item.status === "error" && (
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="rounded-control bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-200"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
