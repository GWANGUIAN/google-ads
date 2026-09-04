import { marked } from "marked";
import DOMPurify from "dompurify";

export type MarkdownResult = { ok: true; html: string } | { ok: false; error: string };

/** Renders Markdown to sanitized HTML. Must only ever be called client-side
 *  (from a useEffect, never during Astro's server-rendered initial paint) —
 *  DOMPurify requires a real `window` to sanitize against, which the static
 *  build's Node environment doesn't have. This is the one tool on the site
 *  that renders user input as live HTML rather than escaping it first, so
 *  sanitizing is a hard requirement, not a nice-to-have. */
export function renderMarkdown(input: string): MarkdownResult {
  try {
    const raw = marked.parse(input, { async: false, gfm: true, breaks: false });
    if (typeof raw !== "string") return { ok: false, error: "Could not render this Markdown." };
    const clean = DOMPurify.sanitize(raw);
    return { ok: true, html: clean };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not render this Markdown." };
  }
}
