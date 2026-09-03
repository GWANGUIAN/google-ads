import { SOURCE_FORMATS, TARGET_FORMATS, type FontFormatCode } from "./formats";

export interface ConversionPage {
  source: FontFormatCode;
  target: FontFormatCode;
  slug: string;
}

/** Cross product of source × target formats, minus same-format pairs and any
 * OTF target (fonteditor-core can't write OTF — see formats.ts). 4 sources ×
 * 3 targets − 3 same-format pairs = 9 pages. See docs/NEW_SITE_PLAYBOOK.md §4
 * and img-convertor's data/pairs.ts for the pattern this mirrors. */
export const CONVERSION_PAGES: ConversionPage[] = SOURCE_FORMATS.flatMap((source) =>
  TARGET_FORMATS.filter((target) => target.code !== source.code).map((target) => ({
    source: source.code,
    target: target.code,
    slug: `${source.code}-to-${target.code}`,
  })),
);

export function getConversionPageBySlug(slug: string): ConversionPage | undefined {
  return CONVERSION_PAGES.find((p) => p.slug === slug);
}
