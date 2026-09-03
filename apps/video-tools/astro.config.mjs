import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Static-only site — no adapter. Astro's default `dist/` output is deployed
// directly to Cloudflare Pages via `wrangler pages deploy`. See docs/NEW_SITE_PLAYBOOK.md.
export default defineConfig({
  // Mounted under loomfile.com/video — see docs/NEW_SITE_PLAYBOOK.md §11.
  // `base` makes Astro's own router and sitemap prefix every generated route
  // with /video; hand-written internal links use the withBase() helper
  // (src/lib/url.ts) to do the same.
  site: "https://loomfile.com",
  base: "/video",
  output: "static",
  server: {
    port: Number(process.env.PORT) || 4324,
  },
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
