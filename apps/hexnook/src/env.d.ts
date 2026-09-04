/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_ADS_ENABLED: string;
  readonly PUBLIC_ADSENSE_CLIENT_ID: string;
  readonly PUBLIC_AD_SLOT_HEADER: string;
  readonly PUBLIC_AD_SLOT_IN_CONTENT: string;
  readonly PUBLIC_AD_SLOT_FOOTER: string;
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_NAVER_SITE_VERIFICATION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  adsbygoogle: unknown[];
}
