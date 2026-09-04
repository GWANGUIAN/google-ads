import type { QrTypeInfo } from "./qrTypes";

/** Templated per-page intro/why copy, assembled from each QR type's own
 * description (not hand-written per page) so every generated page reads as
 * genuinely different rather than mail-merged filler. See
 * docs/NEW_SITE_PLAYBOOK.md §4. */

export function buildIntro(type: QrTypeInfo): string {
  return `Fill in the details below and this tool generates a ${type.label} QR code instantly, entirely inside your browser — no upload, no install, no sign-up. ${type.description}`;
}

export function buildWhy(type: QrTypeInfo): string {
  return `The code is generated locally using JavaScript, so nothing you enter for this ${type.label.toLowerCase()} QR code is ever sent to a server. Download it as a PNG for printing or a scalable SVG for design work, in any size or color.`;
}
