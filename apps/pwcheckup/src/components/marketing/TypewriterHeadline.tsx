import { useEffect, useState } from "react";

interface Props {
  phrases: string[];
}

const TYPE_SPEED = 90;
const DELETE_SPEED = 45;
const HOLD_MS = 1800;
const PAUSE_MS = 400;

export default function TypewriterHeadline({ phrases }: Props) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "deleting" | "pausing">("typing");

  useEffect(() => {
    if (phrases.length === 0) return;
    const current = phrases[phraseIndex % phrases.length];

    if (phase === "typing") {
      if (text.length < current.length) {
        const id = setTimeout(() => setText(current.slice(0, text.length + 1)), TYPE_SPEED);
        return () => clearTimeout(id);
      }
      const id = setTimeout(() => setPhase("deleting"), HOLD_MS);
      return () => clearTimeout(id);
    }

    if (phase === "deleting") {
      if (text.length > 0) {
        const id = setTimeout(() => setText(current.slice(0, text.length - 1)), DELETE_SPEED);
        return () => clearTimeout(id);
      }
      const id = setTimeout(() => setPhase("pausing"), PAUSE_MS);
      return () => clearTimeout(id);
    }

    // phase === "pausing"
    const id = setTimeout(() => {
      setPhraseIndex((i) => (i + 1) % phrases.length);
      setPhase("typing");
    }, 0);
    return () => clearTimeout(id);
  }, [phase, text, phraseIndex, phrases]);

  return (
    <span className="inline-flex items-baseline">
      {text}
      <span className="ml-0.5 inline-block h-[0.9em] w-[2px] animate-pulse bg-accent-600 align-baseline" aria-hidden="true" />
    </span>
  );
}
