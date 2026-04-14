import type { MarketplaceListingCard } from "@/lib/studio/marketplace-listing";
import {
  browseAvatarSegmentChipLabel,
  browseAvatarSegmentForListing,
} from "@/lib/studio/marketplace-browse-categories";

/** Profile popup payload — exactly five conceptual fields for the Discover listing UI. */
export type AvatarProfileData = {
  name: string;
  description?: string;
  /** MyDigital eKYC — shown as Verified / Not Verified for individuals; enterprise listings omit eKYC. */
  verified: boolean;
  publisher?: string;
  /** Browse segment chip, e.g. Public, Company, Social, Premium. */
  category?: string;
};

export const MOCK_AVATAR_PROFILE: AvatarProfileData = {
  name: "Avery Chen",
  description:
    "Friendly productivity companion for daily planning, light research, and keeping conversations organized across your teams and personal projects.",
  verified: true,
  publisher: "TS Wong",
  category: "Social",
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
