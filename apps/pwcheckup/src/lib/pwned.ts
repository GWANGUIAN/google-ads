/**
 * HaveIBeenPwned "Pwned Passwords" k-anonymity check. The password is hashed
 * locally (Web Crypto SHA-1) and only the first 5 hex characters of the hash
 * are ever sent over the network — the API returns every suffix sharing that
 * prefix, and the match is decided locally. The full password and full hash
 * never leave this function. See src/i18n/dictionaries and the Privacy
 * Policy page, which describe this exact flow to users.
 */
export interface PwnedCheckResult {
  breached: boolean;
  count: number;
}

async function sha1Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export async function checkPwnedPassword(password: string, signal?: AbortSignal): Promise<PwnedCheckResult> {
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    signal,
    headers: { "Add-Padding": "true" },
  });

  if (!res.ok) {
    throw new Error(`pwned_http_${res.status}`);
  }

  const body = await res.text();
  for (const line of body.split("\n")) {
    const [lineSuffix, countStr] = line.trim().split(":");
    if (lineSuffix === suffix) {
      return { breached: true, count: Number(countStr) || 0 };
    }
  }

  return { breached: false, count: 0 };
}
