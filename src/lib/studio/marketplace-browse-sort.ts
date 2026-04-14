import type { MarketplaceListingCard } from "@/lib/studio/marketplace-listing";
import type { StudioEntity } from "@/types/studio";

export type BrowseListingSort = "default" | "newest" | "oldest" | "name-az" | "verified";

/** Best-effort “listed at” time for ordering (studio rows use published/created; mock-only cards get a stable synthetic time). */
export function listingRecencyTimestampMs(card: MarketplaceListingCard, merged: StudioEntity[]): number {
  const e = merged.find((x) => x.id === card.id);
  if (e) {
    const iso = e.published_at || e.created_at;
    const t = Date.parse(iso);
    if (Number.isFinite(t)) return t;
  }
  let h = 2166136261;
  for (let i = 0; i < card.id.length; i++) {
    h ^= card.id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const spread = Math.abs(h) % 400;
  return Date.UTC(2024, 0, 1) + spread * 86400000;
}

export function sortBrowseListingCards(
  cards: MarketplaceListingCard[],
  sort: BrowseListingSort,
  merged: StudioEntity[],
): MarketplaceListingCard[] {
  if (sort === "default") return [...cards];

  const out = [...cards];
  if (sort === "name-az") {
    out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }
  if (sort === "verified") {
    out.sort((a, b) => {
      const va = a.ekycVerified === true ? 1 : 0;
      const vb = b.ekycVerified === true ? 1 : 0;
      if (vb !== va) return vb - va;
      return a.name.localeCompare(b.name);
    });
    return out;
  }
  if (sort === "newest" || sort === "oldest") {
    const newest = sort === "newest";
    out.sort((a, b) => {
      const ta = listingRecencyTimestampMs(a, merged);
      const tb = listingRecencyTimestampMs(b, merged);
      const cmp = newest ? tb - ta : ta - tb;
      if (cmp !== 0) return cmp;
      return a.name.localeCompare(b.name);
    });
    return out;
  }
  return out;
}
