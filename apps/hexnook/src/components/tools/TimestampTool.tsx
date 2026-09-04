import { useEffect, useState } from "react";
import {
  dateToEpoch,
  detectUnit,
  epochToDate,
  formatIso8601,
  formatLocalDateTimeInput,
  formatRelative,
  type TimestampUnit,
} from "@/lib/timestamp/timestamp";
import CopyButton from "./shared/CopyButton";

export default function TimestampTool() {
  // now/epochInput/dateInput all depend on the current moment and the
  // viewer's local timezone, which necessarily differ between this static
  // page's build-time prerender and a later client hydration — computing
  // them eagerly in initial state would throw a hydration mismatch. Each
  // starts as a deterministic placeholder and is filled in client-side only,
  // after mount.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const [epochInput, setEpochInput] = useState("1704067200");
  const [unit, setUnit] = useState<TimestampUnit>("seconds");
  const epochResult = epochToDate(epochInput, unit);

  const [dateInput, setDateInput] = useState("");
  const [timezone, setTimezone] = useState<"local" | "utc">("local");
  const dateResult = dateToEpoch(dateInput, timezone);

  useEffect(() => {
    const n = new Date();
    setEpochInput(Math.floor(n.getTime() / 1000).toString());
    setDateInput(formatLocalDateTimeInput(n));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="rounded-card border border-neutral-800 bg-neutral-900 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Current Unix time</p>
        <p className="mt-1 font-mono text-2xl font-bold text-white">{now ? Math.floor(now.getTime() / 1000) : "—"}</p>
        <p className="mt-1 text-xs text-neutral-500">{now ? now.toISOString() : "—"}</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-1.5 flex min-h-8 items-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Epoch → Date</p>
          </div>
          <div className="flex gap-2">
            <input
              value={epochInput}
              onChange={(e) => setEpochInput(e.target.value)}
              spellCheck={false}
              placeholder="1735689600"
              className="w-full rounded-control border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-sm text-neutral-200 focus:border-accent-500 focus:outline-none"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as TimestampUnit)}
              className="rounded-control border border-neutral-800 bg-neutral-900 px-2 py-2 text-xs text-neutral-300 focus:border-accent-500 focus:outline-none"
            >
              <option value="seconds">sec</option>
              <option value="milliseconds">ms</option>
            </select>
            <button
              type="button"
              onClick={() => setUnit(detectUnit(epochInput))}
              title="Auto-detect seconds vs milliseconds"
              className="shrink-0 rounded-control border border-neutral-700 px-2 text-[10px] font-semibold text-neutral-400 hover:text-white"
            >
              Auto
            </button>
          </div>

          {epochResult.ok ? (
            <div className="mt-3 space-y-1.5 rounded-card border border-neutral-800 bg-neutral-900 p-3 text-xs">
              <ResultRow label="Local" value={epochResult.date.toLocaleString()} />
              <ResultRow label="UTC" value={epochResult.date.toUTCString()} />
              <ResultRow label="ISO 8601" value={formatIso8601(epochResult.date)} />
              <ResultRow label="Relative" value={formatRelative(epochResult.date, now ?? undefined)} />
            </div>
          ) : (
            <p className="mt-3 text-xs text-red-400">{epochResult.error}</p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex min-h-8 items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Date → Epoch</p>
            <div className="inline-flex rounded-control border border-neutral-700 bg-neutral-900 p-0.5 text-[10px]">
              {(["local", "utc"] as const).map((tz) => (
                <button
                  key={tz}
                  type="button"
                  onClick={() => setTimezone(tz)}
                  className={`rounded-[calc(var(--radius-control)-4px)] px-2 py-1 font-semibold uppercase transition-colors ${
                    timezone === tz ? "bg-accent-600 text-white" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {tz}
                </button>
              ))}
            </div>
          </div>
          <input
            type="datetime-local"
            step={1}
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full rounded-control border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-sm text-neutral-200 focus:border-accent-500 focus:outline-none"
          />

          {dateResult.ok ? (
            <div className="mt-3 space-y-1.5 rounded-card border border-neutral-800 bg-neutral-900 p-3 text-xs">
              <ResultRow label="Seconds" value={dateResult.epochSeconds.toString()} />
              <ResultRow label="Milliseconds" value={dateResult.epochMs.toString()} />
            </div>
          ) : (
            <p className="mt-3 text-xs text-red-400">{dateResult.error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-neutral-500">{label}</span>
      <div className="flex items-center gap-2">
        <code className="text-neutral-200">{value}</code>
        <CopyButton getText={() => value} />
      </div>
    </div>
  );
}
