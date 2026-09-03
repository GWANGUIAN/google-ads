import { FORMATS, INPUT_FORMATS, OUTPUT_FORMATS, type FormatCode, type OutputFormatCode } from "./formats";

export interface FormatPair {
  from: FormatCode;
  to: OutputFormatCode;
  slug: string;
}

// Pairs we deliberately don't publish a page for even though the underlying
// format flags would allow it (kept low-value/rarely-searched combos out of
// the launch set; revisit once there's search-volume data).
const EXCLUDED: Array<[FormatCode, FormatCode]> = [["heic", "bmp"]];

function isExcluded(from: FormatCode, to: FormatCode): boolean {
  return EXCLUDED.some(([f, t]) => f === from && t === to);
}

export const FORMAT_PAIRS: FormatPair[] = INPUT_FORMATS.flatMap((from) =>
  OUTPUT_FORMATS.filter((to) => to.code !== from.code && !isExcluded(from.code, to.code)).map(
    (to): FormatPair => ({
      from: from.code,
      // Safe: OUTPUT_FORMATS is pre-filtered to formats with canOutput === true,
      // which is exactly the OutputFormatCode set.
      to: to.code as OutputFormatCode,
      slug: `${from.code}-to-${to.code}`,
    }),
  ),
);

export function getPairBySlug(slug: string): FormatPair | undefined {
  return FORMAT_PAIRS.find((p) => p.slug === slug);
}

export function popularPairs(limit = 6): FormatPair[] {
  const priority: FormatCode[] = ["webp", "jpg", "png"];
  const scored = FORMAT_PAIRS.map((p) => ({
    pair: p,
    score: (priority.includes(p.to) ? 10 - priority.indexOf(p.to) : 0) +
      (priority.includes(p.from) ? 5 - priority.indexOf(p.from) : 0),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.pair);
}

export { FORMATS };
