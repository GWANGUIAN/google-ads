function base64UrlToBytes(input: string): Uint8Array {
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) b64 += "=";
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64UrlToText(input: string): string {
  return new TextDecoder("utf-8", { fatal: false }).decode(base64UrlToBytes(input));
}

export interface DecodedJwt {
  header: unknown;
  payload: unknown;
  signature: string;
  signingInput: string;
}

export type DecodeResult = { ok: true; value: DecodedJwt } | { ok: false; error: string };

export function decodeJwt(token: string): DecodeResult {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return { ok: false, error: "A JWT must have exactly three parts separated by dots (header.payload.signature)." };
  }
  const [headerPart, payloadPart, signaturePart] = parts;

  try {
    const header = JSON.parse(base64UrlToText(headerPart));
    const payload = JSON.parse(base64UrlToText(payloadPart));
    return {
      ok: true,
      value: {
        header,
        payload,
        signature: signaturePart,
        signingInput: `${headerPart}.${payloadPart}`,
      },
    };
  } catch {
    return { ok: false, error: "Couldn't decode the header/payload — invalid base64url or malformed JSON." };
  }
}

const HMAC_ALGS: Record<string, string> = {
  HS256: "SHA-256",
  HS384: "SHA-384",
  HS512: "SHA-512",
};

export function isHmacAlg(alg: unknown): alg is keyof typeof HMAC_ALGS {
  return typeof alg === "string" && alg in HMAC_ALGS;
}

export async function verifyHmacSignature(
  alg: keyof typeof HMAC_ALGS,
  signingInput: string,
  signatureB64Url: string,
  secret: string,
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: HMAC_ALGS[alg] },
    false,
    ["verify"],
  );
  const signatureBytes = base64UrlToBytes(signatureB64Url);
  const messageBytes = new TextEncoder().encode(signingInput);
  // TS's DOM lib types Uint8Array as generic over its backing buffer (a
  // known friction point between @types/node and lib.dom as of TS 5.7+),
  // which trips a false-positive mismatch against BufferSource here — the
  // values are plain ArrayBuffer-backed Uint8Arrays at runtime either way.
  return crypto.subtle.verify("HMAC", key, signatureBytes as BufferSource, messageBytes as BufferSource);
}

/** exp/iat/nbf are Unix timestamps (seconds) per the JWT spec. */
export function formatClaimDate(value: unknown): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return new Date(value * 1000).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}
