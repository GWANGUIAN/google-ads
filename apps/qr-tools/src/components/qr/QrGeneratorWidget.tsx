import { useEffect, useRef, useState } from "react";
import { QR_TYPE_LIST, QR_TYPES, type QrTypeCode } from "@/data/qrTypes";
import { renderQrToCanvas, renderQrToSvg, canvasToPngBlob, type QrStyleOptions } from "@/lib/qr/generate";
import { downloadBlob } from "@/lib/qr/zip";

type ErrorCorrectionLevel = NonNullable<QrStyleOptions["errorCorrectionLevel"]>;

export default function QrGeneratorWidget({
  initialType = "url",
  lockType = false,
}: {
  initialType?: QrTypeCode;
  lockType?: boolean;
}) {
  const [typeCode, setTypeCode] = useState<QrTypeCode>(initialType);
  const type = QR_TYPES[typeCode];

  const [values, setValues] = useState<Record<string, string>>(() => ({ ...type.example }));
  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [ecLevel, setEcLevel] = useState<ErrorCorrectionLevel>("M");
  const [format, setFormat] = useState<"png" | "svg">("png");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [svgMarkup, setSvgMarkup] = useState("");
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setValues({ ...type.example });
  }, [typeCode]);

  useEffect(() => {
    if (!logoFile) {
      setLogoImg(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    const img = new Image();
    img.onload = () => setLogoImg(img);
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const payload = type.buildPayload(values);
  const effectiveEcLevel = logoImg && format === "png" ? "H" : ecLevel;

  useEffect(() => {
    if (!payload) {
      setError(null);
      return;
    }
    let cancelled = false;
    const opts: QrStyleOptions = {
      foreground,
      background,
      errorCorrectionLevel: effectiveEcLevel,
    };

    if (format === "png") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      renderQrToCanvas(canvas, payload, { ...opts, logo: logoImg })
        .then(() => !cancelled && setError(null))
        .catch(() => !cancelled && setError("Couldn't generate this QR code — check the required fields above."));
    } else {
      renderQrToSvg(payload, opts)
        .then((svg) => {
          if (!cancelled) {
            setSvgMarkup(svg);
            setError(null);
          }
        })
        .catch(() => !cancelled && setError("Couldn't generate this QR code — check the required fields above."));
    }
    return () => {
      cancelled = true;
    };
  }, [payload, foreground, background, effectiveEcLevel, format, logoImg]);

  function handleFieldChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleDownload() {
    if (format === "svg") {
      downloadBlob(new Blob([svgMarkup], { type: "image/svg+xml" }), `${type.slug}.svg`);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await canvasToPngBlob(canvas);
    downloadBlob(blob, `${type.slug}.png`);
  }

  const isValid = type.fields.every((f) => !f.required || (values[f.key] ?? "").trim().length > 0);

  return (
    <div className="rounded-card border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
        <p className="text-sm font-semibold text-neutral-800">QR code generator</p>
        {!lockType && (
          <select
            value={typeCode}
            onChange={(e) => setTypeCode(e.target.value as QrTypeCode)}
            className="rounded-control border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-800"
          >
            {QR_TYPE_LIST.map((t) => (
              <option key={t.code} value={t.code}>
                {t.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid gap-6 p-5 sm:grid-cols-2">
        <div className="space-y-4">
          {type.fields.map((field) => (
            <label key={field.key} className="block text-sm">
              <span className="mb-1 block font-medium text-neutral-700">
                {field.label}
                {field.required && <span className="text-accent-600"> *</span>}
              </span>
              {field.type === "textarea" ? (
                <textarea
                  value={values[field.key] ?? ""}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full rounded-control border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
                />
              ) : field.type === "select" ? (
                <select
                  value={values[field.key] ?? field.options?.[0]?.value ?? ""}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="w-full rounded-control border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900"
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={values[field.key] ?? ""}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-control border border-neutral-300 px-3 py-2 text-sm text-neutral-900"
                />
              )}
            </label>
          ))}

          <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-neutral-700">Foreground</span>
              <input
                type="color"
                value={foreground}
                onChange={(e) => setForeground(e.target.value)}
                className="h-9 w-full cursor-pointer rounded-control border border-neutral-300"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-neutral-700">Background</span>
              <input
                type="color"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="h-9 w-full cursor-pointer rounded-control border border-neutral-300"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-neutral-700">Error correction</span>
              <select
                value={effectiveEcLevel}
                onChange={(e) => setEcLevel(e.target.value as ErrorCorrectionLevel)}
                disabled={!!logoImg && format === "png"}
                className="w-full rounded-control border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 disabled:bg-neutral-100 disabled:text-neutral-400"
              >
                <option value="L">Low</option>
                <option value="M">Medium</option>
                <option value="Q">Quartile</option>
                <option value="H">High</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-neutral-700">Format</span>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as "png" | "svg")}
                className="w-full rounded-control border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900"
              >
                <option value="png">PNG</option>
                <option value="svg">SVG</option>
              </select>
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-neutral-700">
              Logo {format === "svg" && <span className="font-normal text-neutral-400">(PNG only)</span>}
            </span>
            <input
              type="file"
              accept="image/*"
              disabled={format === "svg"}
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-neutral-600 disabled:opacity-50"
            />
          </label>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 rounded-card bg-neutral-50 p-6">
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
          {!error && !isValid && <p className="text-center text-sm text-neutral-400">Fill in the required fields to see a preview</p>}
          {isValid && !error && (
            <div className="flex h-64 w-64 items-center justify-center overflow-hidden rounded-card border border-neutral-200 bg-white">
              {format === "png" ? (
                <canvas ref={canvasRef} className="h-full w-full object-contain" />
              ) : (
                <div className="h-full w-full [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
              )}
            </div>
          )}
          <button
            type="button"
            onClick={handleDownload}
            disabled={!isValid || !!error}
            className="w-full rounded-control bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
