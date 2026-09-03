export type FormatCode = "png" | "jpg" | "webp" | "bmp" | "gif" | "heic";

/** The subset of formats this tool can encode as a conversion target. */
export type OutputFormatCode = "png" | "jpg" | "webp" | "bmp";

export interface FormatInfo {
  code: FormatCode;
  label: string;
  extensions: string[];
  mimeType: string;
  compression: "lossy" | "lossless" | "none";
  supportsTransparency: boolean;
  supportsAnimation: boolean;
  /** Can this format be read/decoded client-side (as a conversion source)? */
  canInput: boolean;
  /** Can this format be encoded client-side (as a conversion target)? */
  canOutput: boolean;
  typicalUse: string[];
  pros: string[];
  cons: string[];
  browserNotes?: string;
}

export const FORMATS: Record<FormatCode, FormatInfo> = {
  png: {
    code: "png",
    label: "PNG",
    extensions: [".png"],
    mimeType: "image/png",
    compression: "lossless",
    supportsTransparency: true,
    supportsAnimation: false,
    canInput: true,
    canOutput: true,
    typicalUse: ["screenshots", "logos and icons", "graphics with sharp edges or text", "images needing transparency"],
    pros: [
      "Lossless compression — no quality loss, ever",
      "Full alpha-channel transparency support",
      "Universally supported by every browser, OS, and app",
    ],
    cons: [
      "Larger file sizes than JPG or WEBP for photographs",
      "No animation support",
    ],
  },
  jpg: {
    code: "jpg",
    label: "JPG",
    extensions: [".jpg", ".jpeg"],
    mimeType: "image/jpeg",
    compression: "lossy",
    supportsTransparency: false,
    supportsAnimation: false,
    canInput: true,
    canOutput: true,
    typicalUse: ["photographs", "web images where file size matters", "email attachments", "social media uploads"],
    pros: [
      "Small file sizes, even at high visual quality",
      "Supported absolutely everywhere, including old software and printers",
      "Fast to decode and render",
    ],
    cons: [
      "Lossy — repeated edits/re-saves degrade quality",
      "No transparency support",
      "Visible compression artifacts on sharp edges and text",
    ],
  },
  webp: {
    code: "webp",
    label: "WEBP",
    extensions: [".webp"],
    mimeType: "image/webp",
    compression: "lossy",
    supportsTransparency: true,
    supportsAnimation: true,
    canInput: true,
    canOutput: true,
    typicalUse: ["modern websites optimizing for page speed", "images needing both transparency and small size"],
    pros: [
      "25-35% smaller than JPG/PNG at comparable visual quality",
      "Supports both transparency and animation in one format",
      "Supported by all modern browsers",
    ],
    cons: [
      "Not fully supported in some older software (pre-2020) or legacy image editors",
      "This tool converts only the first frame of animated WEBP",
    ],
    browserNotes: "Encoding is supported in all current browsers (Chrome, Firefox, Safari 14+, Edge).",
  },
  bmp: {
    code: "bmp",
    label: "BMP",
    extensions: [".bmp"],
    mimeType: "image/bmp",
    compression: "none",
    supportsTransparency: false,
    supportsAnimation: false,
    canInput: true,
    canOutput: true,
    typicalUse: ["Windows-native applications", "raw uncompressed image storage", "some legacy print workflows"],
    pros: [
      "Completely uncompressed — no generation loss whatsoever",
      "Simple format, trivial for any software to read",
    ],
    cons: [
      "Very large file sizes compared to every other format here",
      "No transparency support",
      "Rarely used for web or sharing",
    ],
  },
  gif: {
    code: "gif",
    label: "GIF",
    extensions: [".gif"],
    mimeType: "image/gif",
    compression: "lossless",
    supportsTransparency: true,
    supportsAnimation: true,
    canInput: true,
    canOutput: false,
    typicalUse: ["short looping animations", "reaction memes", "simple graphics with few colors"],
    pros: [
      "Universally supported animation format",
      "Simple, well-understood, works everywhere",
    ],
    cons: [
      "Limited to 256 colors, causing banding in photos",
      "Much larger file size than modern animation formats",
    ],
    browserNotes:
      "This tool extracts and converts only the first frame of a GIF. No browser can natively re-encode GIF, so it isn't offered as an output format.",
  },
  heic: {
    code: "heic",
    label: "HEIC",
    extensions: [".heic", ".heif"],
    mimeType: "image/heic",
    compression: "lossy",
    supportsTransparency: true,
    supportsAnimation: false,
    canInput: true,
    canOutput: false,
    typicalUse: ["photos taken on iPhone/iPad with default camera settings"],
    pros: [
      "Roughly half the file size of an equivalent-quality JPG",
      "Retains more image data for editing headroom",
    ],
    cons: [
      "Poor compatibility outside the Apple ecosystem",
      "Many websites, apps, and Windows tools can't open it directly",
    ],
    browserNotes:
      "HEIC decoding in-browser currently works reliably only in Safari. If your conversion fails, open the photo on an iPhone/iPad and use \"Share > Save as JPEG\" first, or try this tool in Safari.",
  },
};

export const INPUT_FORMATS = Object.values(FORMATS).filter((f) => f.canInput);
export const OUTPUT_FORMATS = Object.values(FORMATS).filter((f) => f.canOutput);
