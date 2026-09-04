import { useEffect, useState } from "react";
import { parseCron, splitFields, type CronResult } from "@/lib/cron/parse";
import { CRON_PRESETS } from "@/lib/cron/presets";
import CopyButton from "./shared/CopyButton";

const FIELD_COLORS = ["text-emerald-300", "text-sky-300", "text-amber-300", "text-accent-400", "text-fuchsia-300"];

export default function CronParserTool() {
  const [expression, setExpression] = useState("0 9 * * 1-5");
  const [result, setResult] = useState<CronResult | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setResult(parseCron(expression, 10)), 150);
    return () => clearTimeout(id);
  }, [expression]);

  const fields = splitFields(expression);

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">Cron expression</p>
      <div className="flex gap-2">
        <input
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          spellCheck={false}
          placeholder="0 9 * * 1-5"
          className="w-full rounded-card border border-neutral-800 bg-neutral-900 px-4 py-3 font-mono text-sm text-accent-300 focus:border-accent-500 focus:outline-none"
        />
        <CopyButton getText={() => expression} disabled={!expression} />
      </div>

      {fields && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {fields.map((f, i) => (
            <div key={f.label} className="rounded-control border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-center">
              <p className="text-[10px] uppercase tracking-wide text-neutral-500">{f.label}</p>
              <p className={`font-mono text-sm font-semibold ${FIELD_COLORS[i]}`}>{f.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {CRON_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setExpression(p.expression)}
            className="rounded-control border border-neutral-700 px-2.5 py-1 text-[11px] font-semibold text-neutral-400 hover:border-accent-600 hover:text-white"
          >
            {p.label}
          </button>
        ))}
      </div>

      {result && !result.ok ? (
        <div className="mt-4 rounded-card border border-red-900/60 bg-red-950/30 p-4 font-mono text-sm text-red-300">{result.error}</div>
      ) : result?.ok ? (
        <div className="mt-4">
          <p className="rounded-card border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-200">{result.description}</p>

          <p className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Next {result.nextRuns.length} runs <span className="normal-case text-neutral-600">— shown in your browser's local timezone</span>
          </p>
          <div className="space-y-1.5 rounded-card border border-neutral-800 bg-neutral-900 p-3">
            {result.nextRuns.map((d, i) => (
              <div key={i} className="flex items-center justify-between font-mono text-xs text-neutral-300">
                <span className="text-neutral-600">#{i + 1}</span>
                <span>{d.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
