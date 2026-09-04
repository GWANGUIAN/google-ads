import { minify, beautify } from "@/lib/format/css";
import { highlightCss } from "@/lib/format/highlight";
import CodeFormatterCore from "./CodeFormatterCore";

const SAMPLE = `.card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-radius: 0.75rem;
  background-color: #18181b;
  border: 1px solid #27272a;
}

.card:hover {
  border-color: #db2777;
  transform: translateY(-2px);
}

.card__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #ffffff;
}`;

export default function CssFormatterTool() {
  return <CodeFormatterCore sample={SAMPLE} minify={minify} beautify={beautify} highlight={highlightCss} fileExtension="css" mimeType="text/css" />;
}
