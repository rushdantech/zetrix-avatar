import Fuse from "fuse.js";
import type { MarketplaceListingCard } from "@/lib/studio/marketplace-listing";

type SearchRow = {
  card: MarketplaceListingCard;
  name: string;
  publisher: string;
  bio: string;
};

function toSearchRow(card: MarketplaceListingCard): SearchRow {
  const publisher =
    card.marketplaceKind === "individual" && card.ekycPublisherName?.trim()
      ? card.ekycPublisherName.trim()
      : "";
  return {
    card,
    name: card.name,
    publisher,
    bio: card.bio ?? "",
  };
}

/**
 * Fuzzy filter for Browse Avatars: matches on display name, publisher (eKYC holder when shown), and bio/description.
 */
export function fuzzyFilterMarketplaceListingCards(
  cards: MarketplaceListingCard[],
  rawQuery: string,
): MarketplaceListingCard[] {
  const query = rawQuery.trim();
  if (!query) return cards;

  const rows = cards.map(toSearchRow);
  const fuse = new Fuse(rows, {
    keys: [
      { name: "name", weight: 0.42 },
      { name: "publisher", weight: 0.28 },
      { name: "bio", weight: 0.3 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
  });

  return fuse.search(query).map((r) => r.item.card);
}
