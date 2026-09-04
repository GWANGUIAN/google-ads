import { zip, type Zippable } from "fflate";

export interface ZipEntry {
  name: string;
  blob: Blob;
}

/** Bundles generated QR codes into a single downloadable ZIP using fflate —
 * mirrors apps/img-convertor/src/lib/convert/zip.ts. */
export async function zipFiles(entries: ZipEntry[]): Promise<Blob> {
  const files: Zippable = {};
  await Promise.all(
    entries.map(async (entry) => {
      const buffer = new Uint8Array(await entry.blob.arrayBuffer());
      files[entry.name] = buffer;
    }),
  );

  return new Promise((resolve, reject) => {
    zip(files, { level: 6 }, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(new Blob([data], { type: "application/zip" }));
    });
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
