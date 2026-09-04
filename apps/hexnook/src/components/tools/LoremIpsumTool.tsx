import { useEffect, useState } from "react";
import { generateLorem, type LoremUnit } from "@/lib/lorem/generate";
import CopyButton from "./shared/CopyButton";

const UNITS: { unit: LoremUnit; label: string }[] = [
  { unit: "paragraphs", label: "Paragraphs" },
  { unit: "sentences", label: "Sentences" },
  { unit: "words", label: "Words" },
  { unit: "items", label: "List items" },
];

const PRESETS: { label: string; unit: LoremUnit; count: number }[] = [
  { label: "Short", unit: "paragraphs", count: 2 },
  { label: "Medium", unit: "paragraphs", count: 5 },
  { label: "Long", unit: "paragraphs", count: 10 },
];

export default function LoremIpsumTool() {
  const [unit, setUnit] = useState<LoremUnit>("paragraphs");
  const [count, setCount] = useState(3);
  const [startClassic, setStartClassic] = useState(true);
  const [htmlWrap, setHtmlWrap] = useState(false);
  const [result, setResult] = useState<{ ok: true; value: string } | { ok: false; error: string } | null>(null);

  useEffect(() => {
    setResult(generateLorem({ unit, count, startClassic, htmlWrap }));
  }, [unit, count, startClassic, htmlWrap]);

  function regenerate() {
    setResult(generateLorem({ unit, count, startClassic, htmlWrap }));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex flex-wrap rounded-control border border-neutral-700 bg-neutral-900 p-1">
          {UNITS.map(({ unit: u, label }) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`rounded-[calc(var(--radius-control)-4px)] px-3 py-1.5 text-xs font-semibold transition-colors ${
                unit === u ? "bg-accent-600 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-neutral-400">
          Count
          <input
            type="number"
            min={1}
            max={500}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-20 rounded-control border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-200 focus:border-accent-500 focus:outline-none"
          />
        </label>

        <button
          type="button"
          onClick={regenerate}
          className="rounded-control border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:border-accent-600 hover:text-white"
        >
          Regenerate
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
          <input
            type="checkbox"
            checked={startClassic}
            onChange={(e) => setStartClassic(e.target.checked)}
            className="h-3.5 w-3.5 accent-[var(--color-accent-500)]"
          />
          Start with "Lorem ipsum dolor sit amet…"
        </label>
        <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
          <input
            type="checkbox"
            checked={htmlWrap}
            onChange={(e) => setHtmlWrap(e.target.checked)}
            className="h-3.5 w-3.5 accent-[var(--color-accent-500)]"
          />
          Wrap in HTML tags (&lt;p&gt;/&lt;li&gt;)
        </label>

        <div className="ml-auto flex items-center gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setUnit(p.unit);
                setCount(p.count);
              }}
              className="rounded-control border border-neutral-700 px-2.5 py-1 text-[11px] font-semibold text-neutral-400 hover:border-accent-600 hover:text-white"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Output</p>
          <CopyButton getText={() => (result?.ok ? result.value : "")} disabled={!result?.ok} />
        </div>
        {result && !result.ok ? (
          <div className="rounded-card border border-red-900/60 bg-red-950/30 p-4 font-mono text-sm text-red-300">{result.error}</div>
        ) : (
          <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm leading-relaxed text-neutral-300">
            {result?.ok ? result.value : ""}
          </pre>
        )}
      </div>
    </div>
  );
}
