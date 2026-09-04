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

export const colorFaq: FaqItem[] = [
  {
    question: "Is my color data sent anywhere?",
    answer:
      "No — conversion between HEX, RGB, and HSL is plain math computed locally, and the color picker is your browser's own native <input type=\"color\"> control. Nothing is sent to a server.",
  },
  {
    question: "Why do HEX and HSL show slightly different values after converting back and forth?",
    answer:
      "HSL is stored as rounded whole-number degrees/percentages, so converting HSL → RGB → HEX and back can shift by 1 unit. That's expected rounding, not a bug.",
  },
  {
    question: "What's the difference between AA and AAA contrast?",
    answer:
      "WCAG 2.1 defines two conformance levels: AA requires a 4.5:1 ratio for normal text (3:1 for large text), AAA requires 7:1 (4.5:1 for large text) — AAA is the stricter, optional level.",
  },
  {
    question: "What counts as \"large text\" for contrast rules?",
    answer:
      "18pt (24px) regular text, or 14pt (18.66px) bold. Large text gets a lower required ratio because its thicker strokes stay legible at lower contrast.",
  },
  {
    question: "Is the native color picker limited in which colors it can pick?",
    answer:
      "Its gamut and precision depend on your OS and browser, since it's their own picker UI — but you can always type an exact HEX, RGB, or HSL value directly into the text fields regardless of what the picker itself supports.",
  },
];

export const uuidFaq: FaqItem[] = [
  {
    question: "What UUID version does this generate?",
    answer:
      "Version 4 (random) — the most commonly used version, generated with crypto.randomUUID(), built directly into your browser.",
  },
  {
    question: "Is a v4 UUID collision actually possible?",
    answer:
      "Practically no. There are 2^122 possible v4 UUIDs — generating a billion per second for 100 years still leaves a vanishingly small chance of ever seeing a collision.",
  },
  {
    question: "Is crypto.randomUUID() actually random?",
    answer:
      "Yes — it draws from your operating system's cryptographically secure random number generator, unlike Math.random(), which is not safe for anything security-sensitive.",
  },
  {
    question: "What's the difference between UUID and GUID?",
    answer:
      "None functionally — GUID is Microsoft's name for the same 128-bit identifier format defined by the UUID standard (RFC 4122).",
  },
  {
    question: "Will other UUID versions (v1, v5, v7) be added?",
    answer:
      "Possibly — v4 covers the vast majority of use cases (a unique ID with no embedded data), so it's the only version supported for now.",
  },
];

export const passwordFaq: FaqItem[] = [
  {
    question: "Are generated passwords ever sent anywhere?",
    answer:
      "No. Every password is generated with crypto.getRandomValues() entirely inside your browser tab — never transmitted, logged, or stored anywhere — and disappears the moment you navigate away or reload the page.",
  },
  {
    question: "Why exclude ambiguous characters?",
    answer:
      "Characters like l, I, 1, O, and 0 can look identical in some fonts. Excluding them makes a password easier to type correctly by hand, at the cost of a very slightly smaller character set.",
  },
  {
    question: "How is \"strength\" calculated?",
    answer:
      "As entropy in bits — length × log2(character set size) — a standard rough proxy for how many guesses a brute-force attack would need. It's not a guarantee against every attack style (e.g. a leaked password reused elsewhere).",
  },
  {
    question: "What password length should I use?",
    answer:
      "For most modern accounts, 16+ characters using all four character types gives comfortable margin against brute-force attacks — go longer if the account allows it.",
  },
  {
    question: "Does adding symbols matter more than length?",
    answer:
      "Length matters more. A longer password with fewer character types is generally stronger than a short one using every type, since entropy scales with both, but length has far more room to grow.",
  },
];

export const timestampFaq: FaqItem[] = [
  {
    question: "What is a Unix timestamp?",
    answer:
      "The number of seconds (or milliseconds) elapsed since January 1, 1970 00:00:00 UTC — the \"epoch\" — used throughout logs, APIs, and databases as a compact, timezone-agnostic way to represent a point in time.",
  },
  {
    question: "Why did my number convert to a date decades off?",
    answer:
      "You likely pasted a millisecond timestamp into the seconds field, or vice versa — a 13-digit number is almost always milliseconds, a 10-digit number is almost always seconds. Use the Auto button to detect which.",
  },
  {
    question: "Does JavaScript have the Year 2038 problem?",
    answer:
      "No — that problem is specific to systems storing time as a 32-bit signed integer of seconds. JavaScript's Date uses a 64-bit float of milliseconds, safely covering roughly ±273,000 years from 1970.",
  },
  {
    question: "What's the difference between the Local and UTC views?",
    answer:
      "Local shows the time in your browser's own timezone; UTC shows the same instant with zero offset — useful when comparing timestamps across servers or logs from different regions.",
  },
  {
    question: "Is anything I type here sent anywhere?",
    answer: "No — every conversion uses JavaScript's built-in Date and Intl APIs, computed entirely in your browser.",
  },
];

