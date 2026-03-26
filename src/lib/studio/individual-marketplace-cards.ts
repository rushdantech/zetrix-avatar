import type { StudioEntity, StudioEntityIndividual } from "@/types/studio";

/** One user-owned avatar row (any publish status). `category` holds status for UI chips. */
export function studioIndividualToListingCard(e: StudioEntityIndividual) {
  return {
    id: e.id,
    name: e.name,
    bio: (e.description || e.individualSetup.bio).slice(0, 220),
    isYours: true as const,
    marketplaceKind: "individual" as const,
    pricingTier: "free" as const,
    category: e.status,
  };
}

/** Published individual studio entities → Marketplace “Your avatars” sidebar cards. */
export function publishedIndividualEntitiesToMarketplaceCards(entities: StudioEntity[]) {
  const published = entities.filter(
    (e): e is StudioEntityIndividual => e.type === "individual" && e.status === "published",
  );
  published.sort((a, b) => a.name.localeCompare(b.name));
  return published.map((e) => ({
    id: e.id,
    name: e.name,
    bio: e.description,
    isYours: true as const,
    marketplaceKind: "individual" as const,
    pricingTier: "free" as const,
  }));
}
