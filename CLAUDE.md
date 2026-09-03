# google-ads monorepo

This repo hosts multiple independent, Google-AdSense-monetized static websites (pnpm workspaces + Turborepo). Every site must be 100% static/client-side — no backend, no server adapters, deployed to Cloudflare Pages via GitHub Actions.

Before doing any work in this repo — adding a site, editing a shared package, touching deployment config, or writing SEO/ad-related code — read [docs/NEW_SITE_PLAYBOOK.md](docs/NEW_SITE_PLAYBOOK.md). It documents every cross-site convention already decided (monorepo layout, design tokens, SEO checklist, AdSense ad-slot pattern, trust-page requirements, responsive baseline, deployment pattern) so they don't get re-derived or accidentally reversed.

@docs/NEW_SITE_PLAYBOOK.md
