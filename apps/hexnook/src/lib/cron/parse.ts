import { CronExpressionParser } from "cron-parser";
import cronstrue from "cronstrue";

export type CronResult = { ok: true; description: string; nextRuns: Date[] } | { ok: false; error: string };

export function parseCron(expression: string, count = 10): CronResult {
  const trimmed = expression.trim();
  if (trimmed === "") return { ok: false, error: "Enter a cron expression." };

  let description: string;
  try {
    description = cronstrue.toString(trimmed);
  } catch (error) {
    // cronstrue throws a plain string, not an Error instance.
    const message = typeof error === "string" ? error : error instanceof Error ? error.message : "Invalid cron expression.";
    return { ok: false, error: message };
  }

  try {
    const interval = CronExpressionParser.parse(trimmed);
    const nextRuns = interval.take(count).map((d) => d.toDate());
    return { ok: true, description, nextRuns };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Invalid cron expression." };
  }
}

const NICKNAMES: Record<string, string> = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
};

export interface CronField {
  label: string;
  value: string;
}

const FIELD_LABELS = ["Minute", "Hour", "Day (month)", "Month", "Day (week)"];

/** Splits a classic 5-field cron expression into labeled parts for the
 *  crontab.guru-style visual breakdown. Returns null for anything that
 *  isn't exactly 5 whitespace-separated fields (e.g. a 6-field expression
 *  with seconds) — next-run computation still works for those via
 *  parseCron() above, they just don't get the field-by-field chips. */
export function splitFields(expression: string): CronField[] | null {
  const trimmed = expression.trim().toLowerCase();
  const resolved = NICKNAMES[trimmed] ?? expression.trim();
  const parts = resolved.split(/\s+/).filter(Boolean);
  if (parts.length !== 5) return null;
  return FIELD_LABELS.map((label, i) => ({ label, value: parts[i] }));
}
