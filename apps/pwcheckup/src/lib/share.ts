/**
 * Share helpers: KakaoTalk (via Kakao's official CDN JS SDK, lazily
 * injected), the native Web Share API, and a clipboard-copy fallback. Share
 * content is always generic tool-promotion copy — never anything tied to a
 * specific password or check result.
 *
 * Version + integrity copied directly (via the page's own copy-to-clipboard
 * button, not hand-typed) from the "다운로드"/Download table at
 * https://developers.kakao.com/docs/ko/javascript/download on 2026-09-04.
 * Kakao does not publish a stable "latest" URL and the integrity hash must
 * byte-for-byte match this exact version — re-copy both together from that
 * page (not just the version number) whenever bumping this.
 */
const KAKAO_SDK_VERSION = "2.8.3";
const KAKAO_SDK_URL = `https://t1.kakaocdn.net/kakao_js_sdk/${KAKAO_SDK_VERSION}/kakao.min.js`;
const KAKAO_SDK_INTEGRITY = "sha384-oroumrnFVE0xtgqyDZJARgERibXg2C28380uaUZz2kHDS5CR7tu20eGiOU6GkTpy";

let kakaoLoading: Promise<void> | null = null;

export function loadKakao(jsKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Kakao?.isInitialized()) return Promise.resolve();

  if (!kakaoLoading) {
    kakaoLoading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = KAKAO_SDK_URL;
      if (KAKAO_SDK_INTEGRITY) {
        script.integrity = KAKAO_SDK_INTEGRITY;
        script.crossOrigin = "anonymous";
      }
      script.onload = () => {
        window.Kakao?.init(jsKey);
        resolve();
      };
      script.onerror = () => reject(new Error("kakao_sdk_load_failed"));
      document.head.appendChild(script);
    });
  }

  return kakaoLoading;
}

export interface ShareContent {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
}

export function shareToKakao(content: ShareContent): void {
  window.Kakao?.Share.sendDefault({
    objectType: "feed",
    content: {
      title: content.title,
      description: content.description,
      imageUrl: content.imageUrl,
      // Matches Kakao's own feed-template example (a 640x640 image with
      // imageWidth/imageHeight set) — helps the card render the square
      // share image correctly instead of guessing an aspect ratio.
      imageWidth: 800,
      imageHeight: 800,
      link: { mobileWebUrl: content.url, webUrl: content.url },
    },
    buttons: [
      {
        title: content.title,
        link: { mobileWebUrl: content.url, webUrl: content.url },
      },
    ],
  });
}

export function canUseWebShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function shareNative(opts: { title: string; text: string; url: string }): Promise<void> {
  await navigator.share(opts);
}

export async function copyLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}
