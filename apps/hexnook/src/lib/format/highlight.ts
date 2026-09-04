/** Small regex-based syntax highlighters, one per language, following the
 *  same "deliberately not a library" approach as lib/json/highlight.ts.
 *  Each escapes HTML-unsafe characters first (or as part of tokenizing raw
 *  source), so the output is safe for dangerouslySetInnerHTML. */

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const HTML_TOKEN_RE = /(<!--[\s\S]*?-->)|(<\/?[a-zA-Z][^<>]*>)/g;

function highlightTag(rawTag: string): string {
  const escaped = escapeHtml(rawTag);
  const withAttrs = escaped.replace(/("[^"]*"|'[^']*')/g, (v) => `<span class="text-emerald-300">${v}</span>`);
  const withName = withAttrs.replace(/^(&lt;\/?)([a-zA-Z0-9-]+)/, (_m, bracket, name) => `${bracket}<span class="text-accent-400">${name}</span>`);
  return `<span class="text-sky-300">${withName}</span>`;
}

export function highlightHtml(code: string): string {
  let out = "";
  let lastIndex = 0;
  for (const m of code.matchAll(HTML_TOKEN_RE)) {
    const start = m.index ?? 0;
    if (start > lastIndex) out += escapeHtml(code.slice(lastIndex, start));
    out += m[1] ? `<span class="text-neutral-500">${escapeHtml(m[1])}</span>` : highlightTag(m[2]);
    lastIndex = start + m[0].length;
  }
  if (lastIndex < code.length) out += escapeHtml(code.slice(lastIndex));
  return out;
}

const CSS_TOKEN_RE = /(\/\*[\s\S]*?\*\/)|("[^"]*"|'[^']*')|([a-zA-Z-]+)(?=\s*:)|([{};])/g;

export function highlightCss(code: string): string {
  let out = "";
  let lastIndex = 0;
  for (const m of code.matchAll(CSS_TOKEN_RE)) {
    const start = m.index ?? 0;
    if (start > lastIndex) out += escapeHtml(code.slice(lastIndex, start));
    if (m[1]) out += `<span class="text-neutral-500">${escapeHtml(m[1])}</span>`;
    else if (m[2]) out += `<span class="text-emerald-300">${escapeHtml(m[2])}</span>`;
    else if (m[3]) out += `<span class="text-accent-400">${escapeHtml(m[3])}</span>`;
    else if (m[4]) out += `<span class="text-neutral-500">${escapeHtml(m[4])}</span>`;
    lastIndex = start + m[0].length;
  }
  if (lastIndex < code.length) out += escapeHtml(code.slice(lastIndex));
  return out;
}

const JS_KEYWORDS =
  "const|let|var|function|return|if|else|for|while|do|class|extends|new|import|export|default|from|async|await|try|catch|finally|throw|typeof|instanceof|of|in|switch|case|break|continue|null|undefined|true|false|this|super|static|get|set|yield|void|delete";
const JS_TOKEN_RE = new RegExp(
  `(//[^\\n]*|/\\*[\\s\\S]*?\\*/)|(\`(?:\\\\.|[^\`\\\\])*\`|"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*')|(\\b\\d+(?:\\.\\d+)?\\b)|(\\b(?:${JS_KEYWORDS})\\b)`,
  "g",
);

export function highlightJs(code: string): string {
  let out = "";
  let lastIndex = 0;
  for (const m of code.matchAll(JS_TOKEN_RE)) {
    const start = m.index ?? 0;
    if (start > lastIndex) out += escapeHtml(code.slice(lastIndex, start));
    if (m[1]) out += `<span class="text-neutral-500">${escapeHtml(m[1])}</span>`;
    else if (m[2]) out += `<span class="text-emerald-300">${escapeHtml(m[2])}</span>`;
    else if (m[3]) out += `<span class="text-sky-300">${escapeHtml(m[3])}</span>`;
    else if (m[4]) out += `<span class="text-amber-300">${escapeHtml(m[4])}</span>`;
    lastIndex = start + m[0].length;
  }
  if (lastIndex < code.length) out += escapeHtml(code.slice(lastIndex));
  return out;
}
