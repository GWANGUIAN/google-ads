import { useEffect, useRef, useState } from "react";
import type { FormatResult } from "@/lib/format/types";
import CopyButton from "./shared/CopyButton";

type Mode = "minify" | "beautify";

interface Props {
  sample: string;
  minify: (code: string) => Promise<FormatResult>;
  beautify: (code: string) => Promise<FormatResult>;
  highlight: (code: string) => string;
  fileExtension: string;
  mimeType: string;
}

function byteSize(text: string): number {
  return new TextEncoder().encode(text).length;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function CodeFormatterCore({ sample, minify, beautify, highlight, fileExtension, mimeType }: Props) {
  const [input, setInput] = useState(sample);
  const [mode, setMode] = useState<Mode>("minify");
  const [result, setResult] = useState<FormatResult | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (input.trim() === "") {
      setResult(null);
      return;
    }
    const id = setTimeout(() => {
      const thisRequest = ++requestId.current;
      const run = mode === "minify" ? minify(input) : beautify(input);
      run.then((r) => {
        if (requestId.current === thisRequest) setResult(r);
      });
    }, 150);
    return () => clearTimeout(id);
  }, [input, mode, minify, beautify]);

  const outputHtml = result?.ok ? highlight(result.value) : "";
  const inputBytes = byteSize(input);
  const outputBytes = result?.ok ? byteSize(result.value) : 0;
  const savedPct = mode === "minify" && result?.ok && inputBytes > 0 ? Math.max(0, Math.round((1 - outputBytes / inputBytes) * 100)) : null;

  function download() {
    if (!result?.ok) return;
    const blob = new Blob([result.value], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${mode === "minify" ? "minified" : "formatted"}.${fileExtension}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-control border border-neutral-700 bg-neutral-900 p-1">
          {(["minify", "beautify"] as Mode[]).map((m) => (
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

        {savedPct !== null && (
          <p className="font-mono text-xs text-neutral-400">
            {formatBytes(inputBytes)} <span className="text-neutral-600">→</span> {formatBytes(outputBytes)}{" "}
            <span className="font-semibold text-accent-400">· {savedPct}% smaller</span>
          </p>
        )}

        <button type="button" onClick={() => setInput(sample)} className="ml-auto text-xs font-semibold text-neutral-400 hover:text-white">
          Load sample
        </button>
        <button type="button" onClick={() => setInput("")} className="text-xs font-semibold text-neutral-400 hover:text-white">
          Clear
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">Input</p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste code here…"
            className="h-80 w-full resize-y rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm text-neutral-200 focus:border-accent-500 focus:outline-none"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Output</p>
            <CopyButton getText={() => (result?.ok ? result.value : "")} disabled={!result?.ok} />
          </div>
          {result && !result.ok ? (
            <div className="h-80 overflow-auto rounded-card border border-red-900/60 bg-red-950/30 p-4 font-mono text-sm text-red-300">
              {result.error}
            </div>
          ) : (
            <pre className="h-80 overflow-auto rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm">
              <code
                dangerouslySetInnerHTML={{ __html: outputHtml || '<span class="text-neutral-600">Output will appear here…</span>' }}
              />
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
          Download .{fileExtension}
        </button>
      </div>
    </div>
  );
}
