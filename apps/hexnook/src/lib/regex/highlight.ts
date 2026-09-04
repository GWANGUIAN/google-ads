export interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
}

export interface RegexSegment {
  text: string;
  matched: boolean;
}

export type RegexResult =
  | { ok: true; matches: RegexMatch[]; segments: RegexSegment[] }
  | { ok: false; error: string };

export function testRegex(pattern: string, flags: string, testString: string): RegexResult {
  if (pattern === "") return { ok: true, matches: [], segments: [{ text: testString, matched: false }] };

  let re: RegExp;
  try {
    const globalFlags = flags.includes("g") ? flags : `${flags}g`;
    re = new RegExp(pattern, globalFlags);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Invalid regular expression." };
  }

  const matches: RegexMatch[] = [];
  const segments: RegexSegment[] = [];
  let lastIndex = 0;

  try {
    for (const m of testString.matchAll(re)) {
      const start = m.index ?? 0;
      if (start > lastIndex) segments.push({ text: testString.slice(lastIndex, start), matched: false });
      segments.push({ text: m[0], matched: true });
      lastIndex = start + m[0].length;
      matches.push({ match: m[0], index: start, groups: m.slice(1).map((g) => g ?? "") });
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Invalid regular expression." };
  }

  if (lastIndex < testString.length) segments.push({ text: testString.slice(lastIndex), matched: false });
  return { ok: true, matches, segments };
}
