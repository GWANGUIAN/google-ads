import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Static-only site — no adapter. Astro's default `dist/` output is deployed
// directly to Cloudflare Pages via `wrangler pages deploy`. See docs/NEW_SITE_PLAYBOOK.md.
export default defineConfig({
  // Mounted under loomfile.com/font — see docs/NEW_SITE_PLAYBOOK.md §11.
  // `base` makes Astro's own router and sitemap prefix every generated route
  // with /font; hand-written internal links use the withBase() helper
  // (src/lib/url.ts) to do the same.
  site: "https://loomfile.com",
  base: "/font",
  output: "static",
  server: {
    port: Number(process.env.PORT) || 4326,
  },
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    // fonteditor-core references the Node `Buffer` global internally; rather
    // than pull in a full Node-polyfill plugin (vite-plugin-node-polyfills'
    // peer range doesn't cover Vite 6, which Astro 5 ships), src/lib/font/
    // fontEngine.ts installs just the `buffer` package as globalThis.Buffer
    // itself, per fonteditor-core's own ESM_USAGE.md guidance.
    optimizeDeps: { include: ["fonteditor-core", "buffer"] },
    build: { commonjsOptions: { include: [/fonteditor-core/, /node_modules/] } },
  },
});
