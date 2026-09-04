export type TimestampUnit = "seconds" | "milliseconds";

/** 13+ digits is almost always a millisecond timestamp, 10 or fewer is
 *  almost always seconds — a cheap, reliable heuristic for the "Auto" button. */
export function detectUnit(input: string): TimestampUnit {
  return input.trim().replace(/^-/, "").length > 10 ? "milliseconds" : "seconds";
}

export type EpochParseResult = { ok: true; date: Date } | { ok: false; error: string };

export function epochToDate(value: string, unit: TimestampUnit): EpochParseResult {
  const trimmed = value.trim();
  if (trimmed === "" || !/^-?\d+$/.test(trimmed)) {
    return { ok: false, error: "Enter a whole number of seconds or milliseconds." };
  }
  const num = Number(trimmed);
  const ms = unit === "seconds" ? num * 1000 : num;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return { ok: false, error: "That number is out of range for a valid date." };
  return { ok: true, date };
}

export type DateParseResult = { ok: true; epochSeconds: number; epochMs: number } | { ok: false; error: string };

export function dateToEpoch(dateTimeLocal: string, timezone: "local" | "utc"): DateParseResult {
  if (dateTimeLocal.trim() === "") return { ok: false, error: "Pick a date and time." };
  const iso = timezone === "utc" ? `${dateTimeLocal}Z` : dateTimeLocal;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { ok: false, error: "That's not a valid date/time." };
  return { ok: true, epochSeconds: Math.floor(date.getTime() / 1000), epochMs: date.getTime() };
}

export function formatIso8601(date: Date): string {
  return date.toISOString();
}

export function formatRfc2822(date: Date): string {
  return date.toUTCString();
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

export function formatRelative(date: Date, now: Date = new Date()): string {
  const diffSec = Math.round((date.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const [unit, secInUnit] of RELATIVE_UNITS) {
    if (abs >= secInUnit || unit === "second") {
      return rtf.format(Math.round(diffSec / secInUnit), unit);
    }
  }
  return rtf.format(0, "second");
}

/** Formats a Date for a native <input type="datetime-local"> value (which
 *  has no timezone of its own — the UI's Local/UTC toggle decides how the
 *  string is interpreted on the way back out via dateToEpoch). */
export function formatLocalDateTimeInput(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
