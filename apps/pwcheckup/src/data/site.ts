export const SITE = {
  name: "PW Checkup",
  tagline: "Check if your password has been leaked — privately, in your browser",
  url: "https://pwcheckup.com",
  description:
    "Check whether your password has appeared in a known data breach, entirely in your browser. Only a partial hash is ever sent — your real password never leaves your device.",
  contactEmail: "hello@pwcheckup.com",
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
    footer: import.meta.env.PUBLIC_AD_SLOT_FOOTER ?? "",
  },
};

export const KAKAO = {
  jsKey: import.meta.env.PUBLIC_KAKAO_JS_KEY ?? "",
};
