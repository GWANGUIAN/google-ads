import { useRef, type PointerEvent as ReactPointerEvent } from "react";

interface Props {
  duration: number;
  start: number;
  end: number;
  onChange: (start: number, end: number) => void;
  thumbnails: string[];
  thumbnailsLoading?: boolean;
  playhead?: number | null;
  onSeek?: (time: number) => void;
}

/** Draggable dual-handle trim range over a thumbnail strip — the client-side
 * equivalent of a desktop editor's timeline. Dragging updates start/end in
 * seconds; clicking the strip (outside a handle) seeks the preview player.
 *
 * Drag tracking uses native Pointer Capture (setPointerCapture +
 * addEventListener directly in the pointerdown handler) rather than a
 * useState + useEffect pair that attaches window listeners on the next
 * render. The latter has a real gap: the listener isn't attached until
 * after React re-renders, so a drag gesture that completes before that
 * render (a fast flick, or a render delayed by other work) loses its
 * pointermove/pointerup entirely and the handle gets stuck "mid-drag" with
 * no way to release it. Pointer Capture attaches synchronously in the same
 * event, so there's no such window. */
export default function TrimTimeline({ duration, start, end, onChange, thumbnails, thumbnailsLoading, playhead, onSeek }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  // "Latest value" refs so the move handler (added once per drag, not once
  // per render) always reads current start/end/duration/onChange.
  const startRef = useRef(start);
  const endRef = useRef(end);
  const durationRef = useRef(duration);
  const onChangeRef = useRef(onChange);
  startRef.current = start;
  endRef.current = end;
  durationRef.current = duration;
  onChangeRef.current = onChange;

  function timeFromClientX(clientX: number): number {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return ratio * durationRef.current;
  }

  function startDrag(e: ReactPointerEvent<HTMLDivElement>, which: "start" | "end") {
    e.stopPropagation();
    e.preventDefault();
    const handle = e.currentTarget;
    const pointerId = e.pointerId;
    try {
      // Pointer capture keeps events flowing to `handle` (and the right
      // cursor/touch behavior) even once the pointer leaves it — a nice-to-
      // have, not a requirement: some embedded/automated browser contexts
      // don't register a pointerdown as an "active" pointer, so this can
      // throw. The window listeners below make the drag work regardless.
      handle.setPointerCapture(pointerId);
    } catch {
      // ignored — see above
    }

    function handleMove(ev: PointerEvent) {
      const t = timeFromClientX(ev.clientX);
      if (which === "start") onChangeRef.current(Math.min(t, endRef.current - 0.1), endRef.current);
      else onChangeRef.current(startRef.current, Math.max(t, startRef.current + 0.1));
    }
    function handleUp() {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      try {
        handle.releasePointerCapture(pointerId);
      } catch {
        // ignored — see above
      }
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  const startPct = duration ? (start / duration) * 100 : 0;
  const endPct = duration ? (end / duration) * 100 : 100;
  const playheadPct = playhead != null && duration ? (playhead / duration) * 100 : null;

  return (
    <div className="select-none">
      <div
        ref={trackRef}
        className="relative h-14 w-full overflow-hidden rounded-control border border-neutral-300 bg-neutral-200"
        onClick={(e) => onSeek?.(timeFromClientX(e.clientX))}
      >
        {thumbnailsLoading ? (
          <div className="flex h-full items-center justify-center text-xs text-neutral-500">Generating preview…</div>
        ) : (
          <div className="flex h-full w-full">
            {thumbnails.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" className="h-full flex-1 object-cover" draggable={false} />
            ))}
          </div>
        )}

        <div className="pointer-events-none absolute inset-y-0 left-0 bg-black/50" style={{ width: `${startPct}%` }} />
        <div className="pointer-events-none absolute inset-y-0 right-0 bg-black/50" style={{ width: `${100 - endPct}%` }} />
        <div
          className="pointer-events-none absolute inset-y-0 border-y-2 border-accent-400"
          style={{ left: `${startPct}%`, width: `${Math.max(0, endPct - startPct)}%` }}
        />

        {playheadPct !== null && (
          <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${playheadPct}%` }} />
        )}

        <div
          role="slider"
          aria-label="Trim start"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={start}
          tabIndex={0}
          onPointerDown={(e) => startDrag(e, "start")}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") onChange(Math.max(0, start - 0.5), end);
            if (e.key === "ArrowRight") onChange(Math.min(end - 0.1, start + 0.5), end);
          }}
          className="absolute inset-y-0 z-10 w-3 -translate-x-1/2 cursor-ew-resize touch-none rounded bg-accent-600"
          style={{ left: `${startPct}%` }}
        />
        <div
          role="slider"
          aria-label="Trim end"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={end}
          tabIndex={0}
          onPointerDown={(e) => startDrag(e, "end")}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") onChange(start, Math.max(start + 0.1, end - 0.5));
            if (e.key === "ArrowRight") onChange(start, Math.min(duration, end + 0.5));
          }}
          className="absolute inset-y-0 z-10 w-3 -translate-x-1/2 cursor-ew-resize touch-none rounded bg-accent-600"
          style={{ left: `${endPct}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-neutral-500">
        <span>{start.toFixed(1)}s</span>
        <span>{(end - start).toFixed(1)}s selected</span>
        <span>{end.toFixed(1)}s</span>
      </div>
    </div>
  );
}
