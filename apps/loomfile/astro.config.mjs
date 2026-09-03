import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// The umbrella-domain root — landing page + domain-level trust pages
// (about/privacy/terms/contact) + robots.txt/ads.txt. Individual tools
// (starting with localpdf) mount under their own path (e.g. /pdf) and are
// merged into this app's build output at deploy time, not built by Astro
// itself — see .github/workflows/deploy-loomfile.yml and
// docs/NEW_SITE_PLAYBOOK.md §11. No adapter: static output only.
export default defineConfig({
  site: "https://loomfile.com",
  output: "static",
  server: {
    port: Number(process.env.PORT) || 4323,
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
