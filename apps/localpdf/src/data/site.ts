import { createSiteConfig } from "@repo/seo/siteConfig";

export const { SITE, SITE_VERIFICATION, ADS } = createSiteConfig({
  name: "LocalPDF",
  tagline: "Free, private, in-browser PDF toolkit",
  urlDefault: "https://loomfile.com",
  description:
    "Convert images to PDF, merge and split PDFs, delete/reorder/rotate pages, view PDFs, and extract text — for free, right in your browser. No uploads, no sign-up, your files never leave your device.",
});
