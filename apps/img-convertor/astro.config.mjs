import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Static-only site — no adapter. Astro's default `dist/` output is deployed
// directly to Cloudflare Pages via `wrangler pages deploy`. See docs/NEW_SITE_PLAYBOOK.md.
//
// This app is built twice per commit by two independent pipelines: standalone
// (deploy-img-convertor.yml, defaults below apply — no env vars set) and
// mounted at loomfile.com/image (deploy-loomfile.yml, which sets
// PUBLIC_SITE_URL and PUBLIC_BASE_PATH). Hand-written hrefs and canonical/
// JSON-LD URLs go through the withBase() helper (src/lib/url.ts) so both
// builds resolve correctly. See docs/NEW_SITE_PLAYBOOK.md §11.
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "https://imgconvertor.download",
  base: process.env.PUBLIC_BASE_PATH || "/",
  output: "static",
  server: {
    port: Number(process.env.PORT) || 4321,
  },
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
