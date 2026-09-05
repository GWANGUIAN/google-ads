import { createSiteConfig } from "@repo/seo/siteConfig";

export const { SITE, SITE_VERIFICATION, ADS } = createSiteConfig({
  name: "Image Resizer",
  tagline: "Free, private image resizer",
  urlDefault: "https://loomfile.com",
  description:
    "Resize any image to an exact width and height, or a ready-made preset — Instagram, YouTube thumbnails, Full HD, and more — instantly in your browser. Free, private, no sign-up, nothing ever uploaded.",
});
