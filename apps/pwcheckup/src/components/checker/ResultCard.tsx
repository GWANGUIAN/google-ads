import type { Dictionary } from "@/i18n/types";

export type CheckState = "idle" | "checking" | "safe" | "breached" | "error";

interface Props {
  state: CheckState;
  breachCount: number;
  t: Dictionary["result"];
  lang: "ko" | "en";
}

function formatCount(n: number, lang: "ko" | "en") {
  return n.toLocaleString(lang === "ko" ? "ko-KR" : "en-US");
}

export default function ResultCard({ state, breachCount, t, lang }: Props) {
  if (state === "idle" || state === "checking") return null;

  if (state === "error") {
    return (
      <div className="mt-4 flex items-start gap-3 rounded-card border border-danger-500/30 bg-danger-500/5 p-4">
        <ErrorIcon />
        <div>
          <p className="text-sm font-bold text-neutral-900">{t.errorTitle}</p>
          <p className="mt-0.5 text-sm text-neutral-600">{t.errorBody}</p>
        </div>
      </div>
    );
  }

  if (state === "safe") {
    return (
      <div className="mt-4 flex items-start gap-3 rounded-card border border-success-500/30 bg-success-500/5 p-4">
        <SafeIcon />
        <div>
          <p className="text-sm font-bold text-neutral-900">{t.safeTitle}</p>
          <p className="mt-0.5 text-sm text-neutral-600">{t.safeBody}</p>
        </div>
      </div>
    );
  }

  // breached — scale severity color by magnitude
  const severe = breachCount >= 1000;
  const borderColor = severe ? "border-danger-500/30" : "border-warning-500/30";
  const bgColor = severe ? "bg-danger-500/5" : "bg-warning-500/5";
  const body = t.breachedBody.replace("{count}", formatCount(breachCount, lang));

  return (
    <div className={`mt-4 flex items-start gap-3 rounded-card border ${borderColor} ${bgColor} p-4`}>
      <BreachedIcon severe={severe} />
      <div>
        <p className="text-sm font-bold text-neutral-900">{t.breachedTitle}</p>
        <p className="mt-0.5 text-sm text-neutral-600">{body}</p>
      </div>
    </div>
  );
}

function SafeIcon() {
  return (
    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-500 text-white">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function BreachedIcon({ severe }: { severe: boolean }) {
  return (
    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${severe ? "bg-danger-500" : "bg-warning-500"}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
        <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function ErrorIcon() {
  return (
    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-400 text-white">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    </span>
  );
}
