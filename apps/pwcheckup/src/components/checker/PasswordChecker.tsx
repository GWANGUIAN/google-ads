import { useEffect, useRef, useState } from "react";
import { checkPwnedPassword } from "@/lib/pwned";
import { estimateStrength } from "@/lib/zxcvbn";
import { getDictionary, type Locale } from "@/i18n/config";
import StrengthMeter from "./StrengthMeter";
import ResultCard, { type CheckState } from "./ResultCard";

interface Props {
  lang: Locale;
}

export default function PasswordChecker({ lang }: Props) {
  const t = getDictionary(lang);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [strengthScore, setStrengthScore] = useState<0 | 1 | 2 | 3 | 4 | null>(null);
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [breachCount, setBreachCount] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const strengthTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live strength estimate — local computation only, no network, safe to
  // run on every keystroke (debounced to avoid recomputing mid-keystroke).
  useEffect(() => {
    if (strengthTimer.current) clearTimeout(strengthTimer.current);
    if (!password) {
      setStrengthScore(null);
      return;
    }
    strengthTimer.current = setTimeout(() => {
      estimateStrength(password).then((result) => setStrengthScore(result.score));
    }, 150);
    return () => {
      if (strengthTimer.current) clearTimeout(strengthTimer.current);
    };
  }, [password]);

  async function runCheck() {
    if (!password || checkState === "checking") return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setCheckState("checking");
    try {
      const result = await checkPwnedPassword(password, controller.signal);
      setBreachCount(result.count);
      setCheckState(result.breached ? "breached" : "safe");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setCheckState("error");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void runCheck();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      <label htmlFor="pw-check-input" className="block text-sm font-semibold text-neutral-900">
        {t.checker.inputLabel}
      </label>
      <div className="mt-2 flex gap-2">
        <div className="relative flex-1">
          <input
            id="pw-check-input"
            name="pw-check-input"
            type={showPassword ? "text" : "password"}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            data-lpignore="true"
            data-1p-ignore
            placeholder={t.checker.inputPlaceholder}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setCheckState("idle");
            }}
            className="w-full rounded-control border border-neutral-300 bg-white px-4 py-2.5 pr-16 text-base text-neutral-900 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-control px-2 py-1 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            {showPassword ? t.checker.hide : t.checker.show}
          </button>
        </div>
      </div>

      <StrengthMeter score={strengthScore} labels={t.result.strength} />

      <button
        type="submit"
        disabled={!password || checkState === "checking"}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-control bg-accent-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {checkState === "checking" ? t.checker.checkingLabel : t.checker.checkButton}
      </button>

      <ResultCard state={checkState} breachCount={breachCount} t={t.result} lang={lang} />
    </form>
  );
}
