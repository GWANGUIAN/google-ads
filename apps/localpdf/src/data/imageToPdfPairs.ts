import { IMAGE_FORMAT_LIST, type ImageFormatCode } from "./imageFormats";

export interface ImageToPdfPair {
  from: ImageFormatCode;
  slug: string;
}

export const IMAGE_TO_PDF_PAIRS: ImageToPdfPair[] = IMAGE_FORMAT_LIST.map((f) => ({
  from: f.code,
  slug: `${f.code}-to-pdf`,
}));

export function getImageToPdfPairBySlug(slug: string): ImageToPdfPair | undefined {
  return IMAGE_TO_PDF_PAIRS.find((p) => p.slug === slug);
}
