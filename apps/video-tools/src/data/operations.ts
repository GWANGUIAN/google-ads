export type OperationCode = "compress" | "trim";

export interface OperationInfo {
  code: OperationCode;
  label: string;
  verb: string;
  description: string;
}

export const OPERATIONS: Record<OperationCode, OperationInfo> = {
  compress: {
    code: "compress",
    label: "Compress",
    verb: "Compress",
    description:
      "Re-encodes the video at a lower quality/bitrate (and, at lower presets, a capped resolution) to shrink the file size while keeping the same container and codec.",
  },
  trim: {
    code: "trim",
    label: "Trim",
    verb: "Trim",
    description: "Cuts the video down to a start and end time you choose, discarding everything outside that range.",
  },
};

export const OPERATION_LIST = Object.values(OPERATIONS);
