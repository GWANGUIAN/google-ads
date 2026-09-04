# New Site Playbook

This monorepo hosts multiple independent, Google-AdSense-monetized static websites. `apps/img-convertor` is site #1 and is the reference implementation for every convention below. Read this whole file before adding a new site or modifying shared packages — it documents decisions already made so they don't need to be re-derived (or accidentally reversed) in a future session.

## 1. The static-only constraint

Every site in this repo must be **100% static and client-side**. No backend, no API routes, no server-side rendering, no database. This isn't a preference — it's what makes hosting free/near-free on Cloudflare Pages and keeps operating cost at zero regardless of traffic.

Consequences:
- Astro projects use `output: 'static'` and **no server adapter of any kind**. Do not add `@astrojs/cloudflare`, `@astrojs/node`, etc. Astro's default static build already produces a plain `dist/` folder that Cloudflare Pages serves natively.
- Any feature that seems to need a backend (contact forms, user accounts, image uploads to a server) must instead use a client-only alternative: `mailto:` links, third-party static-friendly form embeds, or — for image processing — the browser's own APIs (Canvas, Web Workers). Do not stand up serverless functions "just this once."
- If a genuine server-side need ever arises, treat that as a decision requiring the user's explicit sign-off, not a default engineering choice.
- **Never add a `functions/` directory or a `_worker.js`** to any site's build output unless that decision has been explicitly signed off on. Their presence is what makes Cloudflare route a request through the Workers runtime — and that's what counts against the Workers free plan's daily request quota. With neither present (the current state of every site here — verify via `find apps/<site>/dist -name "_worker.js" -o -name functions`), Cloudflare Pages serves every request as a plain static asset straight from the edge, which has no request-count cap on the free plan and never touches the Workers quota at all. This is a direct, mechanical consequence of the static-only constraint above, not a separate setting to remember.

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
- Add `@astrojs/sitemap` to the Astro integrations and set `site:` in `astro.config.mjs` to the production domain — the sitemap then regenerates automatically as pages are added/removed, with zero manual maintenance. On the loomfile umbrella domain, every mounted tool's sitemap is additionally consolidated into one root index at build time — see §11.
- Ship a `public/robots.txt` referencing `/sitemap-index.xml`.
- Emit JSON-LD via `@repo/seo/JsonLd.astro` + the helper builders in `@repo/seo/schema.ts`: `Organization` + `WebSite` once per site (in the base layout), plus page-appropriate schema (`SoftwareApplication`, `FAQPage`, `BreadcrumbList`, etc.) on content pages. **Always generate JSON-LD from the exact same data structure used to render the visible content** (e.g. the FAQ accordion's items array) rather than hand-duplicating copy into a separate schema block — divergence between visible and structured content is a real SEO/spam-signal risk.
- For any page type that can be generated from a data matrix (format pairs, city × service, etc.), do this with a single dynamic route + `getStaticPaths()` reading a typed data module — not hand-authored Markdown/content-collection entries, and not one `.astro` file per page.
- **Avoid thin/duplicate content on generated pages.** Assemble each page's copy from multiple independent, attribute-driven templates (an intro paragraph, a "why this matters" paragraph chosen by conditionals on the specific data, a facts table, an auto-generated FAQ) so that two generated pages never read as interchangeable mail-merge output. See `apps/img-convertor/src/data/copy.ts` and `faqTemplates.ts` for the reference pattern.
- Only hydrate interactive islands with `client:idle` or `client:visible`; never `client:load` for anything below the fold. Astro ships zero JS by default — keep it that way outside the interactive widget itself.
- **Search-engine ownership verification**: Google Search Console does **not** need an in-page meta tag here — domain-level DNS verification through Cloudflare already covers it, since Cloudflare is the DNS host for every site's domain in this repo. **Naver Search Advisor and Bing Webmaster Tools are different: they require either an HTML meta tag or an uploaded HTML file**, and don't support Cloudflare's DNS verification method. Use the meta tag route (`data/site.ts`'s `SITE_VERIFICATION.naver`/`SITE_VERIFICATION.bing`, rendered by `BaseLayout.astro` as `naver-site-verification`/`msvalidate.01` meta tags, sourced from the `PUBLIC_NAVER_SITE_VERIFICATION`/`PUBLIC_BING_SITE_VERIFICATION` build-time vars — same non-secret repo-Variable pattern as the AdSense vars in §8). `PUBLIC_GOOGLE_SITE_VERIFICATION` exists in the same struct for the rare case a future site can't use DNS verification, but isn't needed by default — don't bother setting it unless Google specifically asks for the meta-tag method.

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
- **`BaseLayout.astro`'s `<body>` must be a sticky-footer flex column**, not a bare `min-h-screen`: `<body class="flex min-h-screen flex-col ...">` with `<main class="flex-1">` wrapping the page slot. Without this, `min-h-screen` alone only guarantees the *body* is tall enough — it does nothing to push `<Footer />` down, so any page whose content is shorter than the viewport (a short trust page, a guide article, a nearly-empty state) renders with the footer floating in the middle of the screen instead of pinned to the bottom. This has already shipped broken in more than one site here (check any app before assuming it's fine) — always verify by opening a short/low-content page (not the landing page, which is usually tall enough to hide the bug) at both desktop and the 375×812 mobile preset.

