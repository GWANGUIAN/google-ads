#!/usr/bin/env node
// Regenerates <merged-dist>/sitemap-index.xml as a single index aggregating
// loomfile's own sitemap plus every mounted tool's sitemap. Tool sitemaps are
// discovered automatically by scanning merged-dist/*/sitemap-index.xml — a
// new tool needs no sitemap-specific step beyond its usual build+merge-dist
// copy in deploy-loomfile.yml. Run after the merge step, before deploy.
// See docs/NEW_SITE_PLAYBOOK.md §11.
//
// A sitemap index file may only list actual sitemap (urlset) files, not other
// sitemap index files (https://www.sitemaps.org/protocol.html) — each tool's
// own sitemap-index.xml is itself an index (that's what @astrojs/sitemap
// always emits), so we read the <loc> entries *out of* each one rather than
// linking to the index files directly.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const mergedDist = process.argv[2];
if (!mergedDist) {
  console.error("Usage: node generate-sitemap-index.mjs <merged-dist-dir>");
  process.exit(1);
}

function extractLocs(xmlPath) {
  const xml = readFileSync(xmlPath, "utf-8");
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
}

const rootSitemapIndex = join(mergedDist, "sitemap-index.xml");
if (!existsSync(rootSitemapIndex)) {
  console.error(`Expected ${rootSitemapIndex} — did loomfile's own build run before this script?`);
  process.exit(1);
}

const locs = extractLocs(rootSitemapIndex);

for (const entry of readdirSync(mergedDist, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const childIndex = join(mergedDist, entry.name, "sitemap-index.xml");
  if (existsSync(childIndex)) {
    locs.push(...extractLocs(childIndex));
  }
}

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
  locs.map((loc) => `<sitemap><loc>${loc}</loc></sitemap>`).join("") +
  "</sitemapindex>";

writeFileSync(rootSitemapIndex, xml);
console.log(`Wrote ${rootSitemapIndex} aggregating ${locs.length} sitemap(s):`);
for (const loc of locs) console.log(`  - ${loc}`);
