import { createSiteConfig } from "@repo/seo/siteConfig";

export const { SITE, SITE_VERIFICATION, ADS } = createSiteConfig({
  name: "LoomFile",
  tagline: "Free, private browser tools",
  urlDefault: "https://loomfile.com",
  description:
    "A growing collection of free file tools that run entirely in your browser — PDFs, video, images, fonts, QR codes, and more. No uploads, no sign-up, your files never leave your device.",
});

/** Tools mounted on this domain (relative `slug`), plus tools kept on their
 *  own dedicated domain and cross-linked here (`external: true`, absolute
 *  `slug` URL — see docs/NEW_SITE_PLAYBOOK.md §11). Extend this list as new
 *  tools are added — the header, footer, and landing page all read from it. */
export const TOOLS: Array<{
  slug: string;
  name: string;
  tagline: string;
  external?: boolean;
}> = [
  {
    slug: "/pdf/",
    name: "PDF Tools",
    tagline: "Convert, merge, split, organize, view, and extract from PDFs",
  },
  {
    slug: "/video/",
    name: "Video Tools",
    tagline: "Compress and trim MP4 and WebM video, right in your browser",
  },
  {
    slug: "/image-convertor/",
    name: "Image Convertor",
    tagline: "Convert images between PNG, JPG, WEBP, BMP, GIF, and HEIC",
  },
  {
    slug: "/font/",
    name: "Font Tools",
    tagline: "Convert TTF, OTF, WOFF, and WOFF2 fonts, right in your browser",
  },
  {
    slug: "/qr/",
    name: "QR Code Tools",
    tagline: "Generate and scan QR codes, right in your browser",
  },
  {
    slug: "/compress/",
    name: "Image Compressor",
    tagline: "Compress JPG, PNG, and WebP images without losing quality",
  },
  {
    slug: "/resize/",
    name: "Image Resizer",
    tagline: "Resize images to exact dimensions or popular presets",
  },
];
