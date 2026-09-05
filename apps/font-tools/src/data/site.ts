import { createSiteConfig } from "@repo/seo/siteConfig";

export const { SITE, SITE_VERIFICATION, ADS } = createSiteConfig({
  name: "Font Tools",
  tagline: "Free, private, in-browser font conversion",
  urlDefault: "https://loomfile.com",
  description:
    "Convert TTF, OTF, WOFF, and WOFF2 font files instantly in your browser — free, private, no upload required. Your font never leaves your device.",
});
