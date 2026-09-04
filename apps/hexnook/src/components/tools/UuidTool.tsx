import { useEffect, useState } from "react";
import { formatUuid, generateUuidV4 } from "@/lib/uuid/uuid";
import CopyButton from "./shared/CopyButton";

export default function UuidTool() {
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [stripHyphens, setStripHyphens] = useState(false);
  // Starts empty (deterministic for the static-prerendered HTML) rather than
  // calling crypto.randomUUID() in the initial state — random values would
  // differ between the build-time prerender and the client hydration pass
  // and React would throw a hydration mismatch. The first batch is generated
  // client-side only, after mount.
  const [uuids, setUuids] = useState<string[]>([]);

  function regenerate() {
    setUuids(Array.from({ length: count }, () => generateUuidV4()));
  }

  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatted = uuids.map((u) => formatUuid(u, { uppercase, stripHyphens }));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs font-medium text-neutral-400">
          Count
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
            className="w-16 rounded-control border border-neutral-800 bg-neutral-900 px-2 py-1 text-sm text-neutral-200 focus:border-accent-500 focus:outline-none"
          />
        </label>

        <label className="flex items-center gap-2 text-xs font-medium text-neutral-400">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="h-3.5 w-3.5 accent-[var(--color-accent-500)]"
          />
          Uppercase
        </label>

        <label className="flex items-center gap-2 text-xs font-medium text-neutral-400">
          <input
            type="checkbox"
            checked={stripHyphens}
            onChange={(e) => setStripHyphens(e.target.checked)}
            className="h-3.5 w-3.5 accent-[var(--color-accent-500)]"
          />
          Strip hyphens
        </label>

        <button
          type="button"
          onClick={regenerate}
          className="ml-auto rounded-control bg-accent-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-500"
        >
          Generate
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{formatted.length} UUIDs</p>
        <CopyButton getText={() => formatted.join("\n")} label="Copy all" />
      </div>

      <div className="mt-2 space-y-2">
        {formatted.length === 0 && (
          <p className="rounded-card border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-600">
            UUIDs will appear here…
          </p>
        )}
        {formatted.map((uuid, i) => (
          <div key={`${uuid}-${i}`} className="flex items-center gap-3 rounded-card border border-neutral-800 bg-neutral-900 p-3">
            <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-neutral-200">{uuid}</code>
            <CopyButton getText={() => uuid} />
          </div>
        ))}
      </div>
    </div>
  );
}
