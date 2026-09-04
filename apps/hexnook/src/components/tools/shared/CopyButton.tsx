import { useRef, useState } from "react";

interface Props {
  getText: () => string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function CopyButton({ getText, label = "Copy", disabled = false, className = "" }: Props) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleClick() {
    const text = getText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-control border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 transition-all hover:border-neutral-600 hover:bg-neutral-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
    >
      <span className={copied ? "text-accent-400" : ""}>{copied ? "Copied ✓" : label}</span>
    </button>
  );
}
