/** User's subscription to an Agent Marketplace listing (demo; in-memory). */
export interface MarketplaceSubscription {
  id: string;
  avatarId: string;
  avatarName: string;
  marketplaceKind: "individual" | "enterprise";
  pricingTier: "free" | "paid";
  /** Monthly price in MYR when pricingTier is paid */
  priceMonthlyMyr?: number;
  subscribedAt: string;
}
