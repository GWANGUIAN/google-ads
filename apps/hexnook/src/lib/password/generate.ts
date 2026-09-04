export interface PasswordOptions {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?",
};

const AMBIGUOUS = /[Il1O0o]/g;

export function buildCharset(options: PasswordOptions): string {
  let charset = "";
  if (options.uppercase) charset += CHARSETS.uppercase;
  if (options.lowercase) charset += CHARSETS.lowercase;
  if (options.numbers) charset += CHARSETS.numbers;
  if (options.symbols) charset += CHARSETS.symbols;
  if (options.excludeAmbiguous) charset = charset.replace(AMBIGUOUS, "");
  return charset;
}

export type PasswordResult = { ok: true; value: string } | { ok: false; error: string };

/** Draws each character via rejection sampling over crypto.getRandomValues()
 *  — a naive `byte % charset.length` would bias toward earlier characters
 *  whenever charset.length doesn't evenly divide 256, which matters for a
 *  security-adjacent tool like this one. */
export function generatePassword(length: number, options: PasswordOptions): PasswordResult {
  const charset = buildCharset(options);
  if (charset.length === 0) return { ok: false, error: "Select at least one character type." };

  const maxValid = 256 - (256 % charset.length);
  const byte = new Uint8Array(1);
  let value = "";
  while (value.length < length) {
    crypto.getRandomValues(byte);
    if (byte[0] < maxValid) {
      value += charset[byte[0] % charset.length];
    }
  }
  return { ok: true, value };
}

export function estimateEntropyBits(length: number, charsetSize: number): number {
  if (charsetSize <= 1) return 0;
  return Math.round(length * Math.log2(charsetSize));
}

export type StrengthLabel = "Weak" | "Fair" | "Strong" | "Very strong";

export function strengthLabel(bits: number): StrengthLabel {
  if (bits < 40) return "Weak";
  if (bits < 60) return "Fair";
  if (bits < 80) return "Strong";
  return "Very strong";
}
