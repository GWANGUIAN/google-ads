import { FORMATS } from "./formats";
import type { OperationPage } from "./operationPages";

/** Templated per-page intro/why copy, assembled from operation + format facts
 * (not hand-written per page) so every generated page reads as genuinely
 * different rather than mail-merged filler. See docs/NEW_SITE_PLAYBOOK.md §4. */

export function buildIntro(page: OperationPage): string {
  const format = FORMATS[page.format];
  if (page.operation === "compress") {
    return `Large ${format.label} files are slow to upload, awkward to email, and can blow through chat-app size limits. This tool re-encodes your ${format.label} video (${format.videoCodec} video, ${format.audioCodec} audio) at a smaller size, entirely on your own device — drop a file below, pick a quality level, and download the smaller result.`;
  }
  return `Sometimes you only need part of a video — a highlight clip, a section to share, or just the fat trimmed off the start and end. Drop a ${format.label} file below, set a start and end time, and download just that range, without re-uploading anywhere.`;
}

export function buildWhy(page: OperationPage): string {
  const format = FORMATS[page.format];
  if (page.operation === "compress") {
    return `${format.compatibilityNote} Because compression runs locally using your browser's built-in WebCodecs hardware encoder, there's no upload wait and no server ever sees your video — the whole process stays on your device from start to finish.`;
  }
  return `${format.licensingNote} Trimming locally means you can cut sensitive or personal footage down to just the part you want to share without ever sending the full file to a server.`;
}
