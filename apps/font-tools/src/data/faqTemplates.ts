import { FORMATS } from "./formats";
import type { ConversionPage } from "./conversionPairs";

export interface FaqItem {
  question: string;
  answer: string;
}

const FREE_FAQ: FaqItem = {
  question: "Is this free?",
  answer: "Yes, completely free, with no sign-up and no limit on how many fonts or how many times you use it.",
};

const PRIVACY_FAQ: FaqItem = {
  question: "Is my font file uploaded to a server?",
  answer:
    "No. Every conversion runs entirely on your device using WebAssembly — your font file is never uploaded anywhere.",
};

export function buildToolFaq(extra: FaqItem[] = []): FaqItem[] {
  return [FREE_FAQ, PRIVACY_FAQ, ...extra];
}

export function buildFaq(page: ConversionPage): FaqItem[] {
  const source = FORMATS[page.source];
  const target = FORMATS[page.target];

  const items: FaqItem[] = [
    { question: `Is converting ${source.label} to ${target.label} free?`, answer: FREE_FAQ.answer },
    {
      question: `Will converting to ${target.label} change how the font looks?`,
      answer: `No — conversion repackages the same glyph outlines and metrics into the ${target.label} container format. It doesn't alter how any character renders.`,
    },
  ];

  if (page.source === "otf") {
    items.push({
      question: "Does converting from OTF lose anything?",
      answer:
        "OTF fonts use PostScript (CFF) outlines, which this tool converts to TrueType (glyf) outlines as part of reading the file. Visual rendering is preserved; extremely complex glyphs can very rarely be simplified slightly in the process.",
    });
  }

  items.push(PRIVACY_FAQ);
  items.push({
    question: "Can I convert multiple fonts at once?",
    answer: "Yes — drop as many files as you like, then download each result individually or grab them all at once as a ZIP.",
  });

  return items;
}
