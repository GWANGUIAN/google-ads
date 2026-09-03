import type { OrganizerMode } from "./pageOrganizerTools";

export interface ToolCopy {
  title: string;
  subtitle: string;
  intro: string;
  why: string;
}

export const MERGE_COPY: ToolCopy = {
  title: "Merge PDF files",
  subtitle: "Combine multiple PDFs into one file, in the order you choose — free and completely private.",
  intro:
    "Merging PDFs is one of the most common document tasks — combining a cover letter with a resume, stitching together scanned pages, or assembling a single report from several sources. Drop two or more PDF files below, arrange them in the order you want, and download one combined file.",
  why:
    "Sending or archiving one combined PDF is almost always cleaner than sending several separate files. Because merging happens entirely in your browser, your documents are never uploaded anywhere in the process.",
};

export const SPLIT_COPY: ToolCopy = {
  title: "Split a PDF file",
  subtitle: "Break one PDF into several smaller files by page range — free and completely private.",
  intro:
    "Splitting a PDF is useful when you only need to share a few pages out of a larger document, or when you want to break a scanned batch into separate files. Upload a PDF, specify the page ranges you want, and download each piece as a separate file (bundled as a ZIP if you create more than one).",
  why:
    "Splitting locally means the full document — including any pages you're not sharing — never leaves your device.",
};

export const VIEWER_COPY: ToolCopy = {
  title: "View a PDF online",
  subtitle: "Open and page through a PDF right in your browser — no software to install, nothing uploaded.",
  intro:
    "Sometimes you just want to quickly check what's inside a PDF without opening a separate desktop app. This viewer renders every page directly in your browser using PDF.js, the same rendering engine behind Firefox's built-in PDF viewer.",
  why:
    "Because the file is rendered locally, you can preview sensitive documents without them ever touching a server.",
};

export const EXTRACT_COPY: ToolCopy = {
  title: "Extract text and page images from a PDF",
  subtitle: "Pull out the text content of a PDF, or download each page as an image — free and private.",
  intro:
    "Need the words out of a PDF for editing, or a picture of a specific page for a slide deck? This tool does both: extract all selectable text as plain text, or download every page rendered as a PNG/JPG image.",
  why:
    "Text extraction reads the PDF's own text layer directly in your browser (no OCR round-trip to a server needed for text-based PDFs), and page images are rendered locally too — nothing is uploaded either way.",
};

export const ORGANIZER_COPY: Record<OrganizerMode, ToolCopy> = {
  delete: {
    title: "Delete pages from a PDF",
    subtitle: "Remove unwanted pages from a PDF file — free and completely private.",
    intro:
      "Upload a PDF and every page appears as a thumbnail below. Click the delete icon on any page you don't want, then save — the remaining pages are assembled into a new PDF.",
    why:
      "Whether it's a blank scanned page, a duplicate, or an irrelevant section, removing pages locally means the original document never has to leave your device just to be edited.",
  },
  reorder: {
    title: "Reorder pages in a PDF",
    subtitle: "Rearrange the pages of a PDF into a new order — free and completely private.",
    intro:
      "Upload a PDF and drag pages into the order you want (or use the move-left/move-right buttons), then save. Handy for fixing scans that came out of order, or reorganizing a combined report.",
    why:
      "Reordering entirely in your browser means you can safely rearrange even sensitive documents without uploading them anywhere.",
  },
  rotate: {
    title: "Rotate pages in a PDF",
    subtitle: "Fix sideways or upside-down pages in a PDF — free and completely private.",
    intro:
      "Upload a PDF and rotate any page 90° at a time directly from its thumbnail — common after scanning a document landscape-side-up. Save when every page looks right.",
    why:
      "Rotation is applied locally and saved into a new PDF, with no upload of the original document required.",
  },
};
