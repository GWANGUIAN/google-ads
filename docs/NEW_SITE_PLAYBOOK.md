# New Site Playbook

This monorepo hosts multiple independent, Google-AdSense-monetized static websites. `apps/img-convertor` is site #1 and is the reference implementation for every convention below. Read this whole file before adding a new site or modifying shared packages — it documents decisions already made so they don't need to be re-derived (or accidentally reversed) in a future session.

## 1. The static-only constraint

Every site in this repo must be **100% static and client-side**. No backend, no API routes, no server-side rendering, no database. This isn't a preference — it's what makes hosting free/near-free on Cloudflare Pages and keeps operating cost at zero regardless of traffic.

Consequences:
- Astro projects use `output: 'static'` and **no server adapter of any kind**. Do not add `@astrojs/cloudflare`, `@astrojs/node`, etc. Astro's default static build already produces a plain `dist/` folder that Cloudflare Pages serves natively.
- Any feature that seems to need a backend (contact forms, user accounts, image uploads to a server) must instead use a client-only alternative: `mailto:` links, third-party static-friendly form embeds, or — for image processing — the browser's own APIs (Canvas, Web Workers). Do not stand up serverless functions "just this once."
- If a genuine server-side need ever arises, treat that as a decision requiring the user's explicit sign-off, not a default engineering choice.

## 2. Monorepo layout & scaffolding a new site

```
apps/<site-name>/       # one Astro project per site
packages/ui/             # shared Button/Card/Container/Accordion primitives
packages/seo/             # SeoHead.astro, JsonLd.astro, schema.ts helpers
packages/config/          # tsconfig.base.json, tailwind-tokens.css, eslint.base.mjs
docs/                     # this file
.github/workflows/        # one deploy-<site-name>.yml per app
```

Tooling: **pnpm workspaces + Turborepo**. `turbo.json` uses the v2 `tasks` key (not the legacy `pipeline` key).

To add a new site:
1. `mkdir apps/<site-name>` and scaffold an Astro project inside it (React integration only if the site needs an interactive island; sitemap integration always).
2. Depend on `@repo/ui`, `@repo/seo`, `@repo/config` via `"workspace:*"` in its `package.json`.
3. Import `@repo/config/tailwind-tokens.css` into the site's `global.css` before `@theme` overrides (see §4).
4. Copy `.github/workflows/deploy-img-convertor.yml` to `deploy-<site-name>.yml`, adjust the `paths:` filter to `apps/<site-name>/**` and the `--project-name` to `<site-name>`.
5. Create a matching Cloudflare Pages project (see §8).
6. Do **not** pre-create a shared `packages/converter-core`-style package for whatever the new site's core logic is. Keep it inside the app until a *second* site actually needs the same logic — then extract it. Don't pre-abstract.

## 3. Design tokens & UI primitives

- Styling is **Tailwind CSS v4** using its CSS-first config (`@import "tailwindcss";` + `@theme { ... }` blocks — no `tailwind.config.js` preset object, no `@astrojs/tailwind` integration package). Add `@tailwindcss/vite` to the Astro `vite.plugins` array instead.
- `packages/config/tailwind-tokens.css` defines the shared neutral/trust color scale, a default accent scale, font family, radii, and container width as `@theme` tokens. Every new site imports this file first in its own `global.css`, then may redeclare `--color-accent-*` variables in a local `@theme` block to rebrand without touching the shared file.
- `packages/ui` holds framework-light primitives (`Button.astro`, `Card.astro`, `Container.astro`, `Accordion.tsx`) built against those tokens. Reuse these before writing new one-off components with hand-rolled Tailwind classes.

## 4. SEO checklist (apply to every page of every site)

