export const SITE = {
  name: "ImgConvertor",
  tagline: "Free, private, in-browser image format converter",
  url: import.meta.env.PUBLIC_SITE_URL ?? "https://imgconvertor.download",
  description:
    "Convert images between PNG, JPG, WEBP, BMP, GIF, and HEIC for free, right in your browser. No uploads, no sign-up, no watermarks — your files never leave your device.",
  contactEmail: "hello@imgconvertor.download",
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
