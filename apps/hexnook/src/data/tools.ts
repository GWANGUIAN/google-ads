/** Registry of every tool on the site — drives the landing grid, header/footer
 *  nav, and each tool page's own metadata, so tool info is never duplicated
 *  across components (mirrors the TOOLS/qrTypes.ts pattern used elsewhere in
 *  this repo). */
export interface ToolInfo {
  slug: string;
  name: string;
  shortLabel: string;
  glyph: string;
  tagline: string;
  description: string;
}

export const TOOLS: ToolInfo[] = [
  {
    slug: "/json",
    name: "JSON Formatter & Validator",
    shortLabel: "JSON Formatter",
    glyph: "{ }",
    tagline: "Format, minify, and validate JSON instantly",
    description:
      "Paste any JSON to pretty-print, minify, or validate it — with inline error locations and syntax highlighting. Nothing you paste ever leaves your browser.",
  },
  {
    slug: "/base64",
    name: "Base64 Encode & Decode",
    shortLabel: "Base64",
    glyph: "64",
    tagline: "Encode or decode text and files as Base64",
    description:
      "Convert text or files to and from Base64, with correct UTF-8 handling and a URL-safe variant toggle — all computed locally in your browser.",
  },
  {
    slug: "/hash",
    name: "Hash Generator",
    shortLabel: "Hash Generator",
    glyph: "#",
    tagline: "Generate MD5, SHA-1, SHA-256, SHA-384 and SHA-512 hashes",
    description:
      "Hash any text with MD5, SHA-1, SHA-256, SHA-384, and SHA-512 at once, computed locally using your browser's own crypto engine.",
  },
  {
    slug: "/regex",
    name: "Regex Tester",
    shortLabel: "Regex Tester",
    glyph: ".*",
    tagline: "Test regular expressions with live match highlighting",
    description:
      "Write a regular expression and see every match highlighted live against your test string, with a full capture-group breakdown.",
  },
  {
    slug: "/jwt",
    name: "JWT Decoder",
    shortLabel: "JWT Decoder",
    glyph: "JWT",
    tagline: "Decode and verify JSON Web Tokens",
    description:
      "Decode a JWT's header and payload into readable JSON, with human-readable claim dates and optional client-side HMAC signature verification.",
  },
  {
    slug: "/color",
    name: "Color Converter & Contrast Checker",
    shortLabel: "Color Tool",
    glyph: "HEX",
    tagline: "Convert HEX, RGB, and HSL — check WCAG contrast",
    description:
      "Convert colors between HEX, RGB, and HSL instantly, and check WCAG contrast ratios for accessible text — all computed locally in your browser.",
  },
  {
    slug: "/uuid",
    name: "UUID / GUID Generator",
    shortLabel: "UUID Generator",
    glyph: "v4",
    tagline: "Generate RFC 4122 v4 UUIDs instantly",
    description:
      "Generate cryptographically random v4 UUIDs one at a time or in bulk, with uppercase and no-hyphen formatting options — nothing leaves your browser.",
  },
  {
    slug: "/password",
    name: "Password Generator",
    shortLabel: "Password Generator",
    glyph: "•••",
    tagline: "Generate strong, random passwords",
    description:
      "Generate strong random passwords with customizable length and character sets, using your browser's cryptographically secure random number generator.",
  },
  {
    slug: "/timestamp",
    name: "Unix Timestamp Converter",
    shortLabel: "Timestamp Converter",
    glyph: "UNIX",
    tagline: "Convert Unix time to and from human-readable dates",
    description:
      "Convert Unix timestamps to and from human-readable dates, with live current-time display, timezone toggle, and ISO 8601/RFC 2822 output.",
  },
  {
    slug: "/diff",
    name: "Text Diff Checker",
    shortLabel: "Diff Checker",
    glyph: "Δ",
    tagline: "Compare two blocks of text line by line",
    description:
      "Compare two blocks of text line-by-line or word-by-word, with additions and deletions highlighted — computed entirely in your browser.",
  },
];
