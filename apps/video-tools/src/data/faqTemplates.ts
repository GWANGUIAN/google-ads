import { FORMATS } from "./formats";
import type { OperationPage } from "./operationPages";

export interface FaqItem {
  question: string;
  answer: string;
}

const FREE_FAQ: FaqItem = {
  question: "Is this free?",
  answer: "Yes, completely free, with no sign-up and no limit on how many videos or how many times you use it.",
};

const PRIVACY_FAQ: FaqItem = {
  question: "Is my video uploaded to a server?",
  answer:
    "No. Every operation on this site runs entirely on your device using your browser's built-in WebCodecs API — your video is never uploaded anywhere.",
};

export function buildToolFaq(extra: FaqItem[] = []): FaqItem[] {
  return [FREE_FAQ, PRIVACY_FAQ, ...extra];
}

export function buildFaq(page: OperationPage): FaqItem[] {
  const format = FORMATS[page.format];
  const items: FaqItem[] = [
    { question: `Is ${page.operation === "compress" ? "compressing" : "trimming"} a ${format.label} file free?`, answer: FREE_FAQ.answer },
  ];

  if (page.operation === "compress") {
    items.push({
      question: "Will compressing lose quality?",
      answer:
        "Some quality loss is inherent to re-encoding at a lower bitrate — that's how the file gets smaller. The \"High quality\" preset keeps loss minimal; \"Smaller file\" trades more quality for a smaller result and also caps the resolution.",
    });
  } else {
    items.push({
      question: "How precise is the trim?",
      answer:
        "Trimming targets your exact start and end times in seconds. Very short or frame-perfect cuts can land within a fraction of a second of the exact point depending on the source video's internal structure.",
    });
  }

  items.push(PRIVACY_FAQ);
  items.push({
    question: `Does this work with browsers other than Chrome?`,
    answer:
      "It needs the WebCodecs API, which ships in current Chrome, Edge, and Firefox. If your browser doesn't support it, this tool will tell you clearly instead of failing silently.",
  });

  return items;
}
