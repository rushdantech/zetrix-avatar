import type { MarketplaceListingCard } from "@/lib/studio/marketplace-listing";

/** Extra browse-style rows for Avatar Match demos (names from PRD examples). */
export const AVATAR_MATCH_SHOWCASE_LISTINGS: MarketplaceListingCard[] = [
  {
    id: "avatar-match-luna",
    name: "Luna",
    bio: "Warm, creative companion-style avatar for storytelling, daily check-ins, and expressive chat.",
    isYours: false,
    category: "Lifestyle",
    marketplaceKind: "individual",
    pricingTier: "free",
  },
  {
    id: "avatar-match-kai",
    name: "Kai",
    bio: "Calm, analytical tone for productivity nudges, planning, and structured conversations.",
    isYours: false,
    category: "Professional",
    marketplaceKind: "individual",
    pricingTier: "free",
  },
  {
    id: "avatar-match-zara",
    name: "Zara",
    bio: "Bold energy for social campaigns, quick replies, and high-engagement audience voice.",
    isYours: false,
    category: "Influencers",
    marketplaceKind: "individual",
    pricingTier: "free",
  },
];
