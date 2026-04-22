export type LongResponseMockVariant = 1 | 2 | 3;

/**
 * If the message contains "long response" (word boundary, case-insensitive),
 * returns stripped text for storage and a mock variant 1–3 for oversized replies.
 */
export function parseLongResponsePhrase(raw: string): {
  text: string;
  longMockVariant?: LongResponseMockVariant;
} {
  const trimmed = raw.trim();
  if (!/\blong\s+response\b/i.test(trimmed)) return { text: trimmed };
  const stripped = trimmed.replace(/\blong\s+response\b/gi, "").replace(/\s+/g, " ").trim();
  const text = stripped.length > 0 ? stripped : "—";
  const longMockVariant = ((((text.length + raw.length) % 3) + 1) as LongResponseMockVariant);
  return { text, longMockVariant };
}