- Wrap every page's `<head>` content with `@repo/seo/SeoHead.astro` (title, description, canonical, OG/Twitter tags).
- Add `@astrojs/sitemap` to the Astro integrations and set `site:` in `astro.config.mjs` to the production domain — the sitemap then regenerates automatically as pages are added/removed, with zero manual maintenance.
- Ship a `public/robots.txt` referencing `/sitemap-index.xml`.
- Emit JSON-LD via `@repo/seo/JsonLd.astro` + the helper builders in `@repo/seo/schema.ts`: `Organization` + `WebSite` once per site (in the base layout), plus page-appropriate schema (`SoftwareApplication`, `FAQPage`, `BreadcrumbList`, etc.) on content pages. **Always generate JSON-LD from the exact same data structure used to render the visible content** (e.g. the FAQ accordion's items array) rather than hand-duplicating copy into a separate schema block — divergence between visible and structured content is a real SEO/spam-signal risk.
- For any page type that can be generated from a data matrix (format pairs, city × service, etc.), do this with a single dynamic route + `getStaticPaths()` reading a typed data module — not hand-authored Markdown/content-collection entries, and not one `.astro` file per page.
- **Avoid thin/duplicate content on generated pages.** Assemble each page's copy from multiple independent, attribute-driven templates (an intro paragraph, a "why this matters" paragraph chosen by conditionals on the specific data, a facts table, an auto-generated FAQ) so that two generated pages never read as interchangeable mail-merge output. See `apps/img-convertor/src/data/copy.ts` and `faqTemplates.ts` for the reference pattern.
- Only hydrate interactive islands with `client:idle` or `client:visible`; never `client:load` for anything below the fold. Astro ships zero JS by default — keep it that way outside the interactive widget itself.

## 5. AdSense ad-slot pattern

AdSense approval requires real content depth and it requires that ad units not appear broken/empty before approval. The pattern used here handles both:

- Env vars (all `PUBLIC_*`, so Astro exposes them client-side): `PUBLIC_ADS_ENABLED`, `PUBLIC_ADSENSE_CLIENT_ID`, and one `PUBLIC_AD_SLOT_<POSITION>` per placement.
- An `AdSlot.astro` component (see `apps/img-convertor/src/components/ads/AdSlot.astro`) takes a `position` prop and renders **absolutely nothing** — no wrapper `<div>`, no reserved height — unless `PUBLIC_ADS_ENABLED === 'true'` AND that position's slot id AND the client id are all set. This guarantees zero layout shift and zero ad markup pre-approval.
- The AdSense loader `<script src="...adsbygoogle.js">` is only injected into `<head>` when ads are enabled — so no third-party network request happens before approval either.
- Turning ads on for a live site is purely a Cloudflare Pages environment-variable change + redeploy. No code change, no redesign.
- Placement convention: one slot in the header, one in the footer (base layout), one in-content slot on content-heavy pages, positioned away from any interactive control (never inside/adjacent to a dropzone, form, or other clickable UI) to avoid AdSense's accidental-click policy violations.

## 6. Trust/content pages required for AdSense approval

Every site needs, at minimum: **About**, **Privacy Policy**, **Terms of Service**, **Contact**. The Privacy Policy must accurately state what is and isn't collected (if the site is client-side-only with no uploads, say so — it's a genuine, honest trust signal) plus a Google-ads cookie disclosure clause once ads are enabled. Contact should be a plain `mailto:` link unless the site already has a legitimate non-backend way to receive messages — do not build server infrastructure just for a contact form.

Aim for enough total indexable pages (~20+) that the site doesn't read as thin before submitting for AdSense review.

## 7. Responsive design baseline

- Mobile-first Tailwind utility classes; container max-width comes from the shared `--container-content` token via `packages/ui/Container.astro`.
- Test every new page at the `mobile` (375×812) preset in the Browser tool before calling a feature done — check nav collapse, dropzone/form usability, and that no element causes horizontal scroll.
- Primary nav collapses to a minimal set on small screens (`hidden sm:flex` pattern in `Header.astro`) rather than a hamburger menu for v1 sites with few nav items — revisit only if a site's nav grows beyond ~4-5 links.

## 8. Deployment: Cloudflare Pages + GitHub Actions

- **No Astro adapter** — deploy the static `dist/` directly.
- One Cloudflare Pages project per site, created once via `wrangler pages project create <site-name>` (or the dashboard). Leave the Pages project's own build system unconfigured/blank — CI builds the app and ships the finished `dist/` via `wrangler pages deploy`, which is simpler and faster than asking Cloudflare to run a Turborepo build inside a monorepo subfolder.
- Each site has its own `.github/workflows/deploy-<site-name>.yml`, triggered on push to `main`, filtered by `paths:` to that app's folder plus `packages/**` and the lockfile (so an unrelated site's change never triggers this site's deploy, but a shared-package change redeploys every dependent site — that coupling is intentional). Build step: `pnpm turbo run build --filter=<site-name>...` (Turborepo builds only that app and its package deps, with caching). Deploy step: `cloudflare/wrangler-action@v4` running `pages deploy <app>/dist --project-name=<site-name>`.
- Repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are shared across every site's workflow (Cloudflare Pages:Edit scope only).
- Env vars per site (ad slot ids, `PUBLIC_SITE_URL`, etc.) are set in that site's Cloudflare Pages project dashboard, not committed — `.env.example` in each app documents what's expected.

## 9. Drag-and-drop / client-side file processing pattern (if a future site needs it)

Reference implementation: `apps/img-convertor/src/lib/convert/` + `src/components/converter/`.

- A `Dropzone` component handles drag/drop and click-to-browse, both routed through the same `onFiles(File[])` callback.
- Heavy per-file work (in img-convertor's case: image decode/encode) runs inside a small pool of Web Workers (`workerPool.ts`, concurrency capped at `min(navigator.hardwareConcurrency, 4)`) so large batches never freeze the UI thread.
- Per-file UI state (`queued` / `converting` / `done` / `error`) is tracked in a flat array in the orchestrating React island, with each row rendering its own progress/result/download control.
- Batch "download all" bundles results client-side with **fflate** (chosen over JSZip/client-zip for size and worker-friendliness) rather than any server-side zip step.
- Always feature-detect browser capability for anything inconsistent across browsers (e.g. HEIC decode, AVIF encode) and degrade to a clear inline error message — never let an unsupported operation throw an unhandled/opaque failure into the UI.

## 10. Current sites

| Site | App path | Domain (planned) | Status |
|---|---|---|---|
| ImgConvertor | `apps/img-convertor` | imgconvertor.com (verify availability before purchase) | Built, not yet deployed/domain-connected |
