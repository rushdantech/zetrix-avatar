/**
 * Deterministic mock compatibility scores for Avatar Match.
 * Replace with harness / embedding comparison when backend is ready.
 */
export type MatchQualityLabel = "High Match" | "Good Match" | "Moderate Match";

/** Stable integer in [60, 98] for the pair (source avatar, marketplace listing). */
export function stableMockMatchPercent(sourceAvatarId: string, marketplaceAvatarId: string): number {
  let h = 2166136261;
  const str = `${sourceAvatarId}::${marketplaceAvatarId}`;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const u = Math.abs(h) % 3901;
  return Math.min(98, 60 + Math.floor((u / 3900) * 39));
}

export function matchQualityLabel(percent: number): MatchQualityLabel {
  if (percent >= 85) return "High Match";
  if (percent >= 72) return "Good Match";
  return "Moderate Match";
}
