export type Base64Result = { ok: true; value: string } | { ok: false; error: string };

function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromUrlSafe(b64: string): string {
  let out = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (out.length % 4 !== 0) out += "=";
  return out;
}

/** UTF-8-safe Base64 encode — naive btoa() on a raw string corrupts any
 *  character outside Latin1, so text is routed through TextEncoder first. */
export function encodeBase64(text: string, urlSafe: boolean): Base64Result {
  try {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    const b64 = btoa(binary);
    return { ok: true, value: urlSafe ? toUrlSafe(b64) : b64 };
  } catch {
    return { ok: false, error: "Couldn't encode this input." };
  }
}

export function decodeBase64(input: string, urlSafe: boolean): Base64Result {
  try {
    const normalized = urlSafe ? fromUrlSafe(input.trim()) : input.trim();
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return { ok: true, value: new TextDecoder("utf-8", { fatal: false }).decode(bytes) };
  } catch {
    return { ok: false, error: "That doesn't look like valid Base64 for the selected mode." };
  }
}

export function fileToBase64DataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Couldn't read file"));
    reader.readAsDataURL(file);
  });
}
