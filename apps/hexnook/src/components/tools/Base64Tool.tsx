import { useEffect, useState, type DragEvent } from "react";
import { decodeBase64, encodeBase64, fileToBase64DataUri } from "@/lib/base64/base64";
import CopyButton from "./shared/CopyButton";

type Mode = "encode" | "decode";

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [input, setInput] = useState("Hello, hexnook! 👋");
  const [result, setResult] = useState<{ ok: true; value: string } | { ok: false; error: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (input.trim() === "") {
      setResult(null);
      return;
    }
    const id = setTimeout(() => {
      setResult(mode === "encode" ? encodeBase64(input, urlSafe) : decodeBase64(input, urlSafe));
    }, 150);
    return () => clearTimeout(id);
  }, [input, mode, urlSafe]);

  async function handleFile(file: File) {
    setFileName(file.name);
    const dataUri = await fileToBase64DataUri(file);
    const [, b64] = dataUri.split(",");
    setMode("encode");
    setResult({ ok: true, value: urlSafe ? b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : b64 });
    setInput(`(file: ${file.name})`);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-control border border-neutral-700 bg-neutral-900 p-1">
          {(["encode", "decode"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setFileName(null);
              }}
              className={`rounded-[calc(var(--radius-control)-4px)] px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                mode === m ? "bg-accent-600 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-neutral-400">
          <input
            type="checkbox"
            checked={urlSafe}
            onChange={(e) => setUrlSafe(e.target.checked)}
            className="h-3.5 w-3.5 accent-[var(--color-accent-500)]"
          />
          URL-safe (- _)
        </label>

        <button
          type="button"
          onClick={() => {
            setInput("");
            setFileName(null);
          }}
          className="ml-auto text-xs font-semibold text-neutral-400 hover:text-white"
        >
          Clear
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-1.5 flex min-h-8 items-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {mode === "encode" ? "Text (or drop a file)" : "Base64"}
            </p>
          </div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`relative rounded-card border ${dragOver ? "border-accent-500 bg-accent-950/10" : "border-neutral-800 bg-neutral-900"}`}
          >
            <textarea
              value={input}
              onChange={(e) => {
                setFileName(null);
                setInput(e.target.value);
              }}
              spellCheck={false}
              placeholder={mode === "encode" ? "Type text, or drag a file in…" : "Paste Base64 here…"}
              className="h-56 w-full resize-y bg-transparent p-4 font-mono text-sm text-neutral-200 focus:outline-none"
            />
            {fileName && <p className="border-t border-neutral-800 px-4 py-2 text-xs text-neutral-500">📎 {fileName}</p>}
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex min-h-8 items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Result</p>
            <CopyButton getText={() => (result?.ok ? result.value : "")} disabled={!result?.ok} />
          </div>
          {result && !result.ok ? (
            <div className="h-56 overflow-auto rounded-card border border-red-900/60 bg-red-950/30 p-4 font-mono text-sm text-red-300">
              {result.error}
            </div>
          ) : (
            <textarea
              readOnly
              value={result?.ok ? result.value : ""}
              placeholder="Result will appear here…"
              className="h-56 w-full resize-y rounded-card border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm text-neutral-200 focus:outline-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}
