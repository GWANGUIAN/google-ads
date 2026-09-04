import type { QrTypeInfo } from "./qrTypes";

export interface FaqItem {
  question: string;
  answer: string;
}

const FREE_FAQ: FaqItem = {
  question: "Is this free?",
  answer: "Yes, completely free, with no sign-up and no limit on how many QR codes you generate or scan.",
};

const PRIVACY_FAQ: FaqItem = {
  question: "Is the content I enter sent to a server?",
  answer:
    "No. Every QR code is generated entirely on your device using JavaScript — the text, link, or contact details you enter are never uploaded anywhere.",
};

export function buildToolFaq(extra: FaqItem[] = []): FaqItem[] {
  return [FREE_FAQ, PRIVACY_FAQ, ...extra];
}

export function buildFaq(type: QrTypeInfo): FaqItem[] {
  const items: FaqItem[] = [
    { question: `Is generating a ${type.label} QR code free?`, answer: FREE_FAQ.answer },
    {
      question: "Does the QR code expire?",
      answer:
        "No. This tool generates a \"static\" QR code — the content is encoded directly into the pattern itself, so it works forever and doesn't depend on any server staying online.",
    },
  ];

  if (type.code === "wifi") {
    items.push({
      question: "Will this share my WiFi password with anyone who scans it?",
      answer:
        "Yes — anyone who scans a WiFi QR code can join that network, the same as if you told them the password directly. Only share it with people you trust, and treat the printed code the same way you'd treat the password itself.",
    });
  }

  if (type.code === "vcard" || type.code === "event") {
    items.push({
      question: "What happens when someone scans this code?",
      answer:
        "Most phone camera apps recognize the encoded format automatically and offer to save it — to contacts for a vCard, or to a calendar for an event — without needing a separate app.",
    });
  }

  items.push(PRIVACY_FAQ);
  items.push({
    question: "Can I add a logo or change the color?",
    answer:
      "Yes — the generator lets you upload a logo and pick foreground/background colors. Adding a logo automatically raises the error-correction level so the code stays scannable.",
  });
  items.push({
    question: "What format can I download it in?",
    answer: "PNG (best for printing and sharing) or SVG (scalable, best for design software and large-format printing).",
  });

  return items;
}
