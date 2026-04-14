import type { MarketplaceListingCard } from "@/lib/studio/marketplace-listing";
import {
  browseAvatarSegmentChipLabel,
  browseAvatarSegmentForListing,
} from "@/lib/studio/marketplace-browse-categories";

/** Profile popup payload — five primary fields plus optional mock cover art for Featured spotlight. */
export type AvatarProfileData = {
  name: string;
  description?: string;
  /** MyDigital eKYC — shown as Verified / Not Verified for individuals; enterprise listings omit eKYC. */
  verified: boolean;
  publisher?: string;
  /** Browse segment chip, e.g. Public, Company, Social, Premium. */
  category?: string;
  /** Mock hero image (Featured browse only). */
  coverPlaceholderSrc?: string;
};

function stableIndexFromId(id: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h << 5) - h + id.charCodeAt(i);
  return Math.abs(h) % modulo;
}

/** Rotates between bundled SVG placeholders for Featured profile preview. */
export function featuredCoverPlaceholderSrc(listingId: string): string {
  const i = stableIndexFromId(listingId, 3) + 1;
  return `/placeholders/featured-cover-${i}.svg`;
}

export const MOCK_AVATAR_PROFILE: AvatarProfileData = {
  name: "Avery Chen",
  description:
    "Friendly productivity companion for daily planning, light research, and keeping conversations organized across your teams and personal projects.",
  verified: true,
  publisher: "TS Wong",
  category: "Social",
  coverPlaceholderSrc: "/placeholders/featured-cover-1.svg",
};

export function listingCardToAvatarProfileData(card: MarketplaceListingCard): AvatarProfileData {
  const enterprise = card.marketplaceKind === "enterprise";
  const verified = !enterprise && Boolean(card.ekycVerified);
  const publisher =
    !enterprise && card.ekycPublisherName?.trim() ? card.ekycPublisherName.trim() : undefined;
  const segment = browseAvatarSegmentForListing(card);
  const category = browseAvatarSegmentChipLabel(segment);
  const description = card.bio?.trim() || undefined;

  return {
    name: card.name,
    description,
    verified,
    publisher,
    category,
  };
}

/** Featured Browse: same fields as `listingCardToAvatarProfileData` plus a mock cover image. */
export function listingCardToFeaturedProfileData(card: MarketplaceListingCard): AvatarProfileData {
  return {
    ...listingCardToAvatarProfileData(card),
    coverPlaceholderSrc: featuredCoverPlaceholderSrc(card.id),
  };
}
