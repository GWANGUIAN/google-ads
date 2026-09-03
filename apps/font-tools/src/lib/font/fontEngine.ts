import { Buffer } from "buffer";
import { createFont, woff2 } from "fonteditor-core";
// Relative import, not the "@/" alias: this file is also built standalone as
// a Worker entry point (via `new URL(..., import.meta.url)` in
// fontEngineClient.ts), and that separate Vite/Rollup sub-build doesn't pick
// up the tsconfig-driven "@/" alias the main app build resolves. Every other
// engine file in this repo (mediaEngine.ts, pdfEngine.ts) sidesteps this by
// only using "@/" for type-only imports, which get erased before bundling —
// this file needs FORMATS at runtime, so it goes relative instead.
import { FORMATS } from "../../data/formats";
import { UnsupportedFontError, type ConvertPayload, type EngineResult } from "./types";

// fonteditor-core is written primarily for Node and references the global
// `Buffer` internally; the browser (main thread and this file's Worker
// context alike) has no such global, so install one before any of its
// functions run. See fonteditor-core's ESM_USAGE.md.
if (typeof globalThis.Buffer === "undefined") {
  (globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
}

// fonteditor-core's woff2.init() picks how to load woff2.wasm by checking
// `typeof window !== 'undefined'` (see node_modules/fonteditor-core/woff2/index.js).
// That's true on the main thread but false inside a dedicated Worker (Workers
// have `self`, not `window`), so without this it silently falls into the
// library's Node.js branch instead, which resolves a *relative* "./woff2.wasm"
// against the worker script's own location — 404ing instead of using the
// wasmUrl this app passes to woff2.init(). Alias `window` to `self` so the
// library's browser branch (and our locateFile override) is used in both
// contexts. Confirmed by testing: without this, the wasm fetch 404s and
// WebAssembly.instantiate() fails on the resulting HTML error page.
if (typeof (globalThis as { window?: unknown }).window === "undefined") {
  (globalThis as unknown as { window: typeof globalThis }).window = globalThis;
}

/**
 * Wraps fonteditor-core's createFont()/font.write() — it parses ttf/otf/woff/
 * woff2 and can write back out to ttf/woff/woff2 (OTF is read-only: CFF
 * outlines are converted to TTF glyf outlines internally on read, so this app
 * never offers OTF as a conversion target — see data/formats.ts). WOFF2
 * read/write goes through a separate WASM codec that must be initialized
 * once with the path to woff2.wasm (copied into public/ from
 * node_modules/fonteditor-core/woff2/ — see fonteditor-core's ESM_USAGE.md).
 * Pure function — no DOM/worker-specific code — so this file works
 * unmodified on the main thread or inside fontEngine.worker.ts.
 */

let woff2Init: Promise<unknown> | null = null;

function ensureWoff2(wasmUrl: string): Promise<unknown> {
  if (!woff2Init) {
    woff2Init = woff2.init(wasmUrl);
  }
  return woff2Init;
}

export async function convertFont({ file, source, target }: ConvertPayload, wasmUrl: string): Promise<EngineResult> {
  if (source === "woff2" || target === "woff2") {
    await ensureWoff2(wasmUrl);
  }

  const buffer = await file.arrayBuffer();

  let font;
  try {
    font = createFont(buffer, { type: source });
  } catch {
    throw new UnsupportedFontError(`"${file.name}" couldn't be read as a valid ${FORMATS[source].label} file.`);
  }

  // fonteditor-core's write() return type is `ArrayBuffer | Buffer | string`
  // (string only for the "svg" target, which this app never requests).
  let written: ArrayBuffer | Uint8Array;
  try {
    written = font.write({ type: target }) as ArrayBuffer | Uint8Array;
  } catch {
    throw new UnsupportedFontError(
      `"${file.name}" couldn't be converted to ${FORMATS[target].label} — it may use a font feature this tool doesn't support.`,
    );
  }

  // Normalize to a plain, exactly-sized ArrayBuffer: a Node Buffer (from
  // fonteditor-core's Buffer polyfill) is a Uint8Array view that may sit on a
  // larger, pooled underlying ArrayBuffer — slice by byteOffset/byteLength so
  // we transfer exactly (and only) this result across the worker boundary.
  // (Uint8Array#buffer is typed as ArrayBufferLike = ArrayBuffer |
  // SharedArrayBuffer, but it's always a plain ArrayBuffer here — this is our
  // own `buffer` polyfill's Uint8Array-backed Buffer, never a worker-shared one.)
  const out: ArrayBuffer = written instanceof ArrayBuffer ? written : (written.slice().buffer as ArrayBuffer);

  return { buffer: out, mimeType: FORMATS[target].mimeType, extension: target };
}
