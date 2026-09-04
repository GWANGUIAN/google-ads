import { useEffect, useState } from "react";
import { formatJson, minifyJson } from "@/lib/json/format";
import { highlightJson } from "@/lib/json/highlight";
import CopyButton from "./shared/CopyButton";

const SAMPLE = `{"id":1,"name":"Ada Lovelace","active":true,"tags":["math","computing"],"address":{"city":"London","zip":null}}`;

type Mode = "format" | "minify";

export default function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE);
  const [mode, setMode] = useState<Mode>("format");
  const [indent, setIndent] = useState(2);
  const [result, setResult] = useState<{ ok: true; value: string } | { ok: false; error: string } | null>(null);

  useEffect(() => {
    if (input.trim() === "") {
      setResult(null);
      return;
    }
    const id = setTimeout(() => {
      setResult(mode === "format" ? formatJson(input, indent) : minifyJson(input));
    }, 150);
    return () => clearTimeout(id);
  }, [input, mode, indent]);

  const outputHtml = result?.ok ? highlightJson(result.value) : "";

  function download() {
    if (!result?.ok) return;
    const blob = new Blob([result.value], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-control border border-neutral-700 bg-neutral-900 p-1">
          {(["format", "minify"] as Mode[]).map((m) => (
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

        {mode === "format" && (
          <label className="flex items-center gap-2 text-xs font-medium text-neutral-400">
            Indent
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="rounded-control border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-200 focus:border-accent-500 focus:outline-none"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={8}>Tab (8)</option>
            </select>
          </label>
        )}

        <button
          type="button"
          onClick={() => setInput(SAMPLE)}
          className="ml-auto text-xs font-semibold text-neutral-400 hover:text-white"
        >
          Load sample
        </button>
        <button type="button" onClick={() => setInput("")} className="text-xs font-semibold text-neutral-400 hover:text-white">
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
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste JSON here…"
            className="h-72 w-full resize-y rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm text-neutral-200 focus:border-accent-500 focus:outline-none"
          />
        </div>
        <div>
          <div className="mb-1.5 flex min-h-8 items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Output</p>
            <CopyButton getText={() => (result?.ok ? result.value : "")} disabled={!result?.ok} />
          </div>
          {result && !result.ok ? (
            <div className="h-72 overflow-auto rounded-card border border-red-900/60 bg-red-950/30 p-4 font-mono text-sm text-red-300">
              {result.error}
            </div>
          ) : (
            <pre className="h-72 overflow-auto rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm">
              <code dangerouslySetInnerHTML={{ __html: outputHtml || "<span class=\"text-neutral-600\">Output will appear here…</span>" }} />
            </pre>
          )}
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={download}
          disabled={!result?.ok}
          className="text-xs font-semibold text-accent-400 hover:text-accent-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Download .json
        </button>
      </div>
    </div>
  );
}
