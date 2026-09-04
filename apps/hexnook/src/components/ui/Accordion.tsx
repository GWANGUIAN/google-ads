import { useState } from "react";

// Local dark-theme reskin of @repo/ui/Accordion.tsx (same props/behavior) —
// the shared component hardcodes light-theme colors with no className escape
// hatch, and this is the first dark-only site in the repo. See Button.astro.
export interface AccordionItem {
  question: string;
  answer: string;
}

export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-neutral-800 rounded-card border border-neutral-800 bg-neutral-900">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-white"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span>{item.question}</span>
              <span
                className={`shrink-0 text-accent-400 transition-transform ${isOpen ? "rotate-45" : ""}`}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            {isOpen && <div className="px-5 pb-4 text-sm leading-relaxed text-neutral-400">{item.answer}</div>}
          </div>
        );
      })}
    </div>
  );
}
