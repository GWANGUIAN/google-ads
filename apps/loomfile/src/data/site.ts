export const SITE = {
  name: "LoomFile",
  tagline: "Free, private browser tools",
  url: import.meta.env.PUBLIC_SITE_URL ?? "https://loomfile.com",
  description:
    "A growing collection of free file tools that run entirely in your browser — PDFs, video, images, fonts, and more. No uploads, no sign-up, your files never leave your device.",
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

/** Tools mounted on this domain (relative `slug`), plus tools kept on their
 *  own dedicated domain and cross-linked here (`external: true`, absolute
 *  `slug` URL — see docs/NEW_SITE_PLAYBOOK.md §11). Extend this list as new
 *  tools are added — the header, footer, and landing page all read from it. */
export const TOOLS = [
  {
    slug: "/pdf/",
    name: "PDF Tools",
    tagline: "Convert, merge, split, organize, view, and extract from PDFs",
  },
  {
    slug: "/video/",
    name: "Video Tools",
    tagline: "Compress and trim MP4 and WebM video, right in your browser",
  },
  {
    slug: "/image-convertor/",
    name: "Image Convertor",
    tagline: "Convert images between PNG, JPG, WEBP, BMP, GIF, and HEIC",
  },
  {
    slug: "/font/",
    name: "Font Tools",
    tagline: "Convert TTF, OTF, WOFF, and WOFF2 fonts, right in your browser",
  },
];
