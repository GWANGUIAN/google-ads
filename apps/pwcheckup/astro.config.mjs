import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Static-only site — no adapter. Astro's default `dist/` output is deployed
// directly to Cloudflare Pages via `wrangler pages deploy`. See docs/NEW_SITE_PLAYBOOK.md.
//
// Standalone domain only (not umbrella-mounted, not dual-target) — `site`
// and `base` are hardcoded, no PUBLIC_SITE_URL/PUBLIC_BASE_PATH env-driven
// logic or withBase() helper needed anywhere in this app.
export default defineConfig({
  site: "https://pwcheckup.com",
  output: "static",
  server: {
    port: Number(process.env.PORT) || 4329,
  },
  i18n: {
    defaultLocale: "ko",
    locales: ["ko", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: "ko",
        locales: { ko: "ko-KR", en: "en-US" },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