export const diffFaq: FaqItem[] = [
  {
    question: "What's the difference between line and word diff?",
    answer:
      "Line diff highlights entire lines that were added or removed. Word diff breaks the comparison down to individual words, which is useful for spotting small edits inside an otherwise unchanged line.",
  },
  {
    question: "Can I diff two files instead of pasting text?",
    answer: "Not yet — this tool is paste-only for now. You can copy a file's contents into either box.",
  },
  {
    question: "Is my text sent anywhere?",
    answer:
      "No — the comparison runs entirely in your browser using a bundled diffing library. Nothing you paste is ever uploaded.",
  },
  {
    question: "Why does a single changed word show the whole line as different?",
    answer: "That's line mode's normal behavior — switch to word mode to see exactly which word changed within an otherwise identical line.",
  },
  {
    question: "Is there a size limit?",
    answer:
      "No hard limit is enforced, but very large inputs (tens of thousands of lines) may be slow to diff since everything runs on your device rather than a server.",
  },
];

export const urlEncoderFaq: FaqItem[] = [
  {
    question: "What's the difference between Component and Full URI mode?",
    answer:
      "Component mode uses encodeURIComponent/decodeURIComponent, which escapes every character with special meaning in a URL — including & = ? / : , — so it's safe for a single query-string value. Full URI mode uses encodeURI/decodeURI, which leaves those structural characters alone since they're expected to appear in a complete URL.",
  },
  {
    question: "Why didn't Full URI mode encode my & or = characters?",
    answer:
      "That's expected — Full URI mode assumes you're encoding an entire URL, where & and = already have meaning (separating query parameters). Switch to Component mode if you're encoding a single value that will be inserted into a query string.",
  },
  {
    question: "Why did decoding fail?",
    answer:
      "The input contains an incomplete or invalid % escape sequence (for example %zz or a trailing % with no hex digits after it) — check for a copy-paste error or double-encoded text.",
  },
  {
    question: "What does batch mode do?",
    answer:
      "Batch mode treats each line of the input as a separate value and encodes or decodes them independently, which is useful for processing a list of query-string values at once instead of one at a time.",
  },
  {
    question: "Is my input sent anywhere?",
    answer:
      "No — encoding and decoding use JavaScript's built-in encodeURIComponent/decodeURIComponent/encodeURI/decodeURI functions, running entirely in your browser.",
  },
];

export const loremIpsumFaq: FaqItem[] = [
  {
    question: "What is Lorem Ipsum?",
    answer:
      "Placeholder text derived from a scrambled passage of Cicero's 1st-century BC Latin text \"de Finibus Bonorum et Malorum.\" It's used in design and typesetting because its Latin-like word shapes don't distract a viewer with readable meaning, letting them focus on layout.",
  },
  {
    question: "What does \"Wrap in HTML tags\" do?",
    answer:
      "It wraps each paragraph in <p>…</p> tags (or each list item in <li>…</li> inside a <ul>) so you can paste the result directly into markup instead of manually adding tags yourself.",
  },
  {
    question: "Why isn't the text exactly the same every time?",
    answer:
      "This generator produces fresh randomized text from a bank of classic Lorem Ipsum words each time you change an option or press Regenerate, rather than repeating one fixed passage — click Regenerate for a new variation with the same settings.",
  },
  {
    question: "Is this sent anywhere?",
    answer: "No — text is generated entirely in your browser with no network request involved.",
  },
];

export const htmlFormatterFaq: FaqItem[] = [
  {
    question: "Does minifying strip out my comments?",
    answer:
      "Yes — HTML comments are removed during minification, along with all redundant whitespace between and inside tags, to produce the smallest valid output. Content inside <pre>, <textarea>, <script>, and <style> tags is left untouched so nothing you see or run changes.",
  },
  {
    question: "Does this minify inline <script> or <style> blocks too?",
    answer:
      "No — this tool only minifies HTML structure. Use the dedicated CSS Formatter or JS Formatter tool to minify embedded stylesheet or script code separately, then paste the result back in.",
  },
  {
    question: "Is my HTML sent anywhere?",
    answer: "No — minifying and beautifying both run entirely in your browser using bundled JavaScript libraries. Nothing you paste is uploaded.",
  },
  {
    question: "Will minifying ever break my HTML?",
    answer:
      "It shouldn't — only whitespace, comments, and redundant markup are removed, never actual content or structure. If output looks wrong, double-check the input was valid HTML to begin with.",
  },
];