## 8. Deployment: Cloudflare Pages + GitHub Actions

- **No Astro adapter** — deploy the static `dist/` directly.
- One Cloudflare Pages project per site, created once via `wrangler pages project create <site-name>` (or the dashboard). Leave the Pages project's own build system unconfigured/blank — CI builds the app and ships the finished `dist/` via `wrangler pages deploy`, which is simpler and faster than asking Cloudflare to run a Turborepo build inside a monorepo subfolder.
- Each site has its own `.github/workflows/deploy-<site-name>.yml`, triggered on push to `main`, filtered by `paths:` to that app's folder plus `packages/**` and the lockfile (so an unrelated site's change never triggers this site's deploy, but a shared-package change redeploys every dependent site — that coupling is intentional). Build step: `pnpm turbo run build --filter=<site-name>...` (Turborepo builds only that app and its package deps, with caching). Deploy step: `cloudflare/wrangler-action@v4` running `pages deploy <app>/dist --project-name=<site-name>`.
- Repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are shared across every site's workflow (Cloudflare Pages:Edit scope only).
- **Env vars are set as GitHub Actions repo/environment Variables, not in the Cloudflare Pages dashboard.** Astro bakes `PUBLIC_*` vars into the static build at *build time*, and since this repo builds in CI and ships a finished `dist/` via `wrangler pages deploy` (the Cloudflare Pages project's own build system is never invoked), setting them in the Cloudflare dashboard would have no effect. Instead, each deploy workflow's build step passes them through explicitly via `env: PUBLIC_X: ${{ vars.PUBLIC_X }}` (see `deploy-img-convertor.yml`). These values (ad slot ids, publisher id, site URL) are not secrets — once ads are on they're plainly visible in the page's HTML — so they belong in GitHub **Variables**, not **Secrets**.
- **Domain-specific Variables go in a per-domain GitHub *Environment*, not a repo-level Variable — this matters as soon as a second site's workflow exists.** A repo-level Variable (`gh variable set NAME --body ...`) is one value shared by *every* workflow in the repo; the moment two sites' workflows both read `vars.PUBLIC_SITE_URL` (or `PUBLIC_ADS_ENABLED`, or a search-engine verification code) expecting different values, one of them silently gets the other's value. Each domain has its own GitHub Environment (`img-convertor`, `loomfile`, named for the deploy target — an umbrella domain's environment covers every tool mounted on it, since they share one `PUBLIC_SITE_URL`/ads status), declared in its workflow via `environment: <name>` on the job, holding that domain's `PUBLIC_SITE_URL`, `PUBLIC_ADS_ENABLED`, `PUBLIC_GOOGLE_SITE_VERIFICATION`, `PUBLIC_NAVER_SITE_VERIFICATION` (and, if per-site ad revenue reporting matters later, its own `PUBLIC_AD_SLOT_*`). Environment Variables of a given name automatically take precedence over a repo-level Variable of the same name, so `PUBLIC_ADSENSE_CLIENT_ID` — the one value that's genuinely account-wide, not domain-specific — stays at the repo level and every environment inherits it without redeclaring it. Set one with `gh variable set PUBLIC_ADS_ENABLED --env <environment> --body true` (the environment must exist first: `gh api --method PUT repos/<owner>/<repo>/environments/<name>`). New site → new environment, every time.
- `.env.example` in each app documents what's expected for local dev — it doesn't distinguish repo- vs environment-level, since that split only exists in CI.

