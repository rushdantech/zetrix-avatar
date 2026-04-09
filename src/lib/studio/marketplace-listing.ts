import { mockStudioEntities } from "@/data/studio/mock-avatars";
import type { PersonaSettings } from "@/lib/mock-data";
import type { MarketplaceSubscription } from "@/types/marketplace";
import type { StudioEntity, StudioEntityEnterprise, StudioEntityIndividual } from "@/types/studio";
import {
  publishedEnterpriseEntitiesToMarketplaceCards,
  studioEnterpriseToListingCard,
  YOUR_ENTERPRISE_MARKETPLACE_ORDER,
} from "@/lib/studio/enterprise-marketplace-cards";
import {
  ekycPublisherNameFromSetup,
  publishedIndividualEntitiesToMarketplaceCards,
  studioIndividualToListingCard,
} from "@/lib/studio/individual-marketplace-cards";

export const JOB_AGENT_AVATAR_ID = "job-agent";

/** Default catalog rows shipped with the app (not third-party marketplace listings). */
export const PLATFORM_BUNDLED_STUDIO_IDS: ReadonlySet<string> = new Set(
  mockStudioEntities.map((e) => e.id),
);

export function isPlatformBundledStudioId(id: string): boolean {
  return PLATFORM_BUNDLED_STUDIO_IDS.has(id);
}

/** Stable id when showing the dashboard persona as a chat row (no studio row yet). */
export const DASHBOARD_PRIMARY_AVATAR_ID = "user-dashboard-primary-avatar";

export function dashboardPrimaryPersonaListingCard(persona: PersonaSettings): MarketplaceListingCard {
  return {
    id: DASHBOARD_PRIMARY_AVATAR_ID,
    name: persona.name.trim() || "My avatar",
    bio: (persona.bio || persona.name || "Your dashboard avatar.").slice(0, 220),
    isYours: true,
    marketplaceKind: "individual",
    pricingTier: "free",
    category: "persona",
  };
}

/** Card shape for Marketplace chat sidebar and browse listings. */
export interface MarketplaceListingCard {
  id: string;
  name: string;
  bio: string;
  isYours: boolean;
  category?: string;
  isJobAgent?: boolean;
  marketplaceKind: "individual" | "enterprise";
  pricingTier: "free" | "paid";
  priceMonthlyMyr?: number;
  /** MyDigital ID eKYC completed — show Verified on marketplace avatar UI. */
  ekycVerified?: boolean;
  /** Holder name from MyKad VC (`credentialSubject.fullName`) for Publisher line. */
  ekycPublisherName?: string;
}

/** Third-party style listings (not from studio catalog). */
export const BROWSE_EXTRA_INDIVIDUALS: MarketplaceListingCard[] = [
  {
    id: "pop-chloe-2025",
    name: "Chloe - Miss Universe Malaysia 2025",
    bio: "Poised public-facing avatar for social campaigns, brand storytelling, and confident audience engagement.",
    isYours: false,
    category: "Influencers",
    marketplaceKind: "individual",
    pricingTier: "free",
    ekycVerified: true,
    ekycPublisherName: "Chloe Wong",
  },
  {
    id: "pop-lizzie-2025",
    name: "Lizzie - Miss Universe Hong Kong 2025",
    bio: "Elegant lifestyle and outreach avatar for community interactions, media replies, and polished social communication.",
    isYours: false,
    category: "Influencers",
    marketplaceKind: "individual",
    pricingTier: "free",
  },
];

export const BROWSE_EXTRA_ENTERPRISES: MarketplaceListingCard[] = [
  {
    id: "pop-e1",
    name: "SSM Filing Assistant",
    bio: "Annual returns and company updates.",
    isYours: false,
    category: "Compliance",
    marketplaceKind: "enterprise",
    pricingTier: "paid",
    priceMonthlyMyr: 149,
  },
  {
    id: "pop-e2",
    name: "Payroll Reconciliation Bot",
    bio: "Vendor payments and invoice matching.",
    isYours: false,
    category: "Finance",
    marketplaceKind: "enterprise",
    pricingTier: "paid",
    priceMonthlyMyr: 199,
  },
];

