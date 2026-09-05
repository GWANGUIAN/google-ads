import type { CompressFormatInfo } from "./formats";

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaq(format: CompressFormatInfo): FaqItem[] {
  const items: FaqItem[] = [];

  items.push({
    question: `Is compressing a ${format.label} file free?`,
    answer:
      "Yes. Compression runs entirely in your browser, is free with no sign-up, and has no limit on how many files or how many times you use it.",
  });

  items.push({
    question: `Does compressing a ${format.label} file lose quality?`,
    answer: format.isLossy
      ? `Yes, ${format.label} uses lossy compression, so lowering the quality slider trades some fine detail for a smaller file. At the default quality (around 80), the difference is usually not visible to the eye — drag the slider lower for a smaller file, or higher if you notice artifacts.`
      : `No — PNG is lossless, so this tool re-encodes the file without discarding any pixel data. The quality slider has no effect on PNG files; any size reduction comes only from more efficient re-encoding, which is typically modest.`,
  });

  items.push({
    question: "Is my image uploaded to a server?",
    answer: `No. Compression happens entirely on your device using your browser's built-in Canvas image processing — your ${format.label} files are never uploaded anywhere.`,
  });

  if (format.isLossy) {
    items.push({
      question: "What quality setting should I use?",
      answer:
        "80 is a good default for most photos — a large size reduction with no visible quality loss. Drag the slider down toward 50-60 for maximum savings on images where fine detail matters less (like thumbnails), or up toward 90+ for images you plan to edit further or print.",
    });
  }

  items.push({
    question: "Can I compress multiple files at once?",
    answer:
      "Yes — drop as many files as you like. Each is compressed in parallel using your browser's own processing power, and once at least two are done you can download them all together as a single ZIP file.",
  });

  return items;
}
