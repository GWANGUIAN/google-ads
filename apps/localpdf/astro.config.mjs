import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Static-only site — no adapter. Astro's default `dist/` output is deployed
// directly to Cloudflare Pages via `wrangler pages deploy`. See docs/NEW_SITE_PLAYBOOK.md.
export default defineConfig({
  // Mounted under loomfile.com/pdf as the first tool on the umbrella domain —
  // see docs/NEW_SITE_PLAYBOOK.md §11. `base` makes Astro's own router and
  // sitemap prefix every generated route with /pdf; hand-written internal
  // links use the withBase() helper (src/lib/url.ts) to do the same.
  site: "https://loomfile.com",
  base: "/pdf",
  output: "static",
  server: {
    port: Number(process.env.PORT) || 4322,
  },
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    // pdfjs-dist ships an ESM worker file referenced via `new URL(...,
    // import.meta.url)` in src/lib/pdf/pdfjsClient.ts. esbuild's dependency
    // pre-bundler has been reported to corrupt that worker URL resolution in
    // both dev and build, so pdfjs-dist is excluded from pre-bundling.
    optimizeDeps: { exclude: ["pdfjs-dist"] },
  },
});
