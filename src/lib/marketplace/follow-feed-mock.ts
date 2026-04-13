import type { MarketplaceSubscription } from "@/types/marketplace";
import type { MarketplaceFollowUpdateFeedItem, MarketplaceFollowWhatChangedPayload } from "@/types/marketplace-follow";
import { subscriptionToSidebarCard } from "@/lib/studio/marketplace-listing";
import type { StudioEntity } from "@/types/studio";
import { isMarketplaceListingFeatured } from "@/lib/studio/marketplace-browse-categories";
import type { MarketplaceListingCard } from "@/lib/studio/marketplace-listing";

function payloadPersonalityEvolved(name: string): MarketplaceFollowWhatChangedPayload {
  return {
    title: `${name} feels a little different—in a good way`,
    versionLabel: "Personality v1.2",
    traitsBefore: { Tone: "Direct", Empathy: "Medium", Humor: "Light" },
    traitsAfter: { Tone: "Warm", Empathy: "High", Humor: "Light" },
    changedTraitKeys: ["Tone", "Empathy"],
  };
}

function payloadNewTrait(name: string): MarketplaceFollowWhatChangedPayload {
  return {
    title: "New trait unlocked",
    versionLabel: "Skills v2.0",
    traitsBefore: { Languages: "English, Malay", Specialty: "General chat" },
    traitsAfter: { Languages: "English, Malay, Mandarin", Specialty: "Travel planning" },
    changedTraitKeys: ["Languages", "Specialty"],
  };
}

/** Build deterministic mock feed rows for current subscriptions (replace with API). */
export function buildMockFollowUpdateFeed(
  subscriptions: MarketplaceSubscription[],
  merged: StudioEntity[],
): MarketplaceFollowUpdateFeedItem[] {
  const out: MarketplaceFollowUpdateFeedItem[] = [];
  const now = Date.now();

  for (let i = 0; i < subscriptions.length; i++) {
    const sub = subscriptions[i];
    const card = subscriptionToSidebarCard(sub, merged);
    const featured = isMarketplaceListingFeatured(card as MarketplaceListingCard);
    const publisher =
      card.marketplaceKind === "enterprise"
        ? "Zetrix Platform"
        : card.ekycPublisherName?.trim() || "Independent creator";

    const baseTime = now - (i + 1) * 86_400_000 - i * 3_600_000;

    const p1 = payloadPersonalityEvolved(card.name);
    out.push({
      id: `fu-${sub.avatarId}-1`,
      avatarId: sub.avatarId,
      avatarName: card.name,
      publisherName: publisher,
      updateTypeLabel: "Personality evolved",
      summary: "We tuned warmth and empathy so replies feel more natural in everyday chats.",
      occurredAt: new Date(baseTime).toISOString(),
      versionLabel: p1.versionLabel,
      avatarIsFeatured: featured,
      whatChanged: p1,
    });

    if (i % 2 === 0) {
      const p2 = payloadNewTrait(card.name);
      out.push({
        id: `fu-${sub.avatarId}-2`,
        avatarId: sub.avatarId,
        avatarName: card.name,
        publisherName: publisher,
        updateTypeLabel: "New trait",
        summary: "Added a brighter language mix and a sharper specialty for travel planning.",
        occurredAt: new Date(baseTime - 172_800_000).toISOString(),
        versionLabel: p2.versionLabel,
        avatarIsFeatured: featured,
        whatChanged: p2,
      });
    }
  }

  return out.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

export function countUnreadFeedItems(feed: MarketplaceFollowUpdateFeedItem[], seenIds: Set<string>): number {
  return feed.filter((f) => !seenIds.has(f.id)).length;
}

export function feedIdsForAvatar(feed: MarketplaceFollowUpdateFeedItem[], avatarId: string): string[] {
  return feed.filter((f) => f.avatarId === avatarId).map((f) => f.id);
}

export function avatarHasUnseenUpdates(
  avatarId: string,
  feed: MarketplaceFollowUpdateFeedItem[],
  seenIds: Set<string>,
): boolean {
  return feed.some((f) => f.avatarId === avatarId && !seenIds.has(f.id));
}

export function lastUpdateTimestampForAvatar(
  avatarId: string,
  feed: MarketplaceFollowUpdateFeedItem[],
): number {
  let max = 0;
  for (const f of feed) {
    if (f.avatarId !== avatarId) continue;
    const t = new Date(f.occurredAt).getTime();
    if (t > max) max = t;
  }
  return max;
}
