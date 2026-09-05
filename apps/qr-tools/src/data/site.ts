import { createSiteConfig } from "@repo/seo/siteConfig";

export const { SITE, SITE_VERIFICATION, ADS } = createSiteConfig({
  name: "QR Code Tools",
  tagline: "Free, private QR code generator & scanner",
  urlDefault: "https://loomfile.com",
  description:
    "Generate and scan QR codes for URLs, WiFi, contact cards, and more — instantly in your browser. Free, private, no sign-up, nothing ever uploaded.",
});