export const cssFormatterFaq: FaqItem[] = [
  {
    question: "What does the minifier actually remove?",
    answer:
      "Whitespace, comments, and redundant syntax (like unnecessary units on zero values or duplicate semicolons) — the visual result is identical, just far smaller to transfer.",
  },
  {
    question: "Does it support modern CSS features?",
    answer:
      "Yes — nesting, custom properties (CSS variables), media queries, and other modern syntax are all preserved correctly through both minify and beautify.",
  },
  {
    question: "Is my CSS sent anywhere?",
    answer: "No — both minifying and beautifying run entirely in your browser. Nothing you paste is uploaded.",
  },
  {
    question: "Why is the output empty when I paste something in?",
    answer:
      "CSS parsers are lenient by design (the same way browsers are) — if a declaration is malformed, it may simply be dropped rather than raising an error. Double-check your braces and colons are balanced.",
  },
];

export const jsFormatterFaq: FaqItem[] = [
  {
    question: "Does minifying rename my variables?",
    answer:
      "Yes — minify mode mangles (shortens) local variable and function names in addition to removing whitespace and comments, which is standard practice for production JavaScript and produces meaningfully smaller output than whitespace removal alone.",
  },
  {
    question: "Will minifying change how my code behaves?",
    answer:
      "It shouldn't — the minifier only renames local identifiers and removes dead code/whitespace, both of which preserve behavior. Global names, string contents, and public API surfaces are left untouched.",
  },
  {
    question: "Why does it say my code has a syntax error?",
    answer:
      "The minifier parses your JavaScript into an AST before transforming it, so any syntax error (a missing bracket, an invalid token) is caught and reported with a description, rather than silently producing broken output.",
  },
  {
    question: "Is my code sent anywhere?",
    answer: "No — both minifying and beautifying run entirely in your browser. Nothing you paste is uploaded.",
  },
];

export const markdownPreviewerFaq: FaqItem[] = [
  {
    question: "Does this support GitHub-flavored Markdown?",
    answer:
      "Yes — tables, task lists (- [ ]/- [x]), strikethrough (~~text~~), and fenced code blocks all render correctly, in addition to standard Markdown syntax.",
  },
  {
    question: "Is the rendered output safe from malicious Markdown?",
    answer:
      "Yes — the generated HTML is passed through DOMPurify, a widely used sanitization library, before being displayed, which strips scripts and other dangerous markup even if your Markdown contains raw HTML.",
  },
  {
    question: "What's the difference between the two copy buttons?",
    answer:
      "\"Copy Markdown\" copies your raw source text as-is. \"Copy HTML\" copies the sanitized HTML generated from it — useful when pasting into a CMS or email client that expects HTML rather than Markdown.",
  },
  {
    question: "Can I see the generated HTML instead of the preview?",
    answer: "Yes — switch the right-hand pane to \"HTML source\" to see exactly what markup your Markdown produces.",
  },
  {
    question: "Is my Markdown sent anywhere?",
    answer: "No — parsing and rendering both happen entirely in your browser. Nothing you type is uploaded.",
  },
];

export const cronParserFaq: FaqItem[] = [
  {
    question: "What format does the cron expression use?",
    answer:
      "The classic 5-field format: minute, hour, day of month, month, day of week (e.g. 0 9 * * 1-5 means 9:00 AM every weekday). Nicknames like @daily, @hourly, and @weekly are also supported.",
  },
  {
    question: "What timezone are the next-run times shown in?",
    answer:
      "Your browser's local timezone. There's no server involved, so times are computed relative to your own device's clock and timezone setting — keep that in mind if the schedule will actually run on a server in a different timezone.",
  },
  {
    question: "Why does it say my expression is invalid?",
    answer:
      "A cron expression needs exactly 5 fields (or a valid @nickname). Check for a missing field, an out-of-range value (e.g. hour 25), or a typo in a weekday/month name.",
  },
  {
    question: "What do the special characters mean?",
    answer:
      "* matches any value, , separates a list (1,15), - defines a range (1-5), and / defines a step (*/15 means every 15 units). These can be combined within a single field.",
  },
  {
    question: "Is my cron expression sent anywhere?",
    answer: "No — parsing, describing, and computing next-run times all happen entirely in your browser.",
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
