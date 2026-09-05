import { createSiteConfig } from "@repo/seo/siteConfig";

export const { SITE, SITE_VERIFICATION, ADS } = createSiteConfig({
  name: "ImgConvertor",
  tagline: "Free, private, in-browser image format converter",
  urlDefault: "https://imgconvertor.download",
  description:
    "Convert images between PNG, JPG, WEBP, BMP, GIF, and HEIC for free, right in your browser. No uploads, no sign-up, no watermarks — your files never leave your device.",
  contactEmail: "hello@imgconvertor.download",
});
