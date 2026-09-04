import { useMemo, useState } from "react";
import { computeLineDiff, computeWordDiff, diffStats, type DiffPart } from "@/lib/diff/diff";
import CopyButton from "./shared/CopyButton";

type Mode = "line" | "word";

const SAMPLE_A = "The quick brown fox\njumps over the lazy dog.";
const SAMPLE_B = "The quick brown fox\nleaps over the lazy dog!";

export default function DiffTool() {
  const [original, setOriginal] = useState(SAMPLE_A);
  const [changed, setChanged] = useState(SAMPLE_B);
  const [mode, setMode] = useState<Mode>("line");

  const parts = useMemo<DiffPart[]>(
    () => (mode === "line" ? computeLineDiff(original, changed) : computeWordDiff(original, changed)),
    [original, changed, mode],
  );
  const stats = useMemo(() => diffStats(parts), [parts]);

  function swap() {
    setOriginal(changed);
    setChanged(original);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-control border border-neutral-700 bg-neutral-900 p-1">
          {(["line", "word"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-[calc(var(--radius-control)-4px)] px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                mode === m ? "bg-accent-600 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <button type="button" onClick={swap} className="text-xs font-semibold text-neutral-400 hover:text-white">
          ⇅ Swap
        </button>

        <p className="ml-auto text-xs text-neutral-500">
          <span className="text-emerald-400">+{stats.added}</span> / <span className="text-red-400">-{stats.removed}</span> chars
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">Original</p>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            spellCheck={false}
            className="h-48 w-full resize-y rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm text-neutral-200 focus:border-accent-500 focus:outline-none"
          />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">Changed</p>
          <textarea
            value={changed}
            onChange={(e) => setChanged(e.target.value)}
            spellCheck={false}
            className="h-48 w-full resize-y rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm text-neutral-200 focus:border-accent-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Diff</p>
          <CopyButton getText={() => parts.map((p) => p.value).join("")} label="Copy result" />
        </div>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm leading-relaxed">
          {parts.map((part, i) => (
            <span
              key={i}
              className={
                part.type === "added"
                  ? "bg-emerald-950/50 text-emerald-300"
                  : part.type === "removed"
                    ? "bg-red-950/50 text-red-300 line-through decoration-red-500/60"
                    : "text-neutral-300"
              }
            >
              {part.value}
            </span>
          ))}
        </pre>
      </div>
    </div>
  );
}
