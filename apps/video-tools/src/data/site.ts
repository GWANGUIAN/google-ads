import { createSiteConfig } from "@repo/seo/siteConfig";

export const { SITE, SITE_VERIFICATION, ADS } = createSiteConfig({
  name: "Video Tools",
  tagline: "Free, private, in-browser video compress & trim",
  urlDefault: "https://loomfile.com",
  description:
    "Compress and trim MP4 and WebM videos instantly in your browser — free, private, no upload required. Your video never leaves your device.",
});
