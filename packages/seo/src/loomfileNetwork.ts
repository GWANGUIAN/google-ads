/** Every tool mounted on loomfile.com, by absolute URL — shared across that
 * app's own build (own-domain link) and every sibling app's footer (so each
 * tool cross-links to the others and to the umbrella root). Distinct from
 * apps/loomfile/src/data/site.ts's `TOOLS`, which drives loomfile's own
 * relative-path navigation within a single Astro build; this list crosses
 * build boundaries, so every entry needs a full absolute URL.
 *
 * `path` is the umbrella mount slug (e.g. "/pdf/"), used to exclude an app's
 * own entry regardless of which domain is currently building it — img-convertor
 * is dual-deployed, so matching on its loomfile.com URL alone would fail to
 * exclude itself when rendered from the imgconvertor.download build. */
export const LOOMFILE_NETWORK = [
  { name: "LoomFile", url: "https://loomfile.com/", path: "/" },
  { name: "PDF Tools", url: "https://loomfile.com/pdf/", path: "/pdf/" },
  { name: "Video Tools", url: "https://loomfile.com/video/", path: "/video/" },
  { name: "Image Convertor", url: "https://loomfile.com/image-convertor/", path: "/image-convertor/" },
  { name: "Font Tools", url: "https://loomfile.com/font/", path: "/font/" },
] as const;

/** The network list minus whichever entry matches `currentPath` (that app's
 * own umbrella mount slug), for rendering a "more free tools" footer block. */
export function siblingLoomfileTools(currentPath: string) {
  return LOOMFILE_NETWORK.filter((tool) => tool.path !== currentPath);
}
