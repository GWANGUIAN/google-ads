import { useEffect, useState } from "react";
import { canUseWebShare, copyLink, loadKakao, shareNative, shareToKakao } from "@/lib/share";
import { getDictionary, type Locale } from "@/i18n/config";
import { SITE, KAKAO } from "@/data/site";

interface Props {
  lang: Locale;
}

export default function ShareButtons({ lang }: Props) {
  const t = getDictionary(lang);
  const [webShareSupported, setWebShareSupported] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setWebShareSupported(canUseWebShare());
  }, []);

  const shareContent = {
    title: SITE.name,
    description: t.share.promoText,
    text: t.share.promoText,
    // Kakao's feed template card renders roughly square (its own official
    // example uses a 640x640 image) — the wide 1200x630 og-image.png used
    // for Facebook/Twitter/Google gets cropped awkwardly there, so Kakao
    // gets its own square-composed image instead.
    imageUrl: new URL("kakao-share-image.png", SITE.url).toString(),
    url: SITE.url,
  };

  async function handleKakao() {
    if (!KAKAO.jsKey) return;
    await loadKakao(KAKAO.jsKey);
    shareToKakao(shareContent);
  }

  async function handleNative() {
    try {
      await shareNative(shareContent);
    } catch {
      // user cancelled the native share sheet — nothing to do
    }
  }

  async function handleCopy() {
    const ok = await copyLink(shareContent.url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
      {KAKAO.jsKey && (
        <button
          type="button"
          onClick={handleKakao}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-control bg-[#FEE500] px-3 py-1.5 text-xs font-semibold text-[#191919] hover:brightness-95 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
        >
          <KakaoIcon />
          {t.share.kakao}
        </button>
      )}
      {webShareSupported && (
        <button
          type="button"
          onClick={handleNative}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-control bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-900 hover:bg-neutral-200 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
        >
          <ShareIcon />
          {t.share.native}
        </button>
      )}
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-control bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-900 hover:bg-neutral-200 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
      >
        <LinkIcon />
        {copied ? t.share.copied : t.share.copyLink}
      </button>
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.83 5.26 4.6 6.68-.2.73-.73 2.64-.83 3.05 0 0-.02.14.07.19.09.05.19.01.19.01.27-.04 3.03-1.99 3.5-2.32.79.11 1.61.17 2.47.17 5.52 0 10-3.58 10-8s-4.48-8-10-8Z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 10.5 15.4 6.5M8.6 13.5 15.4 17.5" strokeLinecap="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 12a4 4 0 0 0 6 3.5l3-3a4 4 0 1 0-5.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 12a4 4 0 0 0-6-3.5l-3 3a4 4 0 1 0 5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
