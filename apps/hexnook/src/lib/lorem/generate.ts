export type LoremUnit = "paragraphs" | "sentences" | "words" | "items";

export type LoremResult = { ok: true; value: string } | { ok: false; error: string };

const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
  "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim",
  "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip",
  "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat",
  "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim",
  "id", "est", "laborum", "at", "vero", "eos", "accusamus", "iusto", "odio", "dignissimos",
  "ducimus", "blanditiis", "praesentium", "voluptatum", "deleniti", "atque", "corrupti", "quos", "quas", "molestias",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickWord(): string {
  return WORDS[randomInt(0, WORDS.length - 1)];
}

function makeWords(count: number): string[] {
  return Array.from({ length: count }, () => pickWord());
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function makeSentence(startClassic: boolean): string {
  const wordCount = randomInt(6, 16);
  const words = makeWords(wordCount);
  if (startClassic) {
    words[0] = "lorem";
    if (words.length > 1) words[1] = "ipsum";
    if (words.length > 2) words[2] = "dolor";
    if (words.length > 3) words[3] = "sit";
    if (words.length > 4) words[4] = "amet";
  }
  const sentence = words.join(" ");
  return `${capitalize(sentence)}.`;
}

function makeParagraph(sentenceCount: number, startClassic: boolean): string {
  return Array.from({ length: sentenceCount }, (_, i) => makeSentence(startClassic && i === 0)).join(" ");
}

export interface LoremOptions {
  unit: LoremUnit;
  count: number;
  startClassic: boolean;
  htmlWrap: boolean;
}

export function generateLorem({ unit, count, startClassic, htmlWrap }: LoremOptions): LoremResult {
  if (!Number.isFinite(count) || count < 1) {
    return { ok: false, error: "Enter a count of at least 1." };
  }
  if (count > 500) {
    return { ok: false, error: "Enter a count of 500 or fewer." };
  }

  if (unit === "words") {
    const words = makeWords(count);
    if (startClassic) {
      const classic = ["lorem", "ipsum", "dolor", "sit", "amet"];
      for (let i = 0; i < Math.min(classic.length, words.length); i++) words[i] = classic[i];
    }
    words[0] = capitalize(words[0]);
    return { ok: true, value: htmlWrap ? `<p>${words.join(" ")}.</p>` : `${words.join(" ")}.` };
  }

  if (unit === "sentences") {
    const sentences = Array.from({ length: count }, (_, i) => makeSentence(startClassic && i === 0));
    return { ok: true, value: htmlWrap ? `<p>${sentences.join(" ")}</p>` : sentences.join(" ") };
  }

  if (unit === "items") {
    const items = Array.from({ length: count }, (_, i) => makeSentence(startClassic && i === 0));
    return {
      ok: true,
      value: htmlWrap
        ? `<ul>\n${items.map((item) => `  <li>${item}</li>`).join("\n")}\n</ul>`
        : items.map((item) => `- ${item}`).join("\n"),
    };
  }

  // paragraphs
  const paragraphs = Array.from({ length: count }, (_, i) => makeParagraph(randomInt(3, 6), startClassic && i === 0));
  return {
    ok: true,
    value: htmlWrap ? paragraphs.map((p) => `<p>${p}</p>`).join("\n\n") : paragraphs.join("\n\n"),
  };
}
