/** Minimum digit length to treat as a plausible E.164 body (not counting country code). */
const MIN_WA_DIGITS = 8;
const MAX_WA_DIGITS = 15;

/**
 * Strips to digits. Returns null if the result is not a valid WhatsApp `wa.me` number length.
 * Accepts +60…, 60…, spaces, dashes.
 */
export function digitsForWhatsAppLink(input: string | undefined | null): string | null {
  if (!input) return null;
  const d = input.replace(/\D/g, "");
  if (d.length < MIN_WA_DIGITS || d.length > MAX_WA_DIGITS) return null;
  return d;
}

export function whatsAppWebUrl(digits: string): `https://wa.me/${string}` {
  return `https://wa.me/${digits}`;
}

/**
 * Show user-entered number with light formatting; falls back to digits only.
 */
export function displayPhoneLabel(input: string, digits: string): string {
  const t = input.trim();
  if (t.length > 0) return t;
  if (digits.length > 4) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`.trim();
  }
  return digits;
}
