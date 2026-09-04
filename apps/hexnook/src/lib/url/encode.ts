export type UrlResult = { ok: true; value: string } | { ok: false; error: string };

export type UrlMode = "component" | "full";
export type UrlAction = "encode" | "decode";

/** True when the input looks like it already contains percent-escapes,
 *  used to auto-default the action toggle to Decode for pasted values. */
export function looksEncoded(input: string): boolean {
  return /%[0-9A-Fa-f]{2}/.test(input);
}

function transformLine(line: string, mode: UrlMode, action: UrlAction): string {
  if (action === "encode") {
    return mode === "component" ? encodeURIComponent(line) : encodeURI(line);
  }
  return mode === "component" ? decodeURIComponent(line) : decodeURI(line);
}

export function transformUrl(input: string, mode: UrlMode, action: UrlAction, batch: boolean): UrlResult {
  if (input === "") return { ok: true, value: "" };

  try {
    if (!batch) return { ok: true, value: transformLine(input, mode, action) };
    const lines = input.split("\n");
    return { ok: true, value: lines.map((line) => transformLine(line, mode, action)).join("\n") };
  } catch (error) {
    const message = error instanceof URIError ? "Malformed input — check for an incomplete or invalid % escape sequence." : "Could not process input.";
    return { ok: false, error: message };
  }
}
