import type { OutputFormatCode } from "@/lib/convert/types";

const OPTIONS: { value: OutputFormatCode; label: string }[] = [
  { value: "webp", label: "WEBP" },
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPG" },
  { value: "bmp", label: "BMP" },
];

export default function FormatSelect({
  value,
  onChange,
  disabled,
}: {
  value: OutputFormatCode;
  onChange: (value: OutputFormatCode) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
      Convert to
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as OutputFormatCode)}
        className="rounded-control border border-neutral-300 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-900 focus:border-accent-500 focus:outline-none disabled:opacity-50"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
