/**
 * Share helpers: KakaoTalk (via Kakao's official CDN JS SDK, lazily
 * injected), the native Web Share API, and a clipboard-copy fallback. Share
 * content is always generic tool-promotion copy — never anything tied to a
 * specific password or check result.
 *
 * IMPORTANT — the version number AND its matching SRI integrity hash below
 * are NOT verified and must be replaced before shipping. Get the current,
 * exact pair from the "Download" section of
 * https://developers.kakao.com/docs/latest/en/getting-started/sdk-js
 * (Kakao does not publish a stable "latest" URL, and the integrity hash
 * must byte-for-byte match the specific version served — a mismatched
 * hash makes the browser silently refuse to run the script, which would
 * break every share button with no visible error). If you'd rather not
 * track this by hand, drop the `integrity`/`crossOrigin` lines entirely —
 * SRI is a defense-in-depth nicety here, not a functional requirement.
 */
const KAKAO_SDK_VERSION = "2.7.4"; // TODO verify against Kakao's Download page
const KAKAO_SDK_URL = `https://t1.kakaocdn.net/kakao_js_sdk/${KAKAO_SDK_VERSION}/kakao.min.js`;
const KAKAO_SDK_INTEGRITY = ""; // TODO fill in the exact hash for KAKAO_SDK_VERSION from Kakao's Download page

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
