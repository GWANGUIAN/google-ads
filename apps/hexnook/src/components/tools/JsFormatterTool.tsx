import { minify, beautify } from "@/lib/format/js";
import { highlightJs } from "@/lib/format/highlight";
import CodeFormatterCore from "./CodeFormatterCore";

const SAMPLE = `function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

const search = debounce(function (query) {
  console.log("Searching for:", query);
}, 300);`;

export default function JsFormatterTool() {
  return (
    <CodeFormatterCore sample={SAMPLE} minify={minify} beautify={beautify} highlight={highlightJs} fileExtension="js" mimeType="text/javascript" />
  );
}
