/**
 * Lazy wrapper around zxcvbn-ts. Nothing here is imported at module top
 * level anywhere else in the app — it's only pulled in once the user starts
 * typing a password, so the (non-trivial) dictionary weight is excluded
 * from the initial page bundle.
 */
export interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
}

let optionsReady: Promise<void> | null = null;

async function ensureOptions(): Promise<void> {
  if (!optionsReady) {
    optionsReady = (async () => {
      const [{ zxcvbnOptions }, common, en] = await Promise.all([
        import("@zxcvbn-ts/core"),
        import("@zxcvbn-ts/language-common"),
        import("@zxcvbn-ts/language-en"),
      ]);
      zxcvbnOptions.setOptions({
        dictionary: {
          ...common.dictionary,
          ...en.dictionary,
        },
        graphs: common.adjacencyGraphs,
        translations: en.translations,
      });
    })();
  }
  return optionsReady;
}

export async function estimateStrength(password: string): Promise<StrengthResult> {
  if (!password) return { score: 0 };
  await ensureOptions();
  const { zxcvbn } = await import("@zxcvbn-ts/core");
  const result = zxcvbn(password);
  return { score: result.score as StrengthResult["score"] };
}
