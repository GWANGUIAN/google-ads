import { FORMATS, type FormatPair } from "./pairs";

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaq(pair: FormatPair): FaqItem[] {
  const from = FORMATS[pair.from];
  const to = FORMATS[pair.to];
  const items: FaqItem[] = [];

  items.push({
    question: `Is converting ${from.label} to ${to.label} free?`,
    answer: `Yes. This converter runs entirely in your browser, is free with no sign-up, and has no limit on how many files or how many times you use it.`,
  });

  items.push({
    question: `Does converting ${from.label} to ${to.label} reduce image quality?`,
    answer:
      to.compression === "lossless"
        ? `No — ${to.label} uses lossless compression, so no additional quality is lost during this conversion (beyond any quality already lost if the source ${from.label} file was itself lossy).`
        : `${to.label} uses lossy compression, so there is some quality trade-off, but at the default quality setting the difference is generally not visible to the eye. You can re-convert at a higher quality if you notice artifacts.`,
  });

  if (from.supportsTransparency || to.supportsTransparency) {
    if (to.supportsTransparency && from.supportsTransparency) {
      items.push({
        question: `Will transparency be preserved when converting ${from.label} to ${to.label}?`,
        answer: `Yes, both ${from.label} and ${to.label} support transparent backgrounds, so any alpha-channel transparency in your source file is preserved.`,
      });
    } else if (!to.supportsTransparency && from.supportsTransparency) {
      items.push({
        question: `What happens to transparency when converting ${from.label} to ${to.label}?`,
        answer: `${to.label} does not support transparency, so any transparent areas in your ${from.label} file will be filled with a solid white background during conversion.`,
      });
    }
  }

  if (from.supportsAnimation) {
    items.push({
      question: `Will the animation be preserved when converting ${from.label} to ${to.label}?`,
      answer: `No. ${to.label} does not support animation, so only the first frame of your ${from.label} file will be converted to a static image.`,
    });
  }

  items.push({
    question: `Is my image uploaded to a server?`,
    answer: `No. The conversion from ${from.label} to ${to.label} happens entirely on your device using your browser's built-in image processing — your files are never uploaded anywhere.`,
  });

  if (from.browserNotes) {
    items.push({
      question: `Why did my ${from.label} file fail to convert?`,
      answer: from.browserNotes,
    });
  }

  return items;
}
