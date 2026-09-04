/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_ADS_ENABLED: string;
  readonly PUBLIC_ADSENSE_CLIENT_ID: string;
  readonly PUBLIC_AD_SLOT_HEADER: string;
  readonly PUBLIC_AD_SLOT_IN_CONTENT: string;
  readonly PUBLIC_AD_SLOT_FOOTER: string;
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_NAVER_SITE_VERIFICATION: string;
  readonly PUBLIC_KAKAO_JS_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  adsbygoogle: unknown[];
  Kakao?: {
    init: (key: string) => void;
    isInitialized: () => boolean;
    Share: {
      sendDefault: (options: Record<string, unknown>) => void;
    };
  };
}
