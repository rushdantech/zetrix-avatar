import type { PersonaSettings } from "@/lib/mock-data";
import type { MarketplaceSubscription } from "@/types/marketplace";
import type { StudioEntity, StudioEntityEnterprise, StudioEntityIndividual } from "@/types/studio";
import {
  publishedEnterpriseEntitiesToMarketplaceCards,
  studioEnterpriseToListingCard,
  YOUR_ENTERPRISE_MARKETPLACE_ORDER,
} from "@/lib/studio/enterprise-marketplace-cards";
import {
  publishedIndividualEntitiesToMarketplaceCards,
  studioIndividualToListingCard,
} from "@/lib/studio/individual-marketplace-cards";

export const JOB_AGENT_AVATAR_ID = "job-agent";

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
}

/** Third-party style listings (not from studio catalog). */
export const BROWSE_EXTRA_INDIVIDUALS: MarketplaceListingCard[] = [
  {
    id: "pop-1",
    name: "Luna Creative",
    bio: "Visual storyteller.",
    isYours: false,
    category: "Content",
    marketplaceKind: "individual",
    pricingTier: "free",
  },
  {
    id: "pop-2",
    name: "Alex Mentor",
    bio: "Career coach.",
    isYours: false,
    category: "Lifestyle",
    marketplaceKind: "individual",
    pricingTier: "paid",
    priceMonthlyMyr: 29,
  },
  {
    id: "pop-3",
    name: "Riley Tech",
    bio: "Dev explainer.",
    isYours: false,
    category: "Tech",
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

/**
 * Studio individuals first; if none but onboarding is done, surface the dashboard persona so chat works
 * without subscribing.
 */
export function deriveMyIndividualMarketplaceCards(
  userEntities: StudioEntity[],
  onboardingComplete: boolean,
  persona: PersonaSettings,
): MarketplaceListingCard[] {
  const fromStudio = myStudioBrowseIndividualCards(userEntities);
  if (fromStudio.length > 0) return fromStudio;
  if (onboardingComplete && persona.name?.trim()) {
    return [dashboardPrimaryPersonaListingCard(persona)];
  }
  return [];
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

/** Published catalog + extras, excluding rows whose id belongs to the user’s studio entities. */
export function subscribeBrowseIndividuals(merged: StudioEntity[], userEntityIds: Set<string>): MarketplaceListingCard[] {
  return browseCatalogIndividuals(merged).filter((c) => !userEntityIds.has(c.id));
}

export function subscribeBrowseEnterprises(merged: StudioEntity[], userEntityIds: Set<string>): MarketplaceListingCard[] {
  return browseCatalogEnterprises(merged).filter((c) => !userEntityIds.has(c.id));
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
  return {
    id: sub.avatarId,
    name: sub.avatarName,
    bio,
    isYours: true,
    isJobAgent: sub.avatarId === JOB_AGENT_AVATAR_ID,
    marketplaceKind: sub.marketplaceKind,
    pricingTier: sub.pricingTier,
    priceMonthlyMyr: sub.priceMonthlyMyr,
  };
}
