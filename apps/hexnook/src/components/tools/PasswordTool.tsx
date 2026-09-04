import { useState } from "react";
import { buildCharset, estimateEntropyBits, generatePassword, strengthLabel, type PasswordOptions } from "@/lib/password/generate";
import CopyButton from "./shared/CopyButton";

const DEFAULT_OPTIONS: PasswordOptions = {
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
};

const OPTION_LABELS: [keyof PasswordOptions, string][] = [
  ["uppercase", "A-Z"],
  ["lowercase", "a-z"],
  ["numbers", "0-9"],
  ["symbols", "!@#$"],
  ["excludeAmbiguous", "Exclude ambiguous (Il1O0)"],
];

export default function PasswordTool() {
  const [length, setLength] = useState(20);
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS);
  const [count, setCount] = useState(5);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function generate() {
    const results = Array.from({ length: count }, () => generatePassword(length, options));
    const failed = results.find((r) => !r.ok);
    if (failed && !failed.ok) {
      setError(failed.error);
      setPasswords([]);
      return;
    }
    setError(null);
    setPasswords(results.map((r) => (r.ok ? r.value : "")));
  }

  function toggle(key: keyof PasswordOptions) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const charsetSize = buildCharset(options).length;
  const bits = estimateEntropyBits(length, charsetSize);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-neutral-500">
            <span>Length</span>
            <span className="font-mono text-neutral-300">{length}</span>
          </div>
          <input
            type="range"
            min={4}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-[var(--color-accent-500)]"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-neutral-400">
          Count
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
            className="w-16 rounded-control border border-neutral-800 bg-neutral-900 px-2 py-1 text-sm text-neutral-200 focus:border-accent-500 focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        {OPTION_LABELS.map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-xs font-medium text-neutral-400">
            <input
              type="checkbox"
              checked={options[key]}
              onChange={() => toggle(key)}
              className="h-3.5 w-3.5 accent-[var(--color-accent-500)]"
            />
            {label}
          </label>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          ~{bits} bits of entropy — <span className="font-semibold text-neutral-300">{strengthLabel(bits)}</span>
        </p>
        <button
          type="button"
          onClick={generate}
          className="rounded-control bg-accent-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-500"
        >
          Generate
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <div className="mt-2 space-y-2">
        {passwords.length === 0 && !error && (
          <p className="rounded-card border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-600">
            Passwords will appear here…
          </p>
        )}
        {passwords.map((password, i) => (
          <div key={`${password}-${i}`} className="flex items-center gap-3 rounded-card border border-neutral-800 bg-neutral-900 p-3">
            <code className="flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm text-neutral-200">{password}</code>
            <CopyButton getText={() => password} />
          </div>
        ))}
      </div>
    </div>
  );
}
