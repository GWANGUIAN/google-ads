export type PdfToImageFormat = "jpg" | "png";

export interface PdfToImagePair {
  to: PdfToImageFormat;
  slug: string;
  label: string;
  mimeType: string;
}

export const PDF_TO_IMAGE_PAIRS: PdfToImagePair[] = [
  { to: "jpg", slug: "pdf-to-jpg", label: "JPG", mimeType: "image/jpeg" },
  { to: "png", slug: "pdf-to-png", label: "PNG", mimeType: "image/png" },
];

export function getPdfToImagePairBySlug(slug: string): PdfToImagePair | undefined {
  return PDF_TO_IMAGE_PAIRS.find((p) => p.slug === slug);
}
