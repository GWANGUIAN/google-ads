const TOKEN_RE =
  /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Small regex-based JSON syntax highlighter (keys/strings/booleans/null/numbers
 *  get distinct colors) — deliberately not a library, this is the standard
 *  ~10-line trick for highlighting already-valid JSON text. Output is safe to
 *  render with dangerouslySetInnerHTML since the source is escaped first. */
export function highlightJson(json: string): string {
  const escaped = escapeHtml(json);
  return escaped.replace(TOKEN_RE, (match) => {
    let className = "text-sky-300"; // number (default)
    if (/^"/.test(match)) {
      className = /:$/.test(match) ? "text-accent-400" : "text-emerald-300"; // key vs string value
    } else if (/^(true|false)$/.test(match)) {
      className = "text-amber-300";
    } else if (match === "null") {
      className = "text-neutral-500";
    }
    return `<span class="${className}">${match}</span>`;
  });
}
