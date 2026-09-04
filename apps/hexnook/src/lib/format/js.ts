// See css.ts for why this is a default import + destructure rather than a
// named import (js-beautify's CJS shape breaks under Node's ESM loader).
import jsBeautify from "js-beautify";
import { minify_sync } from "terser";
import type { FormatResult } from "./types";

const { js_beautify } = jsBeautify;

export function minify(code: string): Promise<FormatResult> {
  try {
    const result = minify_sync(code, { mangle: true, compress: true });
    if (!result.code) return Promise.resolve({ ok: false, error: "Could not minify this JavaScript." });
    return Promise.resolve({ ok: true, value: result.code });
  } catch (error) {
    return Promise.resolve({ ok: false, error: error instanceof Error ? error.message : "Could not minify this JavaScript." });
  }
}

export function beautify(code: string): Promise<FormatResult> {
  try {
    return Promise.resolve({ ok: true, value: js_beautify(code, { indent_size: 2 }) });
  } catch (error) {
    return Promise.resolve({ ok: false, error: error instanceof Error ? error.message : "Could not format this JavaScript." });
  }
}
