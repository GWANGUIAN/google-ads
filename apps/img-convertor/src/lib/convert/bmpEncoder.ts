/**
 * Canvas has no native BMP export in any browser (`convertToBlob({type:'image/bmp'})`
 * silently falls back to PNG), so we hand-roll an uncompressed 24-bit BMP writer
 * from raw ImageData. BMP rows are stored bottom-up and padded to 4-byte boundaries.
 */
export function encodeBmp(imageData: ImageData): Blob {
  const { width, height, data } = imageData;
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // BITMAPFILEHEADER (14 bytes)
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4d); // 'M'
  view.setUint32(2, fileSize, true);
  view.setUint32(6, 0, true); // reserved
  view.setUint32(10, 54, true); // pixel array offset

  // BITMAPINFOHEADER (40 bytes)
  view.setUint32(14, 40, true); // header size
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true); // planes
  view.setUint16(28, 24, true); // bits per pixel
  view.setUint32(30, 0, true); // no compression
  view.setUint32(34, pixelArraySize, true);
  view.setInt32(38, 2835, true); // ~72 DPI
  view.setInt32(42, 2835, true);
  view.setUint32(46, 0, true); // colors in palette
  view.setUint32(50, 0, true); // important colors

  const bytes = new Uint8Array(buffer);
  let offset = 54;
  for (let y = height - 1; y >= 0; y--) {
    const rowStart = offset;
    for (let x = 0; x < width; x++) {
      const srcIndex = (y * width + x) * 4;
      const r = data[srcIndex] as number;
      const g = data[srcIndex + 1] as number;
      const b = data[srcIndex + 2] as number;
      // BMP stores pixels as BGR
      bytes[offset++] = b;
      bytes[offset++] = g;
      bytes[offset++] = r;
    }
    // pad row to 4-byte boundary
    while (offset - rowStart < rowSize) {
      bytes[offset++] = 0;
    }
  }

  return new Blob([buffer], { type: "image/bmp" });
}
