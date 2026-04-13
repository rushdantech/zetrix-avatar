import type { SubscriptionPlan } from "@/types/billing";

/**
 * Mock billing: Pro access follows the saved plan only (no calendar expiry).
 * `proAccessExpiresAt` is kept for persisted shape / optional UI but is not used for gating.
 */
export function isProSubscriptionActive(
  subscriptionPlan: SubscriptionPlan,
  _proAccessExpiresAt?: string | null,
): boolean {
  return subscriptionPlan === "pro";
}
