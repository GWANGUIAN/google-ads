/** The input-format matrix — one entry per compressor page, each with its own
 * compression facts. Mirrors the format-pair / operation-matrix pattern used
 * by img-convertor/qr-tools (see docs/NEW_SITE_PLAYBOOK.md §4): pages are
 * generated from this data module via getStaticPaths(), not hand-authored
 * per page. */

export type CompressFormatCode = "jpg" | "png" | "webp";

export interface CompressFormatInfo {
  code: CompressFormatCode;
  /** Umbrella-relative slug, e.g. "jpg" → loomfile.com/compress/jpg. Kept to a
   * single word since the /compress base path already establishes context. */
  slug: string;
  label: string;
  mimeType: string;
  /** Whether a quality setting has any effect for this format. PNG is
   * lossless, so its "compression" is re-encoding only. */
  isLossy: boolean;
  /** Typical size reduction achievable at default settings — shown in copy,
   * not measured live. */
  typicalReduction: string;
  description: string;
  whyCompress: string[];
}

export const COMPRESS_FORMATS: Record<CompressFormatCode, CompressFormatInfo> = {
  jpg: {
    code: "jpg",
    slug: "jpg",
    label: "JPG",
    mimeType: "image/jpeg",
    isLossy: true,
    typicalReduction: "40-70%",
    description:
      "JPG (JPEG) is the most common photo format on the web, using lossy compression that trades a small amount of detail for a much smaller file.",
    whyCompress: [
      "Photos straight from a phone or camera are often 3-10MB — far larger than needed for web pages, email, or messaging.",
      "Lowering the quality setting re-encodes a JPG with more aggressive compression, usually cutting file size dramatically before quality loss becomes visible.",
    ],
  },
  png: {
    code: "png",
    slug: "png",
    label: "PNG",
    mimeType: "image/png",
    isLossy: false,
    typicalReduction: "0-20%",
    description:
      "PNG uses lossless compression, which preserves every pixel exactly — ideal for screenshots, logos, and graphics with sharp edges or transparency, but it produces larger files than lossy formats for photographic content.",
    whyCompress: [
      "PNG has no lossy quality knob, so this tool re-encodes it losslessly — this can still shave off bytes if the original file wasn't optimally compressed, but reductions are typically small.",
      "If you need a much smaller file and can accept some quality loss, compressing as JPG or WEBP instead will usually shrink it far more than any lossless re-encode.",
    ],
  },
  webp: {
    code: "webp",
    slug: "webp",
    label: "WEBP",
    mimeType: "image/webp",
    isLossy: true,
    typicalReduction: "50-80%",
    description:
      "WEBP is a modern format supporting both lossy and lossless compression, generally producing smaller files than JPG or PNG at equivalent visual quality.",
    whyCompress: [
      "WEBP's lossy mode is even more efficient than JPG's, so lowering the quality setting here often yields the smallest file of the three formats for the same visual result.",
      "Nearly every modern browser supports WEBP natively, making it a safe choice for web images that need to load fast.",
    ],
  },
};

export const COMPRESS_FORMAT_LIST = Object.values(COMPRESS_FORMATS);

export function getCompressFormatBySlug(slug: string): CompressFormatInfo | undefined {
  return COMPRESS_FORMAT_LIST.find((f) => f.slug === slug);
}
