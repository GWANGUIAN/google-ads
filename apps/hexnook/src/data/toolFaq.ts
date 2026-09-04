export interface FaqItem {
  question: string;
  answer: string;
}

/** Rendered visibly by each tool page's <Faq> section AND fed into
 *  faqPageSchema() for that same page's JSON-LD — always the same array, so
 *  the structured data can never drift from what's on screen (see
 *  docs/NEW_SITE_PLAYBOOK.md §4). */
export const jsonFaq: FaqItem[] = [
  {
    question: "Is my JSON uploaded anywhere?",
    answer:
      "No. Formatting, minifying, and validating all happen with JavaScript's own JSON.parse/JSON.stringify, running entirely in your browser tab. Nothing you paste is ever sent to a server.",
  },
  {
    question: "Why does it say my JSON is invalid?",
    answer:
      "The formatter shows the exact line and column where parsing failed, taken directly from the error JavaScript's own parser raises. Common causes are trailing commas, single quotes instead of double quotes, or an unquoted key.",
  },
  {
    question: "Does it preserve key order?",
    answer:
      "Yes — formatting only re-indents your JSON, it doesn't sort or reorder keys. Object key order is preserved exactly as you typed it.",
  },
  {
    question: "Can I format really large JSON files?",
    answer:
      "Yes, formatting happens synchronously in your browser's own memory, so it's limited only by your device — there's no server-side file size cap because there's no server involved at all.",
  },
  {
    question: "What's the difference between format and minify?",
    answer:
      "Format (pretty-print) adds indentation and line breaks for readability. Minify strips all whitespace to produce the smallest possible payload for production use.",
  },
];

export const base64Faq: FaqItem[] = [
  {
    question: "Does this handle non-English text correctly?",
    answer:
      "Yes. Text is encoded via TextEncoder/TextDecoder before Base64 conversion, so multi-byte UTF-8 characters (accents, Korean, emoji, etc.) round-trip correctly — a naive btoa()/atob() call would corrupt them.",
  },
  {
    question: "What is 'URL-safe' Base64?",
    answer:
      "Standard Base64 uses + and / characters, which have special meaning inside a URL. The URL-safe variant swaps those for - and _ instead (and often drops padding), so the result can be used directly inside a URL or filename.",
  },
  {
    question: "Can I convert a file to Base64?",
    answer:
      "Yes — drop a file onto the encoder and it's read directly into your browser's memory and converted to a Base64 data URI. The file is never uploaded anywhere.",
  },
  {
    question: "Why did decoding fail?",
    answer:
      "The input isn't valid Base64 for the mode you've selected — check you haven't mixed the standard and URL-safe character sets, and that the string length is a multiple of 4 once padding is accounted for.",
  },
];

export const hashFaq: FaqItem[] = [
  {
    question: "Is MD5 safe to use?",
    answer:
      "Not for security purposes — MD5 is cryptographically broken and shouldn't be used for passwords or integrity checks against a malicious actor. It's included here because it's still common for legacy checksums and cache keys.",
  },
  {
    question: "Which hash should I use for security?",
    answer:
      "SHA-256 or SHA-512 for most modern use cases. Note that none of these algorithms are appropriate for hashing passwords directly — use a dedicated password-hashing function like bcrypt or Argon2 for that instead.",
  },
  {
    question: "Are the hashes computed locally?",
    answer:
      "Yes. SHA-1/256/384/512 use your browser's built-in Web Crypto API (crypto.subtle.digest) and MD5 uses a small local JavaScript implementation — neither ever sends your input anywhere.",
  },
  {
    question: "Why do I get a different hash for the same text elsewhere?",
    answer:
      "Hashes are byte-exact — a trailing newline, different text encoding, or invisible whitespace will produce a completely different hash. Double-check the exact bytes being hashed on both sides.",
  },
];

export const regexFaq: FaqItem[] = [
  {
    question: "Which regex flavor does this use?",
    answer:
      "JavaScript's native RegExp engine (ECMAScript regex), running in your own browser — the same engine your browser's console or a Node.js script would use.",
  },
  {
    question: "What do the flags (g, i, m, s, u, y) mean?",
    answer:
      "g = global (find all matches, not just the first), i = case-insensitive, m = multiline (^ and $ match line boundaries), s = dotAll (. matches newlines), u = full Unicode mode, y = sticky (match only at lastIndex).",
  },
  {
    question: "Why aren't capture groups showing up?",
    answer:
      "Capture groups only appear in the match list, not the inline highlight. Make sure your pattern actually contains parentheses — non-capturing groups (?:...) intentionally don't produce a group entry.",
  },
  {
    question: "Is my test string sent anywhere?",
    answer:
      "No — matching runs entirely client-side against JavaScript's built-in regex engine. Nothing you type into the pattern or test string fields leaves your browser.",
  },
];

export const jwtFaq: FaqItem[] = [
  {
    question: "Can this tool see the contents of my token?",
    answer:
      "No — the token is decoded entirely in your browser using base64url and JSON.parse. It's never sent to any server, which matters since a JWT's payload is only base64-encoded, not encrypted, and often contains sensitive claims.",
  },
  {
    question: "Can I verify the signature?",
    answer:
      "Yes, for HS256/HS384/HS512 tokens — paste the shared secret and the tool verifies the signature locally using the Web Crypto API. Asymmetric algorithms (RS256, ES256, etc.) can't be verified client-side without the issuer's public key, so those are decode-only.",
  },
  {
    question: "What do exp, iat, and nbf mean?",
    answer:
      "They're standard JWT claims expressed as Unix timestamps: iat is when the token was issued, exp is when it expires, and nbf ('not before') is the earliest time it becomes valid. This tool converts all three to readable dates automatically.",
  },
  {
    question: "Why does it say the token is malformed?",
    answer:
      "A JWT must have exactly three base64url segments separated by dots (header.payload.signature). If a segment is missing or contains invalid base64url characters, decoding fails before it ever reaches the signature check.",
  },
];

/** General site-wide FAQ, rendered on /faq. */
export const siteFaq: FaqItem[] = [
  {
    question: "Do I need to sign up to use these tools?",
    answer: "No. Every tool on hexnook works immediately, with no account, no email, and no usage limits.",
  },
  {
    question: "Is anything I type or upload ever sent to a server?",
    answer:
      "No. Every tool runs entirely in your browser using JavaScript and the Web Crypto API. hexnook has no backend that receives what you type — see each tool's own FAQ for the specifics.",
  },
  {
    question: "Is hexnook free?",
    answer:
      "Yes, completely free. The site is supported by advertising rather than a paywall or usage-based pricing.",
  },
  {
    question: "Will more tools be added?",
    answer: "Yes — hexnook is actively growing. See the Guides section for deep dives on the tools already live.",
  },
];