function dedupeById<T extends { id: string }>(primary: T[], secondary: T[]): T[] {
  const ids = new Set(primary.map((x) => x.id));
  return [...primary, ...secondary.filter((x) => !ids.has(x.id))];
}

/** Your avatars from Avatar Studio (any publish status), for browse “My” section and chat sidebar. */
export function myStudioBrowseIndividualCards(userEntities: StudioEntity[]): MarketplaceListingCard[] {
  const mine = userEntities.filter((e): e is StudioEntityIndividual => e.type === "individual");
  return [...mine.map((e) => studioIndividualToListingCard(e) as MarketplaceListingCard)].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

/** App-shipped avatars from merged catalog (Work, Romance, etc.) — always yours for chat, not “other creators”. */
export function platformBundledIndividualCardsFromMerged(merged: StudioEntity[]): MarketplaceListingCard[] {
  const rows = merged.filter(
    (e): e is StudioEntityIndividual =>
      e.type === "individual" && PLATFORM_BUNDLED_STUDIO_IDS.has(e.id),
  );
  return [...rows.map((e) => studioIndividualToListingCard(e) as MarketplaceListingCard)].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

/** App-shipped agents (e.g. Job Application Agent) from merged catalog. */
export function platformBundledEnterpriseCardsFromMerged(merged: StudioEntity[]): MarketplaceListingCard[] {
  const rows = merged.filter(
    (e): e is StudioEntityEnterprise =>
      e.type === "enterprise" && PLATFORM_BUNDLED_STUDIO_IDS.has(e.id),
  );
  const order = YOUR_ENTERPRISE_MARKETPLACE_ORDER as readonly string[];
  return [...rows.map((e) => studioEnterpriseToListingCard(e) as MarketplaceListingCard)].sort((a, b) => {
    const ia = order.indexOf(a.id);
    const ib = order.indexOf(b.id);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    return a.name.localeCompare(b.name);
  });
}

/**
 * Your studio individuals + platform-bundled catalog avatars; if still empty, dashboard persona when onboarded.
 */
export function deriveMyIndividualMarketplaceCards(
  userEntities: StudioEntity[],
  merged: StudioEntity[],
  onboardingComplete: boolean,
  persona: PersonaSettings,
): MarketplaceListingCard[] {
  const userCards = myStudioBrowseIndividualCards(userEntities);
  const platformCards = platformBundledIndividualCardsFromMerged(merged);
  const combined = dedupeById(userCards, platformCards);
  if (combined.length > 0) {
    return [...combined].sort((a, b) => a.name.localeCompare(b.name));
  }
  if (onboardingComplete && persona.name?.trim()) {
    return [dashboardPrimaryPersonaListingCard(persona)];
  }
  return [];
}

/** Your agents + platform-bundled catalog agents (job-agent, mock org agents, …). */
export function deriveMyEnterpriseMarketplaceCards(
  userEntities: StudioEntity[],
  merged: StudioEntity[],
): MarketplaceListingCard[] {
  const userCards = myStudioBrowseEnterpriseCards(userEntities);
  const platformCards = platformBundledEnterpriseCardsFromMerged(merged);
  const combined = dedupeById(userCards, platformCards);
  const order = YOUR_ENTERPRISE_MARKETPLACE_ORDER as readonly string[];
  return [...combined].sort((a, b) => {
    const ia = order.indexOf(a.id);
    const ib = order.indexOf(b.id);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    return a.name.localeCompare(b.name);
  });
}

/** Your agents from Agent Studio (any publish status). */
export function myStudioBrowseEnterpriseCards(userEntities: StudioEntity[]): MarketplaceListingCard[] {
  const mine = userEntities.filter((e): e is StudioEntityEnterprise => e.type === "enterprise");
  const order = YOUR_ENTERPRISE_MARKETPLACE_ORDER as readonly string[];
  return [...mine.map((e) => studioEnterpriseToListingCard(e) as MarketplaceListingCard)].sort((a, b) => {
    const ia = order.indexOf(a.id);
    const ib = order.indexOf(b.id);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    return a.name.localeCompare(b.name);
  });
}

/** Third-party listings only: not your studio rows and not app-bundled catalog (Work, job-agent, …). */
export function subscribeBrowseIndividuals(merged: StudioEntity[], userEntityIds: Set<string>): MarketplaceListingCard[] {
  return browseCatalogIndividuals(merged).filter(
    (c) => !userEntityIds.has(c.id) && !PLATFORM_BUNDLED_STUDIO_IDS.has(c.id),
  );
}

export function subscribeBrowseEnterprises(merged: StudioEntity[], userEntityIds: Set<string>): MarketplaceListingCard[] {
  return browseCatalogEnterprises(merged).filter(
    (c) => !userEntityIds.has(c.id) && !PLATFORM_BUNDLED_STUDIO_IDS.has(c.id),
  );
}

/** Chat card for a listing the user created (any status; no subscription row required). */
export function ownedEntityToSidebarCard(entity: StudioEntity): MarketplaceListingCard | null {
  if (entity.type === "individual") {
    return studioIndividualToListingCard(entity) as MarketplaceListingCard;
  }
  if (entity.type === "enterprise") {
    return studioEnterpriseToListingCard(entity) as MarketplaceListingCard;
  }
  return null;
}

/** All published individuals + extra browse rows, for subscribe UI. */
export function browseCatalogIndividuals(merged: StudioEntity[]): MarketplaceListingCard[] {
  const fromStudio = publishedIndividualEntitiesToMarketplaceCards(merged).map((c) => ({
    ...c,
    isYours: false as const,
  }));
  const mergedList = dedupeById(fromStudio, BROWSE_EXTRA_INDIVIDUALS);
  mergedList.sort((a, b) => a.name.localeCompare(b.name));
  return mergedList;
}

/** All published enterprise agents + extra browse rows. */
export function browseCatalogEnterprises(merged: StudioEntity[]): MarketplaceListingCard[] {
  const fromStudio = publishedEnterpriseEntitiesToMarketplaceCards(merged).map((c) => ({
    ...c,
    isYours: false as const,
  }));
  const mergedList = dedupeById(fromStudio, BROWSE_EXTRA_ENTERPRISES);
  const order = YOUR_ENTERPRISE_MARKETPLACE_ORDER as readonly string[];
  mergedList.sort((a, b) => {
    const ia = order.indexOf(a.id);
    const ib = order.indexOf(b.id);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    return a.name.localeCompare(b.name);
  });
  return mergedList;
}

/** Chat sidebar: your published listings first, then other subscriptions (no duplicate ids). */
export function mergeMineThenSubscribedLists(
  mine: MarketplaceListingCard[],
  fromSubscriptions: MarketplaceListingCard[],
): MarketplaceListingCard[] {
  const mineIds = new Set(mine.map((c) => c.id));
  return [...mine, ...fromSubscriptions.filter((c) => !mineIds.has(c.id))];
}

/** Sidebar chat row: metadata from subscription + optional studio entity for bio. */
export function subscriptionToSidebarCard(
  sub: MarketplaceSubscription,
  merged: StudioEntity[],
): MarketplaceListingCard {
  const entity = merged.find((e) => e.id === sub.avatarId);
  const bioFromSetup =
    entity?.type === "individual" ? entity.individualSetup.bio : "";
  const bio = (entity?.description || bioFromSetup || sub.avatarName).slice(0, 220);
  const ekycVerified =
    entity?.type === "individual" &&
    Boolean(
      entity.individualSetup.mydigitalEkycVerified &&
        entity.individualSetup.zetrixDid &&
        entity.individualSetup.mykadVc,
    );
  const ekycPublisherName =
    entity?.type === "individual" && ekycVerified
      ? ekycPublisherNameFromSetup(entity.individualSetup)
      : undefined;
  return {
    id: sub.avatarId,
    name: sub.avatarName,
    bio,
    isYours: true,
    category: sub.category,
    isJobAgent: sub.avatarId === JOB_AGENT_AVATAR_ID,
    marketplaceKind: sub.marketplaceKind,
    pricingTier: sub.pricingTier,
    priceMonthlyMyr: sub.priceMonthlyMyr,
    ...(ekycVerified ? { ekycVerified: true, ekycPublisherName } : {}),
  };
}
