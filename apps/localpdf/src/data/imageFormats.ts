export type ImageFormatCode = "jpg" | "png" | "webp" | "gif" | "bmp" | "heic";

export interface ImageFormatInfo {
  code: ImageFormatCode;
  label: string;
  extensions: string[];
  mimeType: string;
  /** jpg/png bytes can be embedded into a PDF directly via pdf-lib's
   * embedJpg/embedPng. Every other format is first decoded and re-encoded to
   * PNG via OffscreenCanvas inside the worker — see lib/pdf/pdfEngine.ts. */
  canEmbedNatively: boolean;
  typicalUse: string;
  browserNotes?: string;
}

export const IMAGE_FORMATS: Record<ImageFormatCode, ImageFormatInfo> = {
  jpg: {
    code: "jpg",
    label: "JPG",
    extensions: [".jpg", ".jpeg"],
    mimeType: "image/jpeg",
    canEmbedNatively: true,
    typicalUse: "photographs and scanned documents",
  },
  png: {
    code: "png",
    label: "PNG",
    extensions: [".png"],
    mimeType: "image/png",
    canEmbedNatively: true,
    typicalUse: "screenshots, graphics, and images needing transparency",
  },
  webp: {
    code: "webp",
    label: "WEBP",
    extensions: [".webp"],
    mimeType: "image/webp",
    canEmbedNatively: false,
    typicalUse: "modern web images",
    browserNotes: "WEBP files are first decoded and converted to PNG in your browser before being placed into the PDF — this happens automatically and needs no action from you.",
  },
  gif: {
    code: "gif",
    label: "GIF",
    extensions: [".gif"],
    mimeType: "image/gif",
    canEmbedNatively: false,
    typicalUse: "simple graphics and (as a still image) animated memes",
    browserNotes: "Only the first frame of an animated GIF is placed into the PDF.",
  },
  bmp: {
    code: "bmp",
    label: "BMP",
    extensions: [".bmp"],
    mimeType: "image/bmp",
    canEmbedNatively: false,
    typicalUse: "uncompressed Windows-native images",
  },
  heic: {
    code: "heic",
    label: "HEIC",
    extensions: [".heic", ".heif"],
    mimeType: "image/heic",
    canEmbedNatively: false,
    typicalUse: "photos taken on iPhone/iPad with default camera settings",
    browserNotes:
      "HEIC decoding in-browser currently works reliably only in Safari. If your file fails to convert, open the photo on an iPhone/iPad and use \"Share > Save as JPEG\" first, or try this tool in Safari.",
  },
};

export const IMAGE_FORMAT_LIST = Object.values(IMAGE_FORMATS);
