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
];
