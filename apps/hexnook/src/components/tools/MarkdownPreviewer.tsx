import { useEffect, useState } from "react";
import { renderMarkdown } from "@/lib/markdown/render";
import { highlightHtml } from "@/lib/format/highlight";
import CopyButton from "./shared/CopyButton";

const SAMPLE = `# Project README

A short **GFM** sample showing off _tables_, \`code\`, and more.

## Features

- Live split-pane preview
- GitHub-flavored Markdown (tables, task lists, strikethrough)
- Toggle between rendered output and the generated HTML source

## Roadmap

- [x] Split view
- [x] Copy rendered HTML
- [ ] Export to PDF

| Feature | Status |
| --- | --- |
| Tables | ✅ |
| Task lists | ✅ |
| ~~Markdown extensions~~ | Core only |

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

Learn more at [hexnook.dev](https://hexnook.dev).
`;

type ViewMode = "rendered" | "html";

export default function MarkdownPreviewer() {
  const [input, setInput] = useState(SAMPLE);
  const [view, setView] = useState<ViewMode>("rendered");
  const [result, setResult] = useState<{ ok: true; html: string } | { ok: false; error: string } | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setResult(renderMarkdown(input)), 150);
    return () => clearTimeout(id);
  }, [input]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-control border border-neutral-700 bg-neutral-900 p-1">
          {(["rendered", "html"] as ViewMode[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-[calc(var(--radius-control)-4px)] px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                view === v ? "bg-accent-600 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              {v === "html" ? "HTML source" : "Rendered"}
            </button>
          ))}
        </div>

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
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Markdown</p>
            <CopyButton getText={() => input} label="Copy Markdown" disabled={!input} />
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Type or paste Markdown here…"
            className="h-96 w-full resize-y rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm text-neutral-200 focus:border-accent-500 focus:outline-none"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{view === "html" ? "Generated HTML" : "Preview"}</p>
            <CopyButton getText={() => (result?.ok ? result.html : "")} label="Copy HTML" disabled={!result?.ok} />
          </div>
          {result && !result.ok ? (
            <div className="h-96 overflow-auto rounded-card border border-red-900/60 bg-red-950/30 p-4 font-mono text-sm text-red-300">
              {result.error}
            </div>
          ) : view === "html" ? (
            <pre className="h-96 overflow-auto rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm">
              <code dangerouslySetInnerHTML={{ __html: result?.ok ? highlightHtml(result.html) : "" }} />
            </pre>
          ) : (
            <div
              className="prose-guide h-96 overflow-auto rounded-card border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-200"
              dangerouslySetInnerHTML={{ __html: result?.ok ? result.html : "" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
