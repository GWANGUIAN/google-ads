import { useEffect, useState } from "react";
import { testRegex, type RegexResult } from "@/lib/regex/highlight";

const FLAGS = [
  { flag: "g", label: "g — global" },
  { flag: "i", label: "i — ignore case" },
  { flag: "m", label: "m — multiline" },
  { flag: "s", label: "s — dot all" },
  { flag: "u", label: "u — unicode" },
  { flag: "y", label: "y — sticky" },
];

export default function RegexTester() {
  const [pattern, setPattern] = useState("(\\w+)@(\\w+\\.\\w+)");
  const [flags, setFlags] = useState("gi");
  const [testString, setTestString] = useState("Contact: ada@example.com or grace@hexnook.dev for support.");
  const [result, setResult] = useState<RegexResult | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setResult(testRegex(pattern, flags, testString)), 150);
    return () => clearTimeout(id);
  }, [pattern, flags, testString]);

  function toggleFlag(flag: string) {
    setFlags((prev) => (prev.includes(flag) ? prev.replace(flag, "") : prev + flag));
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">Pattern</p>
      <div className="flex items-center rounded-card border border-neutral-800 bg-neutral-900 px-4 py-3 font-mono text-sm">
        <span className="text-neutral-600">/</span>
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          spellCheck={false}
          placeholder="pattern"
          className="flex-1 bg-transparent px-1 text-accent-300 focus:outline-none"
        />
        <span className="text-neutral-600">/{flags}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {FLAGS.map(({ flag, label }) => (
          <label key={flag} className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
            <input
              type="checkbox"
              checked={flags.includes(flag)}
              onChange={() => toggleFlag(flag)}
              className="h-3.5 w-3.5 accent-[var(--color-accent-500)]"
            />
            {label}
          </label>
        ))}
      </div>

      <p className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">Test string</p>
      <textarea
        value={testString}
        onChange={(e) => setTestString(e.target.value)}
        spellCheck={false}
        className="h-28 w-full resize-y rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm text-neutral-200 focus:border-accent-500 focus:outline-none"
      />

      <p className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {result?.ok ? `${result.matches.length} match${result.matches.length === 1 ? "" : "es"}` : "Result"}
      </p>

      {result && !result.ok ? (
        <div className="rounded-card border border-red-900/60 bg-red-950/30 p-4 font-mono text-sm text-red-300">
          {result.error}
        </div>
      ) : (
        <div className="whitespace-pre-wrap break-words rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm leading-relaxed text-neutral-300">
          {result?.segments.map((seg, i) =>
            seg.matched ? (
              <mark key={i} className="rounded bg-accent-600/30 text-accent-200">
                {seg.text}
              </mark>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </div>
      )}

      {result?.ok && result.matches.length > 0 && (
        <div className="mt-4 space-y-2">
          {result.matches.map((m, i) => (
            <div key={i} className="rounded-card border border-neutral-800 bg-neutral-900 p-3 font-mono text-xs">
              <span className="text-neutral-500">#{i} @{m.index}</span>{" "}
              <span className="text-accent-300">{m.match}</span>
              {m.groups.length > 0 && (
                <span className="text-neutral-500"> — groups: [{m.groups.map((g) => `"${g}"`).join(", ")}]</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
