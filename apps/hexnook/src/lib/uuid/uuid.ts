export interface UuidFormatOptions {
  uppercase: boolean;
  stripHyphens: boolean;
}

/** Wraps the native, cryptographically secure crypto.randomUUID() — no
 *  library needed for v4 (see docs/NEW_SITE_PLAYBOOK.md discussion in the
 *  hexnook plan: v1/v5/v7 would require a dependency, so this tool is
 *  intentionally v4-only). */
export function generateUuidV4(): string {
  return crypto.randomUUID();
}

export function formatUuid(uuid: string, { uppercase, stripHyphens }: UuidFormatOptions): string {
  const value = stripHyphens ? uuid.replace(/-/g, "") : uuid;
  return uppercase ? value.toUpperCase() : value;
}
