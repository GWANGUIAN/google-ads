/**
 * Every tool app's `src/data/site.ts` used to hand-write the same
 * SITE/SITE_VERIFICATION/ADS shape, reading the same PUBLIC_* env var names,
 * differing only in a handful of literal strings. That duplication meant a
 * typo'd env var name in one app wouldn't surface until that specific ad
 * slot silently failed to render. `createSiteConfig()` is the single place
 * that shape and those env var names are defined — see
 * docs/NEW_SITE_PLAYBOOK.md §4/§5/§8.
 */

export interface SiteConfigInput {
  name: string;
  tagline: string;
  /** Used unless PUBLIC_SITE_URL overrides it (e.g. a dual-target app's umbrella build). */
  urlDefault: string;
  description: string;
  contactEmail?: string;
}

export interface SiteConfigResult {
  SITE: {
    name: string;
    tagline: string;
    url: string;
    description: string;
    contactEmail: string;
  };
  SITE_VERIFICATION: {
    google: string;
    naver: string;
    bing: string;
  };
  ADS: {
    enabled: boolean;
    clientId: string;
    slots: {
      header: string;
      inContent: string;
      sidebar: string;
      footer: string;
    };
  };
}

export function createSiteConfig(input: SiteConfigInput): SiteConfigResult {
  return {
    SITE: {
      name: input.name,
      tagline: input.tagline,
      url: import.meta.env.PUBLIC_SITE_URL ?? input.urlDefault,
      description: input.description,
      contactEmail: input.contactEmail ?? "hello@loomfile.com",
    },
    SITE_VERIFICATION: {
      google: import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
      naver: import.meta.env.PUBLIC_NAVER_SITE_VERIFICATION ?? "",
      bing: import.meta.env.PUBLIC_BING_SITE_VERIFICATION ?? "",
    },
    ADS: {
      enabled: import.meta.env.PUBLIC_ADS_ENABLED === "true",
      clientId: import.meta.env.PUBLIC_ADSENSE_CLIENT_ID ?? "",
      slots: {
        header: import.meta.env.PUBLIC_AD_SLOT_HEADER ?? "",
        inContent: import.meta.env.PUBLIC_AD_SLOT_IN_CONTENT ?? "",
        sidebar: import.meta.env.PUBLIC_AD_SLOT_SIDEBAR ?? "",
        footer: import.meta.env.PUBLIC_AD_SLOT_FOOTER ?? "",
      },
    },
  };
}
