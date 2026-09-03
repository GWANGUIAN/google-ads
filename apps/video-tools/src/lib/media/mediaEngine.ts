import { Input, ALL_FORMATS, BlobSource, Output, BufferTarget, Mp4OutputFormat, WebMOutputFormat, Conversion, Quality } from "mediabunny";
import { UnsupportedMediaError, type CompressPayload, type TrimPayload, type EngineResult, type QualityPreset } from "./types";
import type { ContainerCode } from "@/data/formats";

/**
 * Wraps mediabunny's Input/Output/Conversion pipeline — it handles demuxing,
 * WebCodecs decode/encode, and muxing for both mp4 and webm behind one API,
 * which is why this app depends on it instead of hand-rolling a demuxer/muxer
 * per container (see docs/NEW_SITE_PLAYBOOK.md §11 "Video Tools" entry and the
 * mediabunny docs at https://mediabunny.dev). Pure functions — no DOM/worker-
 * specific code — so this file works unmodified on the main thread or inside
 * mediaEngine.worker.ts.
 */

const QUALITY_BY_PRESET: Record<QualityPreset, Quality> = {
  high: new Quality("high"),
  balanced: new Quality("medium"),
  smaller: new Quality("low"),
};

// "Smaller file" additionally caps resolution — a lower bitrate alone still
// leaves a lot of detail to compress at full resolution, and search intent
// for "compress video" usually wants a materially smaller file, not just a
// quality dial. This is a CAP, not a target: mediabunny's `height` option
// scales to exactly that height, upscaling a smaller source rather than
// leaving it alone — so compressVideo() below only applies it after checking
// the source is actually taller (confirmed by testing: an untouched cap
// upscaled a 240p test clip to 1080p, the opposite of "compress").
const MAX_HEIGHT_BY_PRESET: Partial<Record<QualityPreset, number>> = {
  balanced: 1080,
  smaller: 720,
};

function detectContainer(file: File): ContainerCode | null {
  if (file.type === "video/webm" || /\.webm$/i.test(file.name)) return "webm";
  if (file.type === "video/mp4" || /\.(mp4|m4v)$/i.test(file.name)) return "mp4";
  return null;
}

function outputFormatFor(container: ContainerCode) {
  return container === "webm" ? new WebMOutputFormat() : new Mp4OutputFormat();
}

function extensionFor(container: ContainerCode): string {
  return container === "webm" ? "webm" : "mp4";
}

function mimeFor(container: ContainerCode): string {
  return container === "webm" ? "video/webm" : "video/mp4";
}

function openInput(file: File): { input: Input; container: ContainerCode } {
  const container = detectContainer(file);
  if (!container) {
    throw new UnsupportedMediaError(
      `"${file.name}" isn't an MP4 or WebM file — this tool only supports those two containers for now.`,
    );
  }
  return { input: new Input({ formats: ALL_FORMATS, source: new BlobSource(file) }), container };
}

async function runConversion(
  input: Input,
  container: ContainerCode,
  options: { video?: Record<string, unknown>; audio?: Record<string, unknown>; trim?: { start: number; end: number } },
  onProgress?: (pct: number) => void,
): Promise<EngineResult> {
  const output = new Output({ format: outputFormatFor(container), target: new BufferTarget() });

  let conversion;
  try {
    conversion = await Conversion.init({ input, output, ...options });
  } catch {
    throw new UnsupportedMediaError();
  }

  if (onProgress) conversion.onProgress = onProgress;

  await conversion.execute();

  const buffer = output.target.buffer;
  if (!buffer) throw new UnsupportedMediaError();

  return { buffer, mimeType: mimeFor(container), extension: extensionFor(container) };
}

export async function compressVideo(
  { file, quality }: CompressPayload,
  onProgress?: (pct: number) => void,
): Promise<EngineResult> {
  const { input, container } = openInput(file);

  const maxHeight = MAX_HEIGHT_BY_PRESET[quality];
  let heightCap: number | undefined;
  if (maxHeight) {
    const track = await input.getPrimaryVideoTrack();
    const sourceHeight = track ? await track.getDisplayHeight() : undefined;
    if (sourceHeight && sourceHeight > maxHeight) heightCap = maxHeight;
  }

  return runConversion(
    input,
    container,
    {
      video: { quality: QUALITY_BY_PRESET[quality], ...(heightCap ? { height: heightCap } : {}) },
      audio: { quality: QUALITY_BY_PRESET[quality] },
    },
    onProgress,
  );
}

export async function trimVideo({ file, start, end }: TrimPayload, onProgress?: (pct: number) => void): Promise<EngineResult> {
  const { input, container } = openInput(file);
  return runConversion(input, container, { trim: { start, end } }, onProgress);
}