## 9. Drag-and-drop / client-side file processing pattern (if a future site needs it)

Reference implementation: `apps/img-convertor/src/lib/convert/` + `src/components/converter/`.

- A `Dropzone` component handles drag/drop and click-to-browse, both routed through the same `onFiles(File[])` callback.
- Heavy per-file work (in img-convertor's case: image decode/encode) runs inside a small pool of Web Workers (`workerPool.ts`, concurrency capped at `min(navigator.hardwareConcurrency, 4)`) so large batches never freeze the UI thread.
- Per-file UI state (`queued` / `converting` / `done` / `error`) is tracked in a flat array in the orchestrating React island, with each row rendering its own progress/result/download control.
- Batch "download all" bundles results client-side with **fflate** (chosen over JSZip/client-zip for size and worker-friendliness) rather than any server-side zip step.
- Always feature-detect browser capability for anything inconsistent across browsers (e.g. HEIC decode, AVIF encode) and degrade to a clear inline error message — never let an unsupported operation throw an unhandled/opaque failure into the UI.

## 10. Current sites

| Site | App path | Domain | Status |
|---|---|---|---|
| ImgConvertor | `apps/img-convertor` | imgconvertor.download **and** loomfile.com/image-convertor | Dual-deployed (see §11) — both targets live |
| LoomFile (umbrella root) | `apps/loomfile` | loomfile.com | Deployed — domain purchased 2026-09-04 |
| — PDF Tools | `apps/localpdf` | loomfile.com/pdf | Deployed |
| — Video Tools | `apps/video-tools` | loomfile.com/video | Deployed (compress + trim, MP4/WebM via WebCodecs/mediabunny) |
| — Font Tools | `apps/font-tools` | loomfile.com/font | Deployed (TTF/OTF/WOFF/WOFF2 conversion via fonteditor-core/WASM) |

## 11. Multi-tool umbrella domain strategy (decided 2026-09-04)

New sites beyond ImgConvertor are **not** getting their own dedicated domain each. Instead they're consolidated under **loomfile.com**, one path per tool (e.g. `/pdf`, later `/video`).

**Why:** a brand-new domain starts with zero backlinks/domain authority, so every new site otherwise has to rebuild search trust from scratch (typically 6–12 months before it ranks meaningfully). Consolidating under one domain lets each new tool inherit the authority the domain already accumulated from earlier tools — this is the proven pattern behind the sites that already dominate this exact "run file tools in the browser" niche (TinyWow, 10015.io, the iLovePDF/iLoveIMG family): one domain, dozens of unrelated tools, none of them competing against each other for authority. It also means AdSense site review happens once per domain instead of once per site.

**img-convertor is dual-deployed, not migrated:** it keeps its existing dedicated domain (imgconvertor.download, already deployed, not worth unwinding) **and** is additionally built a second time and mounted at loomfile.com/image-convertor, so it inherits the umbrella domain's authority too. See the "dual-target app" bullet below for how the same app builds twice with different config depending on which pipeline runs it. If a future tool ever needs to stay domain-only with no umbrella mount, cross-link it from the landing page instead (see the `external: true` bullet below) rather than merging it into the build.

**Domain name:** loomfile.com — a distinctive, coined/non-descriptive brand rather than a keyword-matched one. The obvious descriptive names in this niche are already taken by direct competitors with near-identical positioning (`filesmith.io`, `toolbrew.co`/`.dev`, `offlinefileconverter.com`, `conventools.com`, `browserbasedtools.com`, `convertprivately.com`, `uploadless.app`, `this-2-that.com`, the open-source "Vert" project) — a coined name is both more likely to be available and safer trademark-wise.

**`apps/loomfile` is the umbrella root** — landing page + domain-level trust pages (About/Privacy/Terms/Contact) + `robots.txt`/`ads.txt`, scaffolded the same way as every other site per §2. It owns the `SITE`/`ADS`/`SITE_VERIFICATION` data shape from `src/data/site.ts` plus a `TOOLS` list the landing page and footer render from — add each new tool to that list as it's built.

**`apps/localpdf` is the first tool**, mounted at `/pdf` (`base: "/pdf"` in `astro.config.mjs`) rather than its own domain — this superseded the app's original one-app-per-domain setup. Astro's `base` automatically prefixes routes it generates itself (page routing, the sitemap), but hand-written `href`s and the canonical-URL computation in the layouts don't get that for free — `apps/localpdf/src/lib/url.ts` exports a `withBase()` helper used everywhere an internal link or canonical URL is built by hand. Any *new* tool added under this domain needs the same treatment: set `base` in its `astro.config.mjs`, and route every internal `href`/canonical through an equivalent `withBase()`.

**Deploy architecture:** hosting several Astro apps under one Cloudflare Pages project without introducing a Cloudflare Worker (which would violate §1's static-only/Workers-quota constraint) works by merging static output, not by routing requests:
- each tool app builds normally with its own `base` path
- `.github/workflows/deploy-loomfile.yml` builds `loomfile` (root) and every tool app with one `turbo run build`, then copies each tool's `dist/` into `merged-dist/<path>/` (`apps/localpdf/dist/*` → `merged-dist/pdf/*`) and `apps/loomfile/dist/*` into `merged-dist/` itself, then runs `apps/loomfile/scripts/generate-sitemap-index.mjs` to consolidate every tool's sitemap into one root index (see the sitemap bullet below), then ships `merged-dist/` with a single `wrangler pages deploy --project-name=loomfile`
- adding a new tool to this domain means: add its app under `apps/`, add it to `apps/loomfile/src/data/site.ts`'s `TOOLS` list, add a `cp -r apps/<tool>/dist/. merged-dist/<path>/` line + a `--filter=<tool>...` to the build step + a `paths:` entry, all in `deploy-loomfile.yml`. Nothing else needs updating for sitemaps/`robots.txt` — see below.
- this replaces the "one Cloudflare Pages project + one workflow per site" pattern in §8 **for umbrella-domain sites only**.
- **a dual-target app (built for both its own domain and an umbrella mount — img-convertor is the reference implementation) needs its `astro.config.mjs`'s `site`/`base` to be env-driven instead of hardcoded**: `site: process.env.PUBLIC_SITE_URL || "<own-domain>"`, `base: process.env.PUBLIC_BASE_PATH || "/"`. Its own standalone `deploy-<site>.yml` is untouched (never sets `PUBLIC_BASE_PATH`, so the fallback applies); `deploy-loomfile.yml` gets the usual `--filter=<tool>...` + `merged-dist/<path>/` copy step *plus* a `PUBLIC_BASE_PATH: /<path>` line on its build step's `env:`. Every hand-written internal `href` and canonical/JSON-LD URL in the app must be audited and routed through `withBase()` (see `apps/img-convertor/src/lib/url.ts`) — unlike a single-target tool, these bugs won't surface until someone actually loads the umbrella-mounted build, since the standalone build keeps working either way. Also declare the app's `PUBLIC_*` vars in `turbo.json`'s `build` task `env` array so Turbo cache-keys the two differently-configured builds separately.
- **a tool kept on its own dedicated domain with no umbrella mount at all is cross-linked from the loomfile landing page instead of merged into the build**: add a `TOOLS` entry with `external: true` and an absolute `slug` URL (e.g. `"https://example.com"`) — `Header.astro`, `Footer.astro`, and `index.astro` all read `tool.external` and render those links with `target="_blank" rel="noopener noreferrer"`. It gets **no** `merged-dist/<path>` copy step, `--filter=<tool>...` build addition, or `paths:` entry in `deploy-loomfile.yml`, and its own independent `deploy-<site>.yml` pipeline and `robots.txt` stay untouched — only the `TOOLS` entry changes.
- **whenever the tool roster changes (adding, removing, or reworking a tool), also re-read the landing page's hero paragraph (`apps/loomfile/src/pages/index.astro`) and `SITE.description` in `site.ts`** — both are hand-written prose, not generated from `TOOLS`, so Astro won't flag them when they drift out of date (e.g. copy that still says "starting with PDFs" after other tools were added).

**`robots.txt`/`ads.txt` are domain-root-only files** — only `apps/loomfile/public/{robots.txt,ads.txt}` are reachable once merged (at `loomfile.com/robots.txt`); any copy left in a tool app's own `public/` (e.g. `apps/localpdf/public/robots.txt`) lands at an unreachable path like `loomfile.com/pdf/robots.txt` post-merge and is harmless dead weight, not the authoritative file.

**Sitemaps are consolidated into one root index at build time — no per-tool `robots.txt` edit, ever.** Each tool app still generates its own `sitemap-index.xml`/`sitemap-0.xml` via `@astrojs/sitemap` (correctly scoped to its own `site`/`base`, per the dual-target-app bullet above), but a sitemap index file may only list actual sitemap files, not other sitemap index files (sitemaps.org protocol) — so after the merge step, `apps/loomfile/scripts/generate-sitemap-index.mjs merged-dist` scans `merged-dist/*/sitemap-index.xml` (auto-discovering every mounted tool, whatever its path), pulls each one's `<loc>` entries, and overwrites `merged-dist/sitemap-index.xml` with a single index aggregating loomfile's own sitemap plus every tool's. `apps/loomfile/public/robots.txt` therefore only ever needs the one line `Sitemap: https://loomfile.com/sitemap-index.xml` — adding, removing, or renaming a tool's mount path requires no `robots.txt` or sitemap change at all, only the usual "new tool" steps above. Submit just `https://loomfile.com/sitemap-index.xml` in Google Search Console; it covers every mounted tool automatically as the roster grows.

**Deployment is complete** — DNS, the Cloudflare Pages project, and the `PUBLIC_*` Variables are all set; loomfile.com is live with all four tools. `PUBLIC_ADS_ENABLED` is intentionally kept `false` in the `loomfile`/`img-convertor` GitHub Environments until AdSense site review is actually requested — flip it to `true` (and set the `PUBLIC_AD_SLOT_*` Variables) at that point, not before, so the `adsbygoogle.js` loader doesn't fire with no ad units to show on a brand-new domain.

**Open branding question — not decided, flagged rather than assumed:** `apps/localpdf`'s on-page brand (`SITE.name` = "LocalPDF", header/footer copy, `hello@loomfile.com` contact address already updated) still reads as its own product name distinct from the "LoomFile" umbrella brand shown at the domain root. Keeping a tool-level sub-brand under an umbrella domain is a legitimate pattern (many multi-tool sites do this), but whether LocalPDF should keep its name or become "PDF Tools by LoomFile" is a product decision for the user, not something this restructuring silently decided.
