import { FORMATS, type FormatPair } from "./pairs";

/** Templated per-pair intro + "why convert" copy, assembled from format facts
 * (not hand-written per page) so every generated page reads as genuinely
 * different rather than mail-merged filler. See docs/NEW_SITE_PLAYBOOK.md. */

export function buildIntro(pair: FormatPair): string {
  const from = FORMATS[pair.from];
  const to = FORMATS[pair.to];
  return `${from.label} and ${to.label} are both common image formats, but they serve different purposes. ${from.label} is typically used for ${from.typicalUse[0]}, while ${to.label} is best known for ${to.typicalUse[0]}. Converting from ${from.label} to ${to.label} takes seconds with this tool — just drop your files below, and the conversion happens instantly on your own device.`;
}

export function buildWhyConvert(pair: FormatPair): string {
  const from = FORMATS[pair.from];
  const to = FORMATS[pair.to];

  if (to.code === "webp") {
    return `Converting to WEBP is one of the easiest ways to shave file size off your images without a visible quality hit — most ${from.label} files shrink by 25-35% once converted, which speeds up page loads if you're uploading to a website.`;
  }
  if (from.code === "heic") {
    return `HEIC is the default photo format on modern iPhones and iPads, but it isn't well supported outside Apple's ecosystem. Converting to ${to.label} makes your photos openable on Windows, Android, and virtually any website or app that doesn't otherwise support HEIC.`;
  }
  if (from.code === "gif") {
    return `GIFs are limited to 256 colors and can look noticeably banded, especially in photos. Converting the frame to ${to.label} gives you a sharper, full-color still image.`;
  }
  if (to.code === "png" && from.compression === "lossy") {
    return `Converting to PNG gives you a lossless copy of your image with no further compression artifacts, which is useful if you plan to edit the image further before its final export.`;
  }
  if (to.code === "jpg") {
    return `JPG remains the most universally compatible photo format — converting to JPG is a safe choice when you need a file that will open correctly in absolutely any app, browser, or printer.`;
  }
  if (to.code === "bmp") {
    return `BMP stores pixel data with zero compression, which is occasionally required by legacy Windows software or specific print workflows that don't accept compressed formats.`;
  }
  return `Converting from ${from.label} to ${to.label} lets you match whatever format a specific app, website, or workflow requires.`;
}
