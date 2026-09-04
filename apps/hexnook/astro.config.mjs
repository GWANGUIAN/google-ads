import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Static-only site — no adapter. Astro's default `dist/` output is deployed
// directly to Cloudflare Pages via `wrangler pages deploy`. See docs/NEW_SITE_PLAYBOOK.md.
//
// Standalone domain only (not umbrella-mounted, not dual-target) — `site` is
// hardcoded, no PUBLIC_SITE_URL/PUBLIC_BASE_PATH env-driven logic or
// withBase() helper needed anywhere in this app.
export default defineConfig({
  site: "https://hexnook.dev",
  output: "static",
  server: {
    port: Number(process.env.PORT) || 4330,
  },
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
