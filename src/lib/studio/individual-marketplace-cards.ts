import type { IndividualAvatarSetupMock, StudioEntity, StudioEntityIndividual } from "@/types/studio";

/** MyKad VC `credentialSubject.fullName` when eKYC mock data is present. */
export function ekycPublisherNameFromSetup(setup: IndividualAvatarSetupMock): string | undefined {
  const vc = setup.mykadVc;
  if (!setup.mydigitalEkycVerified || !vc || typeof vc !== "object") return undefined;
  const cs = (vc as Record<string, unknown>).credentialSubject;
  if (!cs || typeof cs !== "object") return undefined;
  const fullName = (cs as Record<string, unknown>).fullName;
  return typeof fullName === "string" && fullName.trim() ? fullName.trim() : undefined;
}

/** True when mock MyDigital eKYC + DID + MyKad VC are present on the avatar. */
export function isIndividualEkycVerified(e: StudioEntityIndividual): boolean {
  return Boolean(
    e.individualSetup.mydigitalEkycVerified && e.individualSetup.zetrixDid && e.individualSetup.mykadVc,
  );
}

function ekycFieldsForIndividual(e: StudioEntityIndividual): {
  ekycVerified: boolean;
  ekycPublisherName?: string;
} {
  const verified = isIndividualEkycVerified(e);
  return {
    ekycVerified: verified,
    ekycPublisherName: verified ? ekycPublisherNameFromSetup(e.individualSetup) : undefined,
  };
}

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
    ...ekycFieldsForIndividual(e),
    ...(e.marketplaceBrowseSegment != null ? { marketplaceBrowseSegment: e.marketplaceBrowseSegment } : {}),
    ...(e.marketplaceFeatured != null ? { marketplaceFeatured: e.marketplaceFeatured } : {}),
    ...(e.marketplaceFeaturedPriority != null ? { marketplaceFeaturedPriority: e.marketplaceFeaturedPriority } : {}),
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
    ...ekycFieldsForIndividual(e),
    ...(e.marketplaceBrowseSegment != null ? { marketplaceBrowseSegment: e.marketplaceBrowseSegment } : {}),
    ...(e.marketplaceFeatured != null ? { marketplaceFeatured: e.marketplaceFeatured } : {}),
    ...(e.marketplaceFeaturedPriority != null ? { marketplaceFeaturedPriority: e.marketplaceFeaturedPriority } : {}),
  }));
}
