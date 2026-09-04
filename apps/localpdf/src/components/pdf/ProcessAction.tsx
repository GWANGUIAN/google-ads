export type ProcessStatus = "idle" | "working" | "done" | "error";

/** Shared idle-button / progress-bar / download-button footer control used
 * by every widget that runs a processing step and then offers a file to
 * download — keeps that 3-state flow (and its markup) consistent instead of
 * each widget auto-downloading the instant processing finishes. */
export default function ProcessAction({
  status,
  progress,
  idleLabel,
  workingLabel,
  downloadLabel = "Download",
  onStart,
  onDownload,
  startDisabled,
}: {
  status: ProcessStatus;
  /** 0-100. Omit for an indeterminate bar (single-shot ops with no natural progress signal). */
  progress?: number;
  idleLabel: string;
  workingLabel: string;
  downloadLabel?: string;
  onStart: () => void;
  onDownload: () => void;
  startDisabled?: boolean;
}) {
  if (status === "working") {
    return (
      <div className="w-full">
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-neutral-500">
          <span>{workingLabel}</span>
          {progress !== undefined && <span>{Math.round(progress)}%</span>}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className={`h-full rounded-full bg-accent-600 ${
              progress === undefined ? "w-full animate-pulse" : "transition-all duration-200"
            }`}
            style={progress !== undefined ? { width: `${progress}%` } : undefined}
          />
        </div>
      </div>
    );
  }

  if (status === "done") {
    return (
      <button
        type="button"
        onClick={onDownload}
        className="flex items-center gap-1.5 rounded-control bg-success-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 4v11M12 15l-3.5-3.5M12 15l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {downloadLabel}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onStart}
      disabled={startDisabled}
      className="rounded-control bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-60"
    >
      {idleLabel}
    </button>
  );
}
