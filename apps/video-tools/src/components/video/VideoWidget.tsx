import { useEffect, useRef, useState } from "react";
import Dropzone from "./Dropzone";
import TrimTimeline from "./TrimTimeline";
import { MediaEngineClient } from "@/lib/media/mediaEngineClient";
import { downloadBuffer } from "@/lib/media/download";
import { videoSizeWarning } from "@/lib/media/fileGuards";
import { checkMediaSupport, type SupportCheck } from "@/lib/media/capability";
import { generateThumbnails } from "@/lib/media/thumbnails";
import type { EngineResult, QualityPreset } from "@/lib/media/types";
import type { OperationCode } from "@/data/operations";
import type { ContainerCode } from "@/data/formats";

const THUMBNAIL_COUNT = 12;

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this video — it may be corrupted or an unsupported format."));
    };
    video.src = url;
  });
}

function outputFilename(original: string, suffix: string, extension: string): string {
  const base = original.replace(/\.[^.]+$/, "");
  return `${base}-${suffix}.${extension}`;
}

interface Props {
  initialOperation: OperationCode;
  lockOperation?: boolean;
  acceptContainer?: ContainerCode;
}

export default function VideoWidget({ initialOperation, lockOperation = false, acceptContainer }: Props) {
  const [operation, setOperation] = useState<OperationCode>(initialOperation);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [quality, setQuality] = useState<QualityPreset>("balanced");
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [playhead, setPlayhead] = useState<number | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [thumbnailsLoading, setThumbnailsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "working" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [result, setResult] = useState<EngineResult | null>(null);
  const clientRef = useRef<MediaEngineClient | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewingSelectionRef = useRef(false);
  // Assume supported until the client-only check runs in an effect — checking
  // `window` during the initial render would differ between server and
  // client, causing a React hydration mismatch (SSR always sees no window).
  const [support, setSupport] = useState<SupportCheck>({ supported: true });

  useEffect(() => {
    setSupport(checkMediaSupport());
    clientRef.current = new MediaEngineClient();
    return () => clientRef.current?.destroy();
  }, []);

  // Thumbnail strip is only needed for the trim timeline — generate it
  // lazily so switching to trim (or uploading while already in trim mode)
  // triggers it, without paying the cost for compress-only sessions.
  useEffect(() => {
    if (!file || duration === null || operation !== "trim") return;
    let cancelled = false;
    setThumbnailsLoading(true);
    setThumbnails([]);
    generateThumbnails(file, THUMBNAIL_COUNT, duration)
      .then((frames) => {
        if (!cancelled) setThumbnails(frames);
      })
      .catch(() => {
        if (!cancelled) setThumbnails([]);
      })
      .finally(() => {
        if (!cancelled) setThumbnailsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [file, duration, operation]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const accept =
    acceptContainer === "webm" ? "video/webm,.webm" : acceptContainer === "mp4" ? "video/mp4,.mp4,.m4v" : "video/mp4,video/webm,.mp4,.m4v,.webm";

  async function handleFiles(files: File[]) {
    const picked = files[0];
    if (!picked) return;
    setFile(picked);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(picked);
    });
    setResult(null);
    setError(null);
    setPlayhead(null);
    setWarning(videoSizeWarning(picked));
    setStatus("loading");
    try {
      const d = await getVideoDuration(picked);
      setDuration(d);
      setStart(0);
      setEnd(d);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not read this video.");
    }
  }

  async function handleRun() {
    if (!file || !clientRef.current) return;
    setStatus("working");
    setProgress(0);
    setError(null);
    try {
      const payload = operation === "compress" ? { file, quality } : { file, start, end };
      const engineResult = await clientRef.current.run(operation, payload, setProgress);
      setResult(engineResult);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Video processing failed.");
    }
  }

  function handleDownload() {
    if (!result || !file) return;
    downloadBuffer(result.buffer, result.mimeType, outputFilename(file.name, operation, result.extension));
  }

  function handleSeek(time: number) {
    if (videoRef.current) videoRef.current.currentTime = time;
    setPlayhead(time);
  }

  function handlePreviewSelection() {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = start;
    previewingSelectionRef.current = true;
    void video.play();
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video) return;
    setPlayhead(video.currentTime);
    if (previewingSelectionRef.current && video.currentTime >= end) {
      video.pause();
      previewingSelectionRef.current = false;
    }
  }

  if (!support.supported) {
    return <div className="rounded-card border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">{support.reason}</div>;
  }

  return (
    <div className="rounded-card border border-neutral-200 bg-white shadow-sm">
      <div className="border-b border-neutral-100 px-5 py-4">
        <p className="text-sm font-semibold text-neutral-800">{operation === "compress" ? "Compress video" : "Trim video"}</p>
      </div>

      <div className="p-5">
        {!lockOperation && (
          <div className="mb-4 flex gap-1">
            <button
              type="button"
              onClick={() => setOperation("compress")}
              className={`rounded-control px-3 py-1.5 text-sm font-semibold ${
                operation === "compress" ? "bg-accent-50 text-accent-700" : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              Compress
            </button>
            <button
              type="button"
              onClick={() => setOperation("trim")}
              className={`rounded-control px-3 py-1.5 text-sm font-semibold ${
                operation === "trim" ? "bg-accent-50 text-accent-700" : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              Trim
            </button>
          </div>
        )}

        <Dropzone onFiles={handleFiles} accept={accept} multiple={false} hint="Upload an MP4 or WebM video" />
        {status === "loading" && <p className="mt-3 text-sm text-neutral-500">Reading video…</p>}
        {warning && <p className="mt-3 text-sm text-amber-700">{warning}</p>}
        {error && <p className="mt-3 text-sm text-danger-500">{error}</p>}
      </div>

      {file && duration !== null && status !== "loading" && (
        <div className="border-t border-neutral-100 p-5">
          {operation === "compress" ? (
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              Quality
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as QualityPreset)}
                className="rounded-control border border-neutral-300 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-900 focus:border-accent-500 focus:outline-none"
              >
                <option value="high">High quality (largest file)</option>
                <option value="balanced">Balanced</option>
                <option value="smaller">Smaller file</option>
              </select>
            </label>
          ) : (
            <div className="space-y-3">
              {previewUrl && (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  ref={videoRef}
                  src={previewUrl}
                  controls
                  className="w-full rounded-control bg-black"
                  onTimeUpdate={handleTimeUpdate}
                  onSeeked={handleTimeUpdate}
                />
              )}

              <TrimTimeline
                duration={duration}
                start={start}
                end={end}
                onChange={(s, e) => {
                  setStart(s);
                  setEnd(e);
                }}
                thumbnails={thumbnails}
                thumbnailsLoading={thumbnailsLoading}
                playhead={playhead}
                onSeek={handleSeek}
              />

              <div className="flex flex-wrap items-end gap-4">
                <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
                  Start (seconds)
                  <input
                    type="number"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={Number(start.toFixed(1))}
                    onChange={(e) => setStart(Math.max(0, Math.min(Number(e.target.value), end)))}
                    className="w-24 rounded-control border border-neutral-300 px-3 py-1.5 text-sm focus:border-accent-500 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
                  End (seconds)
                  <input
                    type="number"
                    min={0}
                    max={duration}
                    step={0.1}
                    value={Number(end.toFixed(1))}
                    onChange={(e) => setEnd(Math.min(duration, Math.max(Number(e.target.value), start)))}
                    className="w-24 rounded-control border border-neutral-300 px-3 py-1.5 text-sm focus:border-accent-500 focus:outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={handlePreviewSelection}
                  className="rounded-control border border-neutral-300 px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  ▶ Preview selection
                </button>
                <p className="text-xs text-neutral-500">Video is {duration.toFixed(1)}s long.</p>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleRun}
              disabled={status === "working"}
              className="rounded-control bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-60"
            >
              {status === "working"
                ? `Processing… ${Math.round(progress * 100)}%`
                : operation === "compress"
                  ? "Compress video"
                  : "Trim video"}
            </button>
            {status === "done" && result && (
              <button
                type="button"
                onClick={handleDownload}
                className="rounded-control border border-accent-600 px-4 py-2 text-sm font-semibold text-accent-700 hover:bg-accent-50"
              >
                Download result
              </button>
            )}
          </div>

          {status === "working" && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full bg-accent-500 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
