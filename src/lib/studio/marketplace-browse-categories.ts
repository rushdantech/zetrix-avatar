import { DASHBOARD_PRIMARY_AVATAR_ID, JOB_AGENT_AVATAR_ID } from "@/lib/studio/marketplace-listing";
import type { MarketplaceListingCard } from "@/lib/studio/marketplace-listing";
import type { MarketplaceBrowseSegment } from "@/types/studio";

export type BrowseAvatarSegment = MarketplaceBrowseSegment;

/** Browse Avatars tab: Public / Company / Social / Premium (creator-assigned or inferred). */
export const BROWSE_AVATAR_SEGMENT_ORDER: readonly BrowseAvatarSegment[] = [
  "Public figures",
  "Company avatars",
  "Social avatars",
  "Premium avatars",
];

const PUBLIC_FIGURE_IDS = new Set<string>(["pop-chloe-2025", "pop-lizzie-2025"]);

const COMPANY_SERVICE_INDIVIDUAL_IDS = new Set<string>([JOB_AGENT_AVATAR_ID, "zetrix-ai-avatar-myeg"]);

/** Avatar taxonomy: companionship, romance, work, creators, etc. */
export const AVATAR_BROWSE_SECTION_ORDER = [
  "Companion",
  "Romance & dating",
  "Professional",
  "Lifestyle & coaching",
  "Idol & creator",
  "Tech & learning",
  "Other",
] as const;

/** Agent taxonomy: finance, public sector, people ops, etc. */
export const AGENT_BROWSE_SECTION_ORDER = [
  "Talent & HR",
  "Finance",
  "Government & compliance",
  "Health & wellness",
  "Operations & IT",
  "Other",
] as const;

const AVATAR_CATEGORY_BY_ID: Record<string, string> = {
  avatar_01: "Professional",
  avatar_02: "Companion",
  avatar_03: "Companion",
  avatar_04: "Professional",
  avatar_05: "Romance & dating",
  [DASHBOARD_PRIMARY_AVATAR_ID]: "Companion",
  "pop-1": "Idol & creator",
  "pop-2": "Lifestyle & coaching",
  "pop-3": "Tech & learning",
};

const AGENT_CATEGORY_BY_ID: Record<string, string> = {
  "job-agent": "Talent & HR",
  "job-application-agent-v2": "Talent & HR",
  agent_01: "Government & compliance",
  agent_02: "Finance",
  agent_03: "Government & compliance",
  agent_04: "Talent & HR",
  "pop-e1": "Government & compliance",
  "pop-e2": "Finance",
};

const STUDIO_STATUS_CATEGORIES = new Set(["draft", "active", "published", "archived", "persona"]);

function inferAvatarBrowseCategory(card: MarketplaceListingCard): string {
  const n = card.name.toLowerCase();
  const b = card.bio.toLowerCase();
  if (/date|romance|love|partner|relationship/.test(n + b)) return "Romance & dating";
  if (/friend|family|companion|home/.test(n + b)) return "Companion";
  if (/coach|mentor|wellness|lifestyle|growth/.test(n + b)) return "Lifestyle & coaching";
  if (/idol|creator|influencer|fan|stream/.test(n + b)) return "Idol & creator";
  if (/tech|code|dev|engineer|learn|tutorial/.test(n + b)) return "Tech & learning";
  if (/work|professional|office|career|business|customer|client/.test(n + b)) return "Professional";
  return "Other";
}

function inferAgentBrowseCategory(card: MarketplaceListingCard): string {
  const n = card.name.toLowerCase();
  const b = card.bio.toLowerCase();
  if (/health|medical|patient|clinical|care|pharma/.test(n + b)) return "Health & wellness";
  if (/tax|ssm|government|compliance|bnm|lhdn|regulator|filing|permit/.test(n + b))
    return "Government & compliance";
  if (/payroll|payment|finance|invoice|treasury|accounting|reconcil/.test(n + b)) return "Finance";
  if (/hr|onboard|talent|job|recruit|career|people|payroll bot/.test(n + b)) return "Talent & HR";
  if (/ops|it|infra|support|ticket|internal/.test(n + b)) return "Operations & IT";
  return "Other";
}

/** Short chip label for a browse segment. */
export function browseAvatarSegmentChipLabel(segment: BrowseAvatarSegment): string {
  const labels: Record<BrowseAvatarSegment, string> = {
    "Public figures": "Public",
    "Company avatars": "Company",
    "Social avatars": "Social",
    "Premium avatars": "Premium",
  };
  return labels[segment];
}

export function isMarketplaceListingFeatured(card: MarketplaceListingCard): boolean {
  return card.marketplaceFeatured === true;
}

/** Segment for Marketplace Browse Avatars (explicit creator segment, else inferred). */
export function browseAvatarSegmentForListing(card: MarketplaceListingCard): BrowseAvatarSegment {
  if (card.marketplaceBrowseSegment) return card.marketplaceBrowseSegment;
  if (card.pricingTier === "paid") return "Premium avatars";
  if (PUBLIC_FIGURE_IDS.has(card.id)) return "Public figures";
  if (card.marketplaceKind === "enterprise") return "Company avatars";
  if (COMPANY_SERVICE_INDIVIDUAL_IDS.has(card.id)) return "Company avatars";
  return "Social avatars";
}

/** Stable browse label for marketplace grouping and chips. */
export function browseCategoryForListing(card: MarketplaceListingCard): string {
  if (card.category && !STUDIO_STATUS_CATEGORIES.has(card.category.toLowerCase())) {
    return card.category;
  }
  if (card.marketplaceKind === "individual") {
    return AVATAR_CATEGORY_BY_ID[card.id] ?? inferAvatarBrowseCategory(card);
  }
  return AGENT_CATEGORY_BY_ID[card.id] ?? inferAgentBrowseCategory(card);
}

export function groupListingsByBrowseCategory(
  cards: MarketplaceListingCard[],
  sectionOrder: readonly string[],
): { category: string; items: MarketplaceListingCard[] }[] {
  const map = new Map<string, MarketplaceListingCard[]>();
  for (const c of cards) {
    const cat = browseCategoryForListing(c);
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(c);
  }
  for (const items of map.values()) {
    items.sort((a, b) => a.name.localeCompare(b.name));
  }
  const out: { category: string; items: MarketplaceListingCard[] }[] = [];
  const seen = new Set<string>();
  for (const cat of sectionOrder) {
    const items = map.get(cat);
    if (items?.length) {
      out.push({ category: cat, items });
      seen.add(cat);
    }
  }
  for (const [category, items] of map) {
    if (!seen.has(category) && items.length) {
      out.push({ category, items });
    }
  }
  return out;
}
