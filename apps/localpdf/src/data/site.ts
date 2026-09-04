export const SITE = {
  name: "LocalPDF",
  tagline: "Free, private, in-browser PDF toolkit",
  url: import.meta.env.PUBLIC_SITE_URL ?? "https://loomfile.com",
  description:
    "Convert images to PDF, merge and split PDFs, delete/reorder/rotate pages, view PDFs, and extract text — for free, right in your browser. No uploads, no sign-up, your files never leave your device.",
  contactEmail: "hello@loomfile.com",
};

/** Search-engine ownership verification codes (meta tags), all optional. */
export const SITE_VERIFICATION = {
  google: import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  naver: import.meta.env.PUBLIC_NAVER_SITE_VERIFICATION ?? "",
  bing: import.meta.env.PUBLIC_BING_SITE_VERIFICATION ?? "",
};

export const ADS = {
  enabled: import.meta.env.PUBLIC_ADS_ENABLED === "true",
  clientId: import.meta.env.PUBLIC_ADSENSE_CLIENT_ID ?? "",
  slots: {
    header: import.meta.env.PUBLIC_AD_SLOT_HEADER ?? "",
    inContent: import.meta.env.PUBLIC_AD_SLOT_IN_CONTENT ?? "",
    sidebar: import.meta.env.PUBLIC_AD_SLOT_SIDEBAR ?? "",
    footer: import.meta.env.PUBLIC_AD_SLOT_FOOTER ?? "",
  },
};
