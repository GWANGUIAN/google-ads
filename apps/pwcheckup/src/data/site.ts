export const SITE = {
  name: "PW Checkup",
  tagline: "Check if your password has been leaked — privately, in your browser",
  url: "https://pwcheckup.com",
  description:
    "Check whether your password has appeared in a known data breach, entirely in your browser. Only a partial hash is ever sent — your real password never leaves your device.",
  contactEmail: "hello@pwcheckup.com",
};

/**
 * Naver Search Advisor ownership verification (meta tag), optional. Google
 * Search Console is DNS-verified via Cloudflare and Bing Webmaster Tools can
 * import that verification directly, so neither needs a var/meta tag here —
 * Naver has no such shortcut. See docs/NEW_SITE_PLAYBOOK.md §4.
 */
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

export const KAKAO = {
  jsKey: import.meta.env.PUBLIC_KAKAO_JS_KEY ?? "",
};
