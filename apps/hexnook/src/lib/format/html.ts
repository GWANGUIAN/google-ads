// See css.ts for why this is a default import + destructure rather than a
// named import (js-beautify's CJS shape breaks under Node's ESM loader).
import jsBeautify from "js-beautify";
import type { FormatResult } from "./types";

const { html_beautify } = jsBeautify;

// A hand-rolled minifier rather than html-minifier-terser: that package
// transitively pulls in clean-css (for its optional embedded-CSS-minify
// path) which references Node's `process` global at module-load time and
// throws in the browser even with minifyCSS/minifyJS disabled - it's simply
// not safe to import client-side. This tool only ever does structural
// whitespace/comment minification anyway, so a small regex-based pass
// covers it without the broken dependency.
const PRESERVE_TAGS = ["pre", "textarea", "script", "style"];
const PRESERVE_RE = new RegExp(`<(${PRESERVE_TAGS.join("|")})(\\s[^>]*)?>[\\s\\S]*?<\\/\\1\\s*>`, "gi");

// Placeholders are delimited with a Unicode private-use codepoint built at
// runtime via String.fromCharCode (rather than a literal character or regex
// escape in the source, which trips eslint's no-control-regex rule) instead
// of plain spaces, so a placeholder can never become ambiguous once the
// whitespace-collapsing passes below merge adjacent runs together.
const SENTINEL = String.fromCharCode(0xe000);
const PLACEHOLDER_RE = new RegExp(`${SENTINEL}(\\d+)${SENTINEL}`, "g");

function minifySync(code: string): string {
  const placeholders: string[] = [];
  let out = code.replace(PRESERVE_RE, (match) => {
    placeholders.push(match);
    return `${SENTINEL}${placeholders.length - 1}${SENTINEL}`;
  });

  out = out.replace(/<!--(?!\[if)[\s\S]*?-->/g, ""); // strip comments (keep IE conditional comments)
  out = out.replace(/>\s+</g, "><"); // collapse whitespace between tags
  out = out.replace(/[ \t\n\r\f]+/g, " ").trim(); // collapse remaining whitespace runs

  return out.replace(PLACEHOLDER_RE, (_m, i) => placeholders[Number(i)]);
}

export function minify(code: string): Promise<FormatResult> {
  try {
    return Promise.resolve({ ok: true, value: minifySync(code) });
  } catch (error) {
    return Promise.resolve({ ok: false, error: error instanceof Error ? error.message : "Could not minify this HTML." });
  }
}

export function beautify(code: string): Promise<FormatResult> {
  try {
    return Promise.resolve({ ok: true, value: html_beautify(code, { indent_size: 2, wrap_line_length: 0 }) });
  } catch (error) {
    return Promise.resolve({ ok: false, error: error instanceof Error ? error.message : "Could not format this HTML." });
  }
}
