import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Static-only site — no adapter. Astro's default `dist/` output is deployed
// directly to Cloudflare Pages via `wrangler pages deploy`. See docs/NEW_SITE_PLAYBOOK.md.
export default defineConfig({
  // Mounted under loomfile.com/resize — see docs/NEW_SITE_PLAYBOOK.md §11.
  // `base` makes Astro's own router and sitemap prefix every generated route
  // with /resize; hand-written internal links use the withBase() helper
  // (@repo/file-tools-core/url.ts) to do the same.
  site: "https://loomfile.com",
  base: "/resize",
  output: "static",
  server: {
    port: Number(process.env.PORT) || 4327,
  },
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
