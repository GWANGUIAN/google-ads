/**
 * Astro's `base` config only prefixes routes/links it generates itself
 * (page routing, the sitemap). Hand-written hrefs and the canonical-URL
 * computation in the layouts bypass that, so they go through this helper
 * instead. See astro.config.mjs and docs/NEW_SITE_PLAYBOOK.md §11.
 */
// Astro does NOT guarantee a trailing slash on BASE_URL (it's exactly what
// `base` is set to in astro.config.mjs) — normalize both sides here instead
// of relying on that, otherwise paths glue together as "/imageabout".
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");

export function withBase(path: string): string {
  const clean = path.replace(/^\/+/, "");
  return clean ? `${BASE}/${clean}` : `${BASE}/`;
}
