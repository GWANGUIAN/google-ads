import { OPERATION_LIST, type OperationCode } from "./operations";
import { FORMAT_LIST, type ContainerCode } from "./formats";

export interface OperationPage {
  operation: OperationCode;
  format: ContainerCode;
  slug: string;
}

/** Cross product of operations × formats — the v1 operation matrix is small
 * (2 operations × 2 containers = 4 pages) since compress/trim aren't a
 * symmetric from→to matrix the way image format conversion is. See
 * docs/NEW_SITE_PLAYBOOK.md §4 and img-convertor's data/pairs.ts for the
 * pattern this mirrors. */
export const OPERATION_PAGES: OperationPage[] = OPERATION_LIST.flatMap((op) =>
  FORMAT_LIST.map((format) => ({
    operation: op.code,
    format: format.code,
    slug: `${op.code}-${format.code}`,
  })),
);

export function getOperationPageBySlug(slug: string): OperationPage | undefined {
  return OPERATION_PAGES.find((p) => p.slug === slug);
}
