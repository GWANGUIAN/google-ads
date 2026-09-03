export type ContainerCode = "mp4" | "webm";

export interface ContainerInfo {
  code: ContainerCode;
  label: string;
  extensions: string[];
  mimeType: string;
  videoCodec: string;
  audioCodec: string;
  compatibilityNote: string;
  licensingNote: string;
}

/** v1 supports mp4 and webm only — cross-container conversion (mov→mp4, etc.)
 * is deferred to v2. See docs/NEW_SITE_PLAYBOOK.md §10/§11 and this app's
 * lib/media/mediaEngine.ts. */
export const FORMATS: Record<ContainerCode, ContainerInfo> = {
  mp4: {
    code: "mp4",
    label: "MP4",
    extensions: [".mp4", ".m4v"],
    mimeType: "video/mp4",
    videoCodec: "H.264",
    audioCodec: "AAC",
    compatibilityNote: "MP4 plays natively on essentially every device, browser, and social platform without any extra conversion.",
    licensingNote: "H.264 is a licensed codec, but decoding and playback are royalty-free for viewers — only encoder vendors pay licensing fees, and your browser already has that covered.",
  },
  webm: {
    code: "webm",
    label: "WebM",
    extensions: [".webm"],
    mimeType: "video/webm",
    videoCodec: "VP9",
    audioCodec: "Opus",
    compatibilityNote: "WebM plays natively in Chrome, Firefox, and Edge; some older Safari versions and non-browser apps may not support it.",
    licensingNote: "WebM's VP9 and Opus codecs are open and royalty-free, with no licensing fees for anyone.",
  },
};

export const FORMAT_LIST = Object.values(FORMATS);
