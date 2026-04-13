import type { MarketplaceListingCard } from "@/lib/studio/marketplace-listing";

/** Top spotlight slot in Browse → Featured. */
export const HERO_FEATURED_COUNT = 1;

/** Max promoted secondary cards (below hero). */
export const SECONDARY_FEATURED_MAX = 5;

/** Max total avatars in the curated hero + secondary block (1 hero + up to 5 secondaries). */
export const MAX_FEATURED_PROMOTED = HERO_FEATURED_COUNT + SECONDARY_FEATURED_MAX;

/**
 * Temporary fallback priorities when `marketplaceFeaturedPriority` is unset (e.g. backend not ready).
 * Higher = shown first. Replace with API values later.
 */
const FEATURED_PRIORITY_FALLBACK_BY_ID: Readonly<Record<string, number>> = {
  "pop-chloe-2025": 520,
  "job-agent": 500,
  "zetrix-ai-avatar-myeg": 480,
  "pop-lizzie-2025": 460,
  "pop-e1": 440,
  "pop-e2": 420,
};

/** Effective sort key for featured ordering (explicit priority wins, else mock map, else 0). */
export function effectiveFeaturedPriority(card: MarketplaceListingCard): number {
  if (typeof card.marketplaceFeaturedPriority === "number" && !Number.isNaN(card.marketplaceFeaturedPriority)) {
    return card.marketplaceFeaturedPriority;
  }
  return FEATURED_PRIORITY_FALLBACK_BY_ID[card.id] ?? 0;
}

export function compareFeaturedListingPriority(a: MarketplaceListingCard, b: MarketplaceListingCard): number {
  const d = effectiveFeaturedPriority(b) - effectiveFeaturedPriority(a);
  if (d !== 0) return d;
  return a.name.localeCompare(b.name);
}

export function sortFeaturedListingsByPriority(list: MarketplaceListingCard[]): MarketplaceListingCard[] {
  return [...list].sort(compareFeaturedListingPriority);
}

export function partitionFeaturedCurated(sortedFeatured: MarketplaceListingCard[]): {
  hero: MarketplaceListingCard | null;
  secondary: MarketplaceListingCard[];
  remainder: MarketplaceListingCard[];
} {
  if (sortedFeatured.length === 0) {
    return { hero: null, secondary: [], remainder: [] };
  }
  const hero = sortedFeatured[0];
  const capSecondary = Math.min(SECONDARY_FEATURED_MAX, MAX_FEATURED_PROMOTED - HERO_FEATURED_COUNT);
  const secondary = sortedFeatured.slice(1, 1 + capSecondary);
  const remainder = sortedFeatured.slice(1 + secondary.length);
  return { hero, secondary, remainder };
}

/** Short line for hero/promo (optional editorial hook on card, else bio). */
export function featuredPromotionalHook(card: MarketplaceListingCard): string {
  const hook = card.marketplaceFeaturedHook?.trim();
  if (hook) return hook;
  return card.bio.trim();
}
