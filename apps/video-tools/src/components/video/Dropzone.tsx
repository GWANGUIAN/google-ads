import { useRef, useState, type DragEvent } from "react";

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const patterns = accept.split(",").map((p) => p.trim());
  return patterns.some((pattern) => {
    if (pattern.startsWith(".")) return file.name.toLowerCase().endsWith(pattern.toLowerCase());
    if (pattern.endsWith("/*")) return file.type.startsWith(pattern.slice(0, -1));
    return file.type === pattern;
  });
}

export default function Dropzone({
  onFiles,
  accept,
  multiple = true,
  label = "Drag & drop a video here, or click to browse",
  hint,
}: {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => matchesAccept(f, accept));
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed px-6 py-14 text-center transition-colors ${
        isDragOver
          ? "border-accent-500 bg-accent-50"
          : "border-neutral-300 bg-neutral-50 hover:border-accent-400 hover:bg-accent-50/40"
      }`}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-accent-500"
        aria-hidden="true"
      >
        <path d="M12 16V4M12 4l-4 4M12 4l4 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-base font-semibold text-neutral-800">{label}</p>
      {hint && <p className="text-sm text-neutral-500">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
