import { diffLines, diffWords, type Change } from "diff";

export type DiffPart = { type: "added" | "removed" | "unchanged"; value: string };

function normalize(changes: Change[]): DiffPart[] {
  return changes.map((change) => ({
    type: change.added ? "added" : change.removed ? "removed" : "unchanged",
    value: change.value,
  }));
}

export function computeLineDiff(a: string, b: string): DiffPart[] {
  return normalize(diffLines(a, b));
}

export function computeWordDiff(a: string, b: string): DiffPart[] {
  return normalize(diffWords(a, b));
}

/** Character-count stats — mode-agnostic (works the same for line or word
 *  diffs) rather than a "lines changed" count that only makes sense in line mode. */
export function diffStats(parts: DiffPart[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const part of parts) {
    if (part.type === "added") added += part.value.length;
    if (part.type === "removed") removed += part.value.length;
  }
  return { added, removed };
}
