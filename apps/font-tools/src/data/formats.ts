export type FontFormatCode = "ttf" | "otf" | "woff" | "woff2";

export interface FontFormatInfo {
  code: FontFormatCode;
  label: string;
  extensions: string[];
  mimeType: string;
  /** Every format here can be read/uploaded. */
  canBeSource: true;
  /** fonteditor-core can only *write* ttf/woff/woff2 — OTF (CFF outlines) is
   * read-only, converted to TTF internally on read. See docs/NEW_SITE_PLAYBOOK.md
   * research notes and src/lib/font/fontEngine.ts. */
  canBeTarget: boolean;
  description: string;
}

export const FORMATS: Record<FontFormatCode, FontFormatInfo> = {
  ttf: {
    code: "ttf",
    label: "TTF",
    extensions: [".ttf"],
    mimeType: "font/ttf",
    canBeSource: true,
    canBeTarget: true,
    description:
      "TrueType Font — the most widely compatible desktop font format, installable on virtually every operating system and design app.",
  },
  otf: {
    code: "otf",
    label: "OTF",
    extensions: [".otf"],
    mimeType: "font/otf",
    canBeSource: true,
    canBeTarget: false,
    description:
      "OpenType Font with PostScript (CFF) outlines — common for professionally designed and licensed typefaces.",
  },
  woff: {
    code: "woff",
    label: "WOFF",
    extensions: [".woff"],
    mimeType: "font/woff",
    canBeSource: true,
    canBeTarget: true,
    description:
      "Web Open Font Format — a compressed wrapper around TTF/OTF outline data, built for fast @font-face loading on the web.",
  },
  woff2: {
    code: "woff2",
    label: "WOFF2",
    extensions: [".woff2"],
    mimeType: "font/woff2",
    canBeSource: true,
    canBeTarget: true,
    description:
      "The successor to WOFF, with roughly 30% better compression — the modern default for @font-face on the web.",
  },
};

export const FORMAT_LIST = Object.values(FORMATS);
export const SOURCE_FORMATS = FORMAT_LIST.filter((f) => f.canBeSource);
export const TARGET_FORMATS = FORMAT_LIST.filter((f) => f.canBeTarget);

export function detectSourceFormat(fileName: string): FontFormatCode | null {
  const name = fileName.toLowerCase();
  if (name.endsWith(".woff2")) return "woff2";
  if (name.endsWith(".woff")) return "woff";
  if (name.endsWith(".ttf")) return "ttf";
  if (name.endsWith(".otf")) return "otf";
  return null;
}
