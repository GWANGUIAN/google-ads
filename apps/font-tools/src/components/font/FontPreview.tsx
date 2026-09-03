import { useEffect, useId, useState } from "react";

const DEFAULT_SAMPLE = "The quick brown fox jumps over the lazy dog — 0123456789";

interface Props {
  file: File;
}

/**
 * Loads the dropped/converted file straight into the browser via the
 * FontFace API and renders adjustable sample text in it — lets the user
 * confirm the right font loaded before (or after) converting, independent of
 * this app's own conversion pipeline (browsers already decode ttf/otf/woff/
 * woff2 natively for @font-face).
 */
export default function FontPreview({ file }: Props) {
  const rawId = useId();
  const fontFamily = `font-preview-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [sample, setSample] = useState(DEFAULT_SAMPLE);
  const [size, setSize] = useState(32);

  useEffect(() => {
    let cancelled = false;
    let face: FontFace | null = null;
    setStatus("loading");

    file
      .arrayBuffer()
      .then((buffer) => {
        if (cancelled) return;
        face = new FontFace(fontFamily, buffer);
        document.fonts.add(face);
        return face.load();
      })
      .then(() => {
        if (!cancelled) setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      if (face) document.fonts.delete(face);
    };
  }, [file, fontFamily]);

  if (status === "error") {
    return <p className="text-sm text-danger-500">Couldn't preview "{file.name}" — the browser couldn't load it as a font.</p>;
  }

  return (
    <div className="rounded-control border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-1.5 text-xs text-neutral-500">
          Size
          <input
            type="range"
            min={16}
            max={72}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="accent-accent-600"
          />
        </label>
      </div>
      <input
        type="text"
        value={sample}
        onChange={(e) => setSample(e.target.value)}
        aria-label="Preview text"
        placeholder={DEFAULT_SAMPLE}
        className="mt-3 w-full rounded-control border border-neutral-300 bg-white px-3 py-1.5 text-sm focus:border-accent-500 focus:outline-none"
      />
      <p
        className="mt-3 break-words text-neutral-900"
        style={{
          fontFamily: status === "ready" ? fontFamily : "inherit",
          fontSize: `${size}px`,
          lineHeight: 1.3,
          opacity: status === "ready" ? 1 : 0.4,
        }}
      >
        {sample || DEFAULT_SAMPLE}
      </p>
      {status === "loading" && <p className="mt-1 text-xs text-neutral-400">Loading preview…</p>}
    </div>
  );
}
