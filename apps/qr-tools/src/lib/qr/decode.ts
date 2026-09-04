import jsQR from "jsqr";

export interface DecodeResult {
  text: string;
}

/** Decodes a QR code from an uploaded image file. Runs entirely client-side
 * via jsQR on pixel data from an offscreen canvas — the image is never
 * uploaded anywhere. Returns null if no code is found in the image. */
export async function decodeQrFromImage(file: File): Promise<DecodeResult | null> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return decodeQrFromImageData(imageData);
}

/** Same decode, for a raw ImageData frame (e.g. a video frame during live
 * camera scanning) rather than an uploaded file. */
export function decodeQrFromImageData(imageData: ImageData): DecodeResult | null {
  const result = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "attemptBoth",
  });
  return result ? { text: result.data } : null;
}
