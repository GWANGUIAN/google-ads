import { FORMATS } from "./formats";
import type { ConversionPage } from "./conversionPairs";

/** Templated per-page intro/why copy, assembled from source + target format
 * facts (not hand-written per page) so every generated page reads as
 * genuinely different rather than mail-merged filler. See
 * docs/NEW_SITE_PLAYBOOK.md §4. */

export function buildIntro(page: ConversionPage): string {
  const source = FORMATS[page.source];
  const target = FORMATS[page.target];
  return `Drop a ${source.label} file below and this tool converts it to ${target.label} instantly, entirely inside your browser — no upload, no install, no sign-up. ${source.description}`;
}

export function buildWhy(page: ConversionPage): string {
  const target = FORMATS[page.target];
  return `${target.description} Conversion runs locally using WebAssembly, so your font file never leaves your device — useful for licensed or client fonts you can't hand to a third-party server.`;
}
