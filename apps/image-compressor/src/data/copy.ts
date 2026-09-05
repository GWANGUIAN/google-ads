import type { CompressFormatInfo } from "./formats";

/** Templated per-format intro/why copy, assembled from each format's own
 * description and facts (not hand-written per page) so every generated page
 * reads as genuinely different rather than mail-merged filler. See
 * docs/NEW_SITE_PLAYBOOK.md §4. */

export function buildIntro(format: CompressFormatInfo): string {
  return `Drop a ${format.label} file below and this tool re-encodes it to a smaller size instantly, entirely inside your browser — no upload, no install, no sign-up. ${format.description}`;
}

export function buildWhy(format: CompressFormatInfo): string {
  const facts = format.whyCompress.join(" ");
  return `${facts} Typical size reduction with this tool: ${format.typicalReduction}, depending on the image and, for lossy formats, the quality setting you choose.`;
}
