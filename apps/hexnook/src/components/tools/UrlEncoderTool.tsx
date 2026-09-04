import { useEffect, useState } from "react";
import { looksEncoded, transformUrl, type UrlAction, type UrlMode } from "@/lib/url/encode";
import CopyButton from "./shared/CopyButton";

const SAMPLE = "https://example.com/search?q=hello world&tags=react,astro&ref=hexnook.dev";

export default function UrlEncoderTool() {
  const [input, setInput] = useState(SAMPLE);
  const [mode, setMode] = useState<UrlMode>("component");
  const [action, setAction] = useState<UrlAction>("encode");
  const [batch, setBatch] = useState(false);
  const [autoTouched, setAutoTouched] = useState(false);
  const [result, setResult] = useState<{ ok: true; value: string } | { ok: false; error: string } | null>(null);

  useEffect(() => {
    if (input.trim() === "") {
      setResult(null);
      return;
    }
    const id = setTimeout(() => {
      setResult(transformUrl(input, mode, action, batch));
    }, 150);
    return () => clearTimeout(id);
  }, [input, mode, action, batch]);

  function handleInput(value: string) {
    setInput(value);
    if (!autoTouched) setAction(looksEncoded(value) ? "decode" : "encode");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-control border border-neutral-700 bg-neutral-900 p-1">
          {(["encode", "decode"] as UrlAction[]).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setAction(a);
                setAutoTouched(true);
              }}
              className={`rounded-[calc(var(--radius-control)-4px)] px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                action === a ? "bg-accent-600 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-neutral-400">
          Mode
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as UrlMode)}
            className="rounded-control border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-200 focus:border-accent-500 focus:outline-none"
          >
            <option value="component">Component (escapes & = ? /)</option>
            <option value="full">Full URI (preserves & = ? /)</option>
          </select>
        </label>

        <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
          <input
            type="checkbox"
            checked={batch}
            onChange={(e) => setBatch(e.target.checked)}
            className="h-3.5 w-3.5 accent-[var(--color-accent-500)]"
          />
          Batch (one per line)
        </label>

        <button
          type="button"
          onClick={() => {
            setInput(SAMPLE);
            setAutoTouched(false);
            setAction("encode");
          }}
          className="ml-auto text-xs font-semibold text-neutral-400 hover:text-white"
        >
          Load sample
        </button>
        <button
          type="button"
          onClick={() => {
            setInput("");
            setAutoTouched(false);
          }}
          className="text-xs font-semibold text-neutral-400 hover:text-white"
        >
          Clear
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-1.5 flex min-h-8 items-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Input</p>
          </div>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste a URL or text here…"
            className="h-56 w-full resize-y rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm text-neutral-200 focus:border-accent-500 focus:outline-none"
          />
        </div>
        <div>
          <div className="mb-1.5 flex min-h-8 items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Output</p>
            <CopyButton getText={() => (result?.ok ? result.value : "")} disabled={!result?.ok} />
          </div>
          {result && !result.ok ? (
            <div className="h-56 overflow-auto rounded-card border border-red-900/60 bg-red-950/30 p-4 font-mono text-sm text-red-300">
              {result.error}
            </div>
          ) : (
            <pre className="h-56 overflow-auto whitespace-pre-wrap break-all rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm text-emerald-300">
              {result?.ok && result.value ? result.value : <span className="text-neutral-600">Output will appear here…</span>}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
