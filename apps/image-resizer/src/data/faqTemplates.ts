import type { ResizePreset } from "./presets";

export interface FaqItem {
  question: string;
  answer: string;
}

const FREE_FAQ: FaqItem = {
  question: "Is this free?",
  answer: "Yes, completely free, with no sign-up and no limit on how many images you resize.",
};

const PRIVACY_FAQ: FaqItem = {
  question: "Is my image uploaded to a server?",
  answer:
    "No. Every resize happens entirely on your device using your browser's own Canvas APIs — your photo is never uploaded anywhere.",
};

const UPSCALE_FAQ: FaqItem = {
  question: "What if my image is smaller than the target size?",
  answer:
    "With \"don't upscale\" on (the default), an image smaller than the target is kept at its original size instead of being stretched larger and losing quality. A note appears on that file's row when this happens. Turn the option off if you specifically want to upscale anyway.",
};

const FORMAT_FAQ: FaqItem = {
  question: "What image formats are supported?",
  answer: "Upload JPG, PNG, or WEBP — the resized image downloads in the same format as the original.",
};

export function buildToolFaq(extra: FaqItem[] = []): FaqItem[] {
  return [FREE_FAQ, PRIVACY_FAQ, UPSCALE_FAQ, FORMAT_FAQ, ...extra];
}

export function buildFaq(preset: ResizePreset): FaqItem[] {
  const items: FaqItem[] = [
    { question: `Is resizing to ${preset.label} size free?`, answer: FREE_FAQ.answer },
    {
      question: `Will resizing to ${preset.label} size crop my image or just scale it?`,
      answer: `This tool never crops. By default (aspect ratio lock on), it scales your image to ${preset.width}×${preset.height} while preserving its original proportions — the matching dimension is computed from your photo's own shape instead of forcing an exact box. If you turn aspect ratio lock off and your image's proportions don't match ${preset.width}×${preset.height}, the image is stretched to exactly fill that size rather than cropped or padded.`,
    },
    UPSCALE_FAQ,
  ];

  if (preset.caveat) {
    items.push({
      question: `Is ${preset.width}×${preset.height} the official ${preset.label} requirement?`,
      answer: preset.caveat,
    });
  }

  items.push(PRIVACY_FAQ);
  items.push(FORMAT_FAQ);

  return items;
}
