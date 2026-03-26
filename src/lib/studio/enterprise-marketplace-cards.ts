import type { StudioEntity, StudioEntityEnterprise } from "@/types/studio";

/** Display order for enterprise listings (browse + sidebar). */
export const YOUR_ENTERPRISE_MARKETPLACE_ORDER = [
  "job-agent",
  "agent_04",
  "agent_01",
  "agent_02",
  "agent_03",
] as const;

const PRICING: Record<string, { tier: "free" | "paid"; priceMonthlyMyr?: number }> = {
  "job-agent": { tier: "free" },
  agent_04: { tier: "free" },
  agent_01: { tier: "paid", priceMonthlyMyr: 99 },
  agent_02: { tier: "paid", priceMonthlyMyr: 199 },
  agent_03: { tier: "paid", priceMonthlyMyr: 149 },
};

export interface EnterpriseMarketplaceAvatarCard {
  id: string;
  name: string;
  bio: string;
  isYours: true;
  isJobAgent?: boolean;
  marketplaceKind: "enterprise";
  pricingTier: "free" | "paid";
  priceMonthlyMyr?: number;
}

function orderIndex(id: string): number {
  const i = (YOUR_ENTERPRISE_MARKETPLACE_ORDER as readonly string[]).indexOf(id);
  return i === -1 ? 999 : i;
}

/** Published enterprise studio entities → marketplace sidebar cards. */
export function publishedEnterpriseEntitiesToMarketplaceCards(
  entities: StudioEntity[],
): EnterpriseMarketplaceAvatarCard[] {
  const published = entities.filter(
    (e): e is StudioEntityEnterprise => e.type === "enterprise" && e.status === "published",
  );
  published.sort((a, b) => {
    const d = orderIndex(a.id) - orderIndex(b.id);
    if (d !== 0) return d;
    return a.name.localeCompare(b.name);
  });
  return published.map((e) => {
    const p = PRICING[e.id] ?? { tier: "free" as const };
    return {
      id: e.id,
      name: e.name,
      bio: e.description,
      isYours: true,
      isJobAgent: e.id === "job-agent",
      marketplaceKind: "enterprise",
      pricingTier: p.tier,
      priceMonthlyMyr: p.priceMonthlyMyr,
    };
  });
}
