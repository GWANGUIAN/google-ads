import { useEffect, useState } from "react";
import { computeAllHashes, type HashResult } from "@/lib/hash/hash";
import CopyButton from "./shared/CopyButton";

export default function HashGenerator() {
  const [input, setInput] = useState("hexnook");
  const [results, setResults] = useState<HashResult[]>([]);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (input === "") {
      setResults([]);
      return;
    }
    let cancelled = false;
    const id = setTimeout(() => {
      setPending(true);
      computeAllHashes(input).then((hashes) => {
        if (!cancelled) {
          setResults(hashes);
          setPending(false);
        }
      });
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [input]);

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">Input</p>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        spellCheck={false}
        placeholder="Type or paste text to hash…"
        className="h-28 w-full resize-y rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm text-neutral-200 focus:border-accent-500 focus:outline-none"
      />

      <div className="mt-4 space-y-2">
        {results.length === 0 && (
          <p className="rounded-card border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-600">
            Hashes will appear here…
          </p>
        )}
        {results.map((r) => (
          <div
            key={r.algo}
            className={`flex items-center gap-3 rounded-card border border-neutral-800 bg-neutral-900 p-3 transition-opacity ${pending ? "opacity-50" : ""}`}
          >
            <span className="w-20 shrink-0 font-mono text-xs font-bold text-accent-400">{r.algo}</span>
            <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-neutral-300 sm:text-sm">
              {r.value}
            </code>
            <CopyButton getText={() => r.value} label="Copy" />
          </div>
        ))}
      </div>
    </div>
  );
}
