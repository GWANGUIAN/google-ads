import SparkMD5 from "spark-md5";

export interface HashResult {
  algo: string;
  value: string;
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha(algo: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512", text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest(algo, data);
  return bufferToHex(digest);
}

/** spark-md5's SparkMD5.hash() treats the string as raw Latin1 bytes, so
 *  multi-byte UTF-8 text is converted to a byte-safe binary string first via
 *  TextEncoder — otherwise non-ASCII text would hash differently here than
 *  in any other MD5 implementation. */
function md5(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return SparkMD5.hash(binary);
}

export async function computeAllHashes(text: string): Promise<HashResult[]> {
  const [sha1, sha256, sha384, sha512] = await Promise.all([
    sha("SHA-1", text),
    sha("SHA-256", text),
    sha("SHA-384", text),
    sha("SHA-512", text),
  ]);

  return [
    { algo: "MD5", value: md5(text) },
    { algo: "SHA-1", value: sha1 },
    { algo: "SHA-256", value: sha256 },
    { algo: "SHA-384", value: sha384 },
    { algo: "SHA-512", value: sha512 },
  ];
}
