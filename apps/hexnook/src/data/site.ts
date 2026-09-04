export const SITE = {
  name: "hexnook",
  tagline: "Fast, private, in-browser tools for developers",
  url: import.meta.env.PUBLIC_SITE_URL ?? "https://hexnook.dev",
  description:
    "Ten free developer tools that run entirely in your browser — JSON, Base64, hashing, regex, JWT, color conversion, UUIDs, passwords, timestamps, and text diffing. Nothing you paste is ever uploaded.",
  contactEmail: "hello@hexnook.dev",
};

/** Search-engine ownership verification codes (meta tags), all optional. */
export const SITE_VERIFICATION = {
  naver: import.meta.env.PUBLIC_NAVER_SITE_VERIFICATION ?? "",
};

export const ADS = {
  enabled: import.meta.env.PUBLIC_ADS_ENABLED === "true",
  clientId: import.meta.env.PUBLIC_ADSENSE_CLIENT_ID ?? "",
  slots: {
    header: import.meta.env.PUBLIC_AD_SLOT_HEADER ?? "",
    inContent: import.meta.env.PUBLIC_AD_SLOT_IN_CONTENT ?? "",
    footer: import.meta.env.PUBLIC_AD_SLOT_FOOTER ?? "",
  },
};
