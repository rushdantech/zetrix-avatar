import type { StudioEntity } from "@/types/studio";
import { browseCatalogIndividuals, type MarketplaceListingCard } from "@/lib/studio/marketplace-listing";
import { AVATAR_MATCH_SHOWCASE_LISTINGS } from "@/data/avatar-match/extra-showcase-listings";

function dedupeById<T extends { id: string }>(primary: T[], secondary: T[]): T[] {
  const ids = new Set(primary.map((x) => x.id));
  return [...primary, ...secondary.filter((x) => !ids.has(x.id))];
}

/**
 * All marketplace individual listings used for matching, plus showcase rows.
 * Excludes the user's selected avatar so they never match against themselves.
 */
export function listingsForAvatarMatch(merged: StudioEntity[], excludeAvatarId: string | null): MarketplaceListingCard[] {
  const fromCatalog = browseCatalogIndividuals(merged);
  const combined = dedupeById(AVATAR_MATCH_SHOWCASE_LISTINGS, fromCatalog);
  if (!excludeAvatarId) return combined;
  return combined.filter((c) => c.id !== excludeAvatarId);
}
