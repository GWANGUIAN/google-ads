function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PdfFileListItem({
  name,
  sizeBytes,
  thumbnailUrl,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  name: string;
  sizeBytes: number;
  thumbnailUrl?: string | null;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 last:border-b-0">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-control bg-neutral-100">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400">
            <path d="M6 3h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1Z" strokeLinejoin="round" />
            <path d="M15 3v5h5" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-neutral-800">{name}</p>
        <p className="text-xs text-neutral-500">{formatBytes(sizeBytes)}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          disabled={index === 0}
          onClick={onMoveUp}
          aria-label="Move up"
          className="rounded-control p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={index === total - 1}
          onClick={onMoveDown}
          aria-label="Move down"
          className="rounded-control p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="rounded-control p-1.5 text-neutral-500 hover:bg-danger-500/10 hover:text-danger-500"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
