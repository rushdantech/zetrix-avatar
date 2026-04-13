/** Feed row in Marketplace → Following → Updates (mock-ready for API). */
export interface MarketplaceFollowUpdateFeedItem {
  id: string;
  avatarId: string;
  avatarName: string;
  /** Display name for publisher line */
  publisherName: string;
  /** Short label, e.g. "Personality evolved" */
  updateTypeLabel: string;
  summary: string;
  occurredAt: string;
  /** Optional listing version string */
  versionLabel?: string;
  /** When true, show a subtle Featured hint in the feed */
  avatarIsFeatured?: boolean;
  /** Expanded payload for “What changed” */
  whatChanged: MarketplaceFollowWhatChangedPayload;
}

export interface MarketplaceFollowWhatChangedPayload {
  title: string;
  versionLabel?: string;
  /** Human-readable trait snapshots */
  traitsBefore: Record<string, string>;
  traitsAfter: Record<string, string>;
  /** Keys that changed (subset of trait keys) */
  changedTraitKeys: string[];
}
