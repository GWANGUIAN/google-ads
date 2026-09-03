import { IMAGE_FORMATS } from "./imageFormats";
import type { ImageToPdfPair } from "./imageToPdfPairs";
import type { PdfToImagePair } from "./pdfToImagePairs";
import type { OrganizerMode } from "./pageOrganizerTools";

export interface FaqItem {
  question: string;
  answer: string;
}

const PRIVACY_FAQ: FaqItem = {
  question: "Is my PDF uploaded to a server?",
  answer:
    "No. Every operation on this site runs entirely on your device using JavaScript libraries loaded into your browser — your files are never uploaded anywhere.",
};

const FREE_FAQ: FaqItem = {
  question: "Is this free?",
  answer: "Yes, completely free, with no sign-up and no limit on how many files or how many times you use it.",
};

export function buildImageToPdfFaq(pair: ImageToPdfPair): FaqItem[] {
  const from = IMAGE_FORMATS[pair.from];
  const items: FaqItem[] = [
    { question: `Is converting ${from.label} to PDF free?`, answer: FREE_FAQ.answer },
    {
      question: `Can I combine multiple ${from.label} files into one PDF?`,
      answer: `Yes — drop in as many ${from.label} files as you like, arrange them in the order you want, and they'll be combined into a single multi-page PDF.`,
    },
    PRIVACY_FAQ,
  ];
  if (from.browserNotes) {
    items.push({ question: `Why did my ${from.label} file fail to convert?`, answer: from.browserNotes });
  }
  return items;
}

export function buildPdfToImageFaq(pair: PdfToImagePair): FaqItem[] {
  return [
    { question: `Is converting a PDF to ${pair.label} free?`, answer: FREE_FAQ.answer },
    {
      question: "What happens with multi-page PDFs?",
      answer: `Every page is rendered as its own ${pair.label} image. If your PDF has more than one page, the images are bundled into a ZIP file for download.`,
    },
    PRIVACY_FAQ,
  ];
}

export function buildToolFaq(extra: FaqItem[] = []): FaqItem[] {
  return [FREE_FAQ, PRIVACY_FAQ, ...extra];
}

export function buildOrganizerFaq(mode: OrganizerMode): FaqItem[] {
  const extra: FaqItem[] =
    mode === "delete"
      ? [{ question: "Can I undo a page deletion?", answer: "Deleted pages are only removed once you save and download the new PDF — until then, click the page again or reload to start over." }]
      : mode === "reorder"
        ? [{ question: "Does reordering work on touch devices?", answer: "Yes — every page also has move-left/move-right buttons, so reordering works with or without drag-and-drop on phones and tablets." }]
        : [{ question: "Does rotation change the file size much?", answer: "No — rotation only changes how a page is displayed, so it adds negligible file size." }];
  return buildToolFaq(extra);
}
