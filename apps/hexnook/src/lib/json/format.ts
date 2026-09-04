export type JsonFormatResult = { ok: true; value: string } | { ok: false; error: string };

function describeError(input: string, error: unknown): string {
  const message = error instanceof Error ? error.message : "Invalid JSON";
  const positionMatch = message.match(/position (\d+)/);
  if (!positionMatch) return message;

  const position = Number(positionMatch[1]);
  const before = input.slice(0, position);
  const line = before.split("\n").length;
  const column = position - before.lastIndexOf("\n");
  return `${message} (line ${line}, column ${column})`;
}

export function formatJson(input: string, indent: number): JsonFormatResult {
  try {
    const parsed = JSON.parse(input);
    return { ok: true, value: JSON.stringify(parsed, null, indent) };
  } catch (error) {
    return { ok: false, error: describeError(input, error) };
  }
}

export function minifyJson(input: string): JsonFormatResult {
  try {
    const parsed = JSON.parse(input);
    return { ok: true, value: JSON.stringify(parsed) };
  } catch (error) {
    return { ok: false, error: describeError(input, error) };
  }
}
