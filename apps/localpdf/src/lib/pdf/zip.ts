import { zip, type Zippable } from "fflate";

export interface ZipEntry {
  name: string;
  blob: Blob;
}

/** Bundles files into a single downloadable ZIP using fflate. */
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
