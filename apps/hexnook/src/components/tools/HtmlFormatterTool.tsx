import { minify, beautify } from "@/lib/format/html";
import { highlightHtml } from "@/lib/format/highlight";
import CodeFormatterCore from "./CodeFormatterCore";

const SAMPLE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Sample page</title>
  </head>
  <body>
    <!-- Main content -->
    <div class="wrapper">
      <h1>Hello, world!</h1>
      <p>This is a <strong>sample</strong> paragraph with a <a href="#">link</a>.</p>
    </div>
  </body>
</html>`;

export default function HtmlFormatterTool() {
  return <CodeFormatterCore sample={SAMPLE} minify={minify} beautify={beautify} highlight={highlightHtml} fileExtension="html" mimeType="text/html" />;
}
