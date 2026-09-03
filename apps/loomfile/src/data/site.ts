export const SITE = {
  name: "LoomFile",
  tagline: "Free, private browser tools",
  url: import.meta.env.PUBLIC_SITE_URL ?? "https://loomfile.com",
  description:
    "A growing collection of free file tools that run entirely in your browser — starting with PDFs. No uploads, no sign-up, your files never leave your device.",
  contactEmail: "hello@loomfile.com",
};

/** Search-engine ownership verification codes (meta tags), all optional. */
export const SITE_VERIFICATION = {
  google: import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  naver: import.meta.env.PUBLIC_NAVER_SITE_VERIFICATION ?? "",
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

/** Tools live on this domain, each mounted at its own path. Extend this list
 *  as new tools are added — the landing page and footer read from it. */
export const TOOLS = [
  {
    slug: "/pdf/",
    name: "PDF Tools",
    tagline: "Convert, merge, split, organize, view, and extract from PDFs",
  },
];
