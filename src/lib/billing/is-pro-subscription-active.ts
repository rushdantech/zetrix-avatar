import type { SubscriptionPlan } from "@/types/billing";

/** True when Pro is paid and the current period end is in the future (finite, valid date). */
export function isProSubscriptionActive(
  subscriptionPlan: SubscriptionPlan,
  proAccessExpiresAt: string | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (subscriptionPlan !== "pro" || proAccessExpiresAt == null || proAccessExpiresAt === "") {
    return false;
  }
  const endMs = new Date(proAccessExpiresAt).getTime();
  if (!Number.isFinite(endMs)) return false;
  return endMs > nowMs;
}
