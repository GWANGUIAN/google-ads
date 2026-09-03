import type { PointerEvent as ReactPointerEvent } from "react";

export default function PageThumbnail({
  index,
  total,
  pageNumber,
  thumbUrl,
  rotation,
  onMoveLeft,
  onMoveRight,
  onRotate,
  onRemove,
  onDragHandlePointerDown,
}: {
  index: number;
  total: number;
  pageNumber: number;
  thumbUrl: string | null;
  rotation: 0 | 90 | 180 | 270;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotate: () => void;
  onRemove: () => void;
  onDragHandlePointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div
      data-page-index={index}
      className="flex flex-col items-center gap-2 rounded-card border border-neutral-200 bg-white p-2.5 shadow-sm"
    >
      <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-control bg-neutral-100">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={`Page ${pageNumber}`}
            style={{ transform: `rotate(${rotation}deg)` }}
            className="max-h-full max-w-full object-contain transition-transform"
          />
        ) : (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-accent-500" />
        )}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Delete page ${pageNumber}`}
          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs text-danger-500 shadow hover:bg-white"
        >
          ✕
        </button>
      </div>

      <p className="text-xs font-medium text-neutral-500">Page {pageNumber}</p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={index === 0}
          onClick={onMoveLeft}
          aria-label="Move left"
          className="rounded-control p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
        >
          ←
        </button>
        <button
          type="button"
          onClick={onRotate}
          aria-label="Rotate 90 degrees"
          className="rounded-control p-1.5 text-neutral-500 hover:bg-neutral-100"
        >
          ⟳
        </button>
        <button
          type="button"
          disabled={index === total - 1}
          onClick={onMoveRight}
          aria-label="Move right"
          className="rounded-control p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
        >
          →
        </button>
        <button
          type="button"
          onPointerDown={onDragHandlePointerDown}
          aria-label="Drag to reorder"
          style={{ touchAction: "none" }}
          className="cursor-grab rounded-control p-1.5 text-neutral-400 hover:bg-neutral-100 active:cursor-grabbing"
        >
          ⠿
        </button>
      </div>
    </div>
  );
}
