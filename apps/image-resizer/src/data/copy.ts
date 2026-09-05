import type { ResizePreset } from "./presets";

/** Templated per-page intro/why copy, assembled from each preset's own fact
 * (not hand-written per page) so every generated page reads as genuinely
 * different rather than mail-merged filler. See docs/NEW_SITE_PLAYBOOK.md §4. */

export function buildIntro(preset: ResizePreset): string {
  return `Drop an image below and this tool resizes it to ${preset.width}×${preset.height} pixels, entirely inside your browser — no upload, no install, no sign-up. ${preset.fact}`;
}

export function buildWhy(preset: ResizePreset): string {
  const base =
    "With aspect ratio lock on (the default), the tool computes the matching dimension from your image's own proportions so the result isn't stretched or distorted — it never crops your photo. Turn the lock off if you need to hit this exact box regardless of your image's original shape.";
  return preset.caveat ? `${base} ${preset.caveat}` : base;
}
