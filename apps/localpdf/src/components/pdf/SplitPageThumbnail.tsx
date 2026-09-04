export default function SplitPageThumbnail({
  pageNumber,
  thumbUrl,
  selected,
  onToggle,
}: {
  pageNumber: number;
  thumbUrl: string | null;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-card border p-2.5 shadow-sm transition-colors ${
        selected ? "border-neutral-200 bg-white" : "border-neutral-200 bg-neutral-50 opacity-50"
      }`}
    >
      <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-control bg-neutral-100">
        {thumbUrl ? (
          <img src={thumbUrl} alt={`Page ${pageNumber}`} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-accent-500" />
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={selected}
          aria-label={selected ? `Deselect page ${pageNumber}` : `Select page ${pageNumber}`}
          className={`absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md border text-xs shadow transition-colors ${
            selected
              ? "border-accent-600 bg-accent-600 text-white"
              : "border-neutral-300 bg-white/90 text-transparent hover:border-accent-400"
          }`}
        >
          ✓
        </button>
      </div>

      <p className="text-xs font-medium text-neutral-500">Page {pageNumber}</p>
    </div>
  );
}
