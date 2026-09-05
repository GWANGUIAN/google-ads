import { createSiteConfig } from "@repo/seo/siteConfig";

export const { SITE, SITE_VERIFICATION, ADS } = createSiteConfig({
  name: "Image Compressor",
  tagline: "Free, private image compressor",
  urlDefault: "https://loomfile.com",
  description:
    "Compress JPG, PNG, and WEBP images instantly in your browser — free, private, no sign-up, nothing ever uploaded.",
});
