// js-beautify's CJS export shape isn't statically analyzable by Node's ESM
// loader (which runs during Astro's server-side build of this client island),
// so a named import works in the browser bundle but fails under `astro build`
// — import the default and destructure instead.
import jsBeautify from "js-beautify";
import { minify as cssoMinify } from "csso";
import type { FormatResult } from "./types";

const { css_beautify } = jsBeautify;

export function minify(code: string): Promise<FormatResult> {
  try {
    const { css } = cssoMinify(code);
    return Promise.resolve({ ok: true, value: css });
  } catch (error) {
    return Promise.resolve({ ok: false, error: error instanceof Error ? error.message : "Could not minify this CSS." });
  }
}

export function beautify(code: string): Promise<FormatResult> {
  try {
    return Promise.resolve({ ok: true, value: css_beautify(code, { indent_size: 2 }) });
  } catch (error) {
    return Promise.resolve({ ok: false, error: error instanceof Error ? error.message : "Could not format this CSS." });
  }
}
