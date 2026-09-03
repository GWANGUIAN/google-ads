export type OrganizerMode = "delete" | "reorder" | "rotate";

export interface OrganizerTool {
  mode: OrganizerMode;
  slug: string;
  title: string;
  actionLabel: string;
  description: string;
}

/** One shared page-thumbnail-grid widget (components/pdf/PageOrganizer.tsx)
 * serves all three of these — the `mode` only changes which controls are
 * emphasized in the copy/UI, not the underlying logic. Each still gets its
 * own keyword-targeted landing page, mirroring img-convertor's
 * dynamic-route-per-keyword pattern. */
export const ORGANIZER_TOOLS: OrganizerTool[] = [
  {
    mode: "delete",
    slug: "delete-pdf-pages",
    title: "Delete PDF Pages",
    actionLabel: "Delete pages",
    description: "Remove unwanted pages from a PDF — click any page to delete it, then save.",
  },
  {
    mode: "reorder",
    slug: "reorder-pdf-pages",
    title: "Reorder PDF Pages",
    actionLabel: "Reorder pages",
    description: "Drag pages into a new order, or use the move buttons, then save.",
  },
  {
    mode: "rotate",
    slug: "rotate-pdf-pages",
    title: "Rotate PDF Pages",
    actionLabel: "Rotate pages",
    description: "Rotate individual pages 90° at a time to fix sideways or upside-down scans.",
  },
];

export function getOrganizerToolBySlug(slug: string): OrganizerTool | undefined {
  return ORGANIZER_TOOLS.find((t) => t.slug === slug);
}
