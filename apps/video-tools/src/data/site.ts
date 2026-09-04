export const SITE = {
  name: "Video Tools",
  tagline: "Free, private, in-browser video compress & trim",
  url: import.meta.env.PUBLIC_SITE_URL ?? "https://loomfile.com",
  description:
    "Compress and trim MP4 and WebM videos instantly in your browser — free, private, no upload required. Your video never leaves your device.",
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
