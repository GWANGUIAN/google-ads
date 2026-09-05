/** The preset-size matrix — one entry per generated SEO page, and the same
 * list backs the width/height preset dropdown inside ResizerWidget. Mirrors
 * the data-matrix / getStaticPaths() pattern used by img-convertor/qr-tools
 * (see docs/NEW_SITE_PLAYBOOK.md §4): pages are generated from this module,
 * not hand-authored per page. */

export type PresetCategory = "social" | "video" | "display" | "print";

export interface ResizePreset {
  slug: string;
  /** Used in headings/dropdown, e.g. "Instagram Post". */
  label: string;
  width: number;
  height: number;
  category: PresetCategory;
  /** One-line "why this size" fact, used to assemble non-duplicate per-page copy. */
  fact: string;
  /** Present only for sizes that are a common convention rather than a hard spec. */
  caveat?: string;
}

export const RESIZE_PRESETS: ResizePreset[] = [
  {
    slug: "instagram-post",
    label: "Instagram Post",
    width: 1080,
    height: 1080,
    category: "social",
    fact: "Instagram displays square feed posts at 1080×1080 — the resolution Instagram itself recommends so its own re-compression doesn't soften the image further.",
  },
  {
    slug: "instagram-story",
    label: "Instagram Story",
    width: 1080,
    height: 1920,
    category: "social",
    fact: "Stories and Reels fill a 9:16 vertical frame; 1080×1920 matches the full-screen resolution most phones display them at.",
  },
  {
    slug: "facebook-cover",
    label: "Facebook Cover",
    width: 820,
    height: 312,
    category: "social",
    fact: "Facebook crops cover photos differently on desktop and mobile — 820×312 is the safe size that keeps important content visible on both.",
  },
  {
    slug: "twitter-post",
    label: "Twitter/X Post",
    width: 1600,
    height: 900,
    category: "social",
    fact: "A 16:9 image at 1600×900 displays at full width in the X timeline instead of being cropped into a square preview.",
  },
  {
    slug: "linkedin-banner",
    label: "LinkedIn Banner",
    width: 1584,
    height: 396,
    category: "social",
    fact: "LinkedIn's profile background banner renders at a wide 4:1 ratio — 1584×396 fills it edge-to-edge on both desktop and mobile.",
  },
  {
    slug: "youtube-thumbnail",
    label: "YouTube Thumbnail",
    width: 1280,
    height: 720,
    category: "video",
    fact: "YouTube recommends 1280×720 (16:9) thumbnails — the resolution it uses to generate every smaller size shown across search, suggested videos, and playlists.",
  },
  {
    slug: "1920x1080",
    label: "Full HD (1920×1080)",
    width: 1920,
    height: 1080,
    category: "display",
    fact: "1920×1080 is the standard Full HD resolution used by most monitors, TVs, and presentation projectors.",
  },
  {
    slug: "passport-photo",
    label: "Passport Photo",
    width: 600,
    height: 600,
    category: "print",
    fact: "A common digital starting size for passport-style photos is a square image around 600×600px (roughly 2×2 inches at 300 DPI).",
    caveat:
      "This is a common digital starting size, not an official government specification — official passport and visa photo requirements (exact dimensions, head size, background) vary by country and agency, so always verify the exact requirement before submitting a photo.",
  },
  {
    slug: "4k",
    label: "4K (3840×2160)",
    width: 3840,
    height: 2160,
    category: "display",
    fact: "3840×2160 is the standard 4K UHD resolution — 4x the pixel count of Full HD — used by 4K displays, TVs, and video exports.",
  },
];

export function findPreset(slug: string): ResizePreset | undefined {
  return RESIZE_PRESETS.find((preset) => preset.slug === slug);
}
