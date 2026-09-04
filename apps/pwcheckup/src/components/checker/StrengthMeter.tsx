import type { Dictionary } from "@/i18n/types";

interface Props {
  score: 0 | 1 | 2 | 3 | 4 | null;
  labels: Dictionary["result"]["strength"];
}

const SCORE_META = [
  { label: (l: Props["labels"]) => l.weak, color: "bg-danger-500", width: "20%" },
  { label: (l: Props["labels"]) => l.weak, color: "bg-danger-500", width: "40%" },
  { label: (l: Props["labels"]) => l.fair, color: "bg-warning-500", width: "60%" },
  { label: (l: Props["labels"]) => l.good, color: "bg-accent-500", width: "80%" },
  { label: (l: Props["labels"]) => l.strong, color: "bg-success-500", width: "100%" },
] as const;

export default function StrengthMeter({ score, labels }: Props) {
  if (score === null) return null;
  const meta = SCORE_META[score];

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
        <span>{labels.label}</span>
        <span>{meta.label(labels)}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full transition-all duration-300 ${meta.color}`}
          style={{ width: meta.width }}
        />
      </div>
    </div>
  );
}
