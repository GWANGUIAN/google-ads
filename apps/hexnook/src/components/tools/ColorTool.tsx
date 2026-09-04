import { useEffect, useRef, useState } from "react";
import { formatHsl, formatRgb, parseColor, rgbToHex, rgbToHsl, type Rgb } from "@/lib/color/convert";
import { contrastRatio, wcagRating } from "@/lib/color/contrast";
import CopyButton from "./shared/CopyButton";

const DEFAULT_RGB: Rgb = { r: 236, g: 72, b: 153 }; // hexnook's own accent-500

type Field = "hex" | "rgb" | "hsl";

export default function ColorTool() {
  const [rgb, setRgb] = useState<Rgb>(DEFAULT_RGB);
  const [hexDraft, setHexDraft] = useState(rgbToHex(DEFAULT_RGB));
  const [rgbDraft, setRgbDraft] = useState(formatRgb(DEFAULT_RGB));
  const [hslDraft, setHslDraft] = useState(formatHsl(rgbToHsl(DEFAULT_RGB)));
  const [error, setError] = useState<string | null>(null);
  const editingRef = useRef<Field | null>(null);

  useEffect(() => {
    if (editingRef.current !== "hex") setHexDraft(rgbToHex(rgb));
    if (editingRef.current !== "rgb") setRgbDraft(formatRgb(rgb));
    if (editingRef.current !== "hsl") setHslDraft(formatHsl(rgbToHsl(rgb)));
  }, [rgb]);

  function commit(field: Field, raw: string, setDraft: (v: string) => void) {
    editingRef.current = field;
    setDraft(raw);
    const parsed = parseColor(raw);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setError(null);
    setRgb(parsed.rgb);
  }

  const fields: [Field, string, string, (v: string) => void][] = [
    ["hex", "HEX", hexDraft, setHexDraft],
    ["rgb", "RGB", rgbDraft, setRgbDraft],
    ["hsl", "HSL", hslDraft, setHslDraft],
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <input
            type="color"
            value={rgbToHex(rgb)}
            onChange={(e) => commit("hex", e.target.value, setHexDraft)}
            aria-label="Pick a color"
            className="h-16 w-16 cursor-pointer rounded-control border border-neutral-700 bg-neutral-900 p-1"
          />
          <span className="text-[10px] uppercase tracking-wide text-neutral-500">Picker</span>
        </div>

        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          {fields.map(([field, label, value, setDraft]) => (
            <div key={field}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
              <div className="flex items-center gap-1.5">
                <input
                  value={value}
                  onChange={(e) => commit(field, e.target.value, setDraft)}
                  onBlur={() => {
                    editingRef.current = null;
                  }}
                  spellCheck={false}
                  className="w-full rounded-control border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-sm text-neutral-200 focus:border-accent-500 focus:outline-none"
                />
                <CopyButton getText={() => value} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

      <div className="mt-8 border-t border-neutral-800 pt-6">
        <p className="text-sm font-bold text-white">Contrast checker</p>
        <ContrastChecker />
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const parsed = parseColor(value);
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={parsed.ok ? rgbToHex(parsed.rgb) : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} color picker`}
          className="h-9 w-9 shrink-0 cursor-pointer rounded-control border border-neutral-700 bg-neutral-900 p-1"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full rounded-control border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-sm text-neutral-200 focus:border-accent-500 focus:outline-none"
        />
      </div>
    </div>
  );
}

function ContrastChecker() {
  const [fg, setFg] = useState("#FFFFFF");
  const [bg, setBg] = useState("#0F172A");

  const fgParsed = parseColor(fg);
  const bgParsed = parseColor(bg);
  const ratio = fgParsed.ok && bgParsed.ok ? contrastRatio(fgParsed.rgb, bgParsed.rgb) : null;
  const rating = ratio !== null ? wcagRating(ratio) : null;

  const badges: [string, boolean][] = rating
    ? [
        ["Normal AA", rating.normalAA],
        ["Normal AAA", rating.normalAAA],
        ["Large AA", rating.largeAA],
        ["Large AAA", rating.largeAAA],
      ]
    : [];

  return (
    <div className="mt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField label="Foreground" value={fg} onChange={setFg} />
        <ColorField label="Background" value={bg} onChange={setBg} />
      </div>

      <div
        className="mt-4 flex flex-col items-center justify-center gap-1 rounded-card border border-neutral-800 p-6 text-center"
        style={{ backgroundColor: bgParsed.ok ? bg : "#000000", color: fgParsed.ok ? fg : "#ffffff" }}
      >
        <p className="text-lg font-bold">Sample text</p>
        <p className="text-sm">The quick brown fox jumps over the lazy dog.</p>
      </div>

      {ratio !== null ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-card border border-neutral-800 bg-neutral-900 p-3 text-center sm:col-span-4">
            <p className="text-2xl font-extrabold text-white">{ratio.toFixed(2)}:1</p>
            <p className="text-xs text-neutral-500">Contrast ratio</p>
          </div>
          {badges.map(([label, pass]) => (
            <div
              key={label}
              className={`rounded-card border p-3 text-center text-xs font-semibold ${
                pass ? "border-emerald-800 bg-emerald-950/40 text-emerald-300" : "border-red-900/60 bg-red-950/30 text-red-300"
              }`}
            >
              {pass ? "✓" : "✕"} {label}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-xs text-red-400">Enter valid colors to see the contrast ratio.</p>
      )}
    </div>
  );
}
