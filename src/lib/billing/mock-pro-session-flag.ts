import type { SubscriptionPlan } from "@/types/billing";
import { isProSubscriptionActive } from "@/lib/billing/is-pro-subscription-active";

const KEY = "zetrix-avatar:mockProSessionActive";

/** Set after successful mock checkout (same tab); read by guards until React state is fully in sync or session ends. */
export function setMockProSessionFlag(): void {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearMockProSessionFlag(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function isMockProSessionFlagSet(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** Pro from persisted subscription, or short-lived session flag right after mock checkout. */
export function hasActiveProAccessIncludingMockSession(
  subscriptionPlan: SubscriptionPlan,
  proAccessExpiresAt: string | null | undefined,
): boolean {
  return isProSubscriptionActive(subscriptionPlan, proAccessExpiresAt) || isMockProSessionFlagSet();
}
