export type MarketplaceLongMockVariant = 1 | 2 | 3;

/** Long plain assistant text when the message includes “long response” (overflow QA). */
export function buildLongMarketplaceAssistantText(variant: MarketplaceLongMockVariant, seed: string): string {
  const line = (i: number) =>
    `${i}. Mock assistant line — ${seed.slice(0, 60)}${seed.length > 60 ? "…" : ""} (variant ${variant}).`;
  const counts = { 1: 55, 2: 48, 3: 62 } as const;
  const n = counts[variant];
  return `Mock long reply (${variant})\n\n${Array.from({ length: n }, (_, i) => line(i + 1)).join("\n")}`;
}
