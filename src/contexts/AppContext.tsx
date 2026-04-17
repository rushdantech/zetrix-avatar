import React, { createContext, useContext, useState, useCallback } from "react";
import {
  mockPersona, emptyPersona, mockConsent, mockInstagram, mockCalendarEntries,
  mockAssets, mockQueue, mockHistory, mockUser, userInitials,
  mockLinkedGmail, mockLinkedOutlook, emptyLinkedEmail,
  type PersonaSettings, type ConsentRecord, type InstagramConnection,
  type LinkedEmailAccount,
  type CalendarEntry, type GeneratedAsset, type QueueItem, type UserProfile,
  type CreatorSetupSnapshot,
  emptyCreatorSetup,
} from "@/lib/mock-data";
import type { MarketplaceBrowseSegment, RagDocumentItem, StudioEntity } from "@/types/studio";
import type { MarketplaceSubscription } from "@/types/marketplace";
import type { MockBillingPayment, SubscriptionPlan } from "@/types/billing";
import {
  clearStudioSessionStorage,
  loadPersistedCreatorSetup,
  loadPersistedOnboardingComplete,
  loadPersistedPersona,
  loadPersistedPlanBilling,
  loadPersistedUser,
  loadPersistedSeenFollowUpdateIds,
  loadPersistedUserStudioEntities,
  persistCreatorSetup,
  persistPlanBilling,
  persistSeenFollowUpdateIds,
  persistOnboardingComplete,
  persistPersona,
  persistUser,
  persistUserStudioEntities,
} from "@/lib/persist/studio-session-storage";
import { isProSubscriptionActive } from "@/lib/billing/is-pro-subscription-active";
import { clearAvatarClawAgentInstance, AVATARCLAW_USER_AGENT_ID } from "@/lib/studio/avatarclaw-agent-instance";
import { clearWorkspaceOverrides } from "@/lib/studio/avatarclaw-workspace-mock";

export type ProUpgradeModalStep = "paywall" | "checkout";

interface AppState {
  user: UserProfile;
  onboardingComplete: boolean;
  onboardingStep: number;
  persona: PersonaSettings;
  consent: ConsentRecord;
  instagram: InstagramConnection;
  emailGmail: LinkedEmailAccount;
  emailOutlook: LinkedEmailAccount;
  calendarEntries: CalendarEntry[];
  assets: GeneratedAsset[];
  queue: QueueItem[];
  history: QueueItem[];
  notifications: Notification[];
  /** RAG source files added when creating a personal avatar (metadata only; client-side). */
  ragDocuments: RagDocumentItem[];
  /** Data from Create Avatar → Avatar (photos count, questionnaire, voice). */
  creatorSetup: CreatorSetupSnapshot;
  /** Avatars/agents created in this session; merged into My Avatars and detail routes. */
  userStudioEntities: StudioEntity[];
  /** Patches catalog entities (e.g. publish to marketplace) for this session. */
  studioEntityOverrides: Record<string, Partial<StudioEntity>>;
  /** Marketplace subscriptions (in-memory). */
  marketplaceSubscriptions: MarketplaceSubscription[];
  /** Seen Marketplace follow feed update ids (Following → Updates). */
  seenFollowUpdateIds: string[];
  /** Mock catalog entity IDs removed for this session (My Agents delete). */
  removedStudioEntityIds: string[];
  /** Bumps when AvatarClaw localStorage agent/workspace data changes so merged lists re-read. */
  avatarClawStorageGeneration: number;
  subscriptionPlan: SubscriptionPlan;
  /** When current Pro access ends (ISO). Null when Free or after expiry is cleared. */
  proAccessExpiresAt: string | null;
  mockBillingPayments: MockBillingPayment[];
  /** Pro upgrade modal (paywall / checkout / success). Not persisted. */
  proUpgradeModalStep: ProUpgradeModalStep | null;
}

interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  timestamp: string;
}

interface AppContextType extends AppState {
  setOnboardingComplete: (v: boolean) => void;
  setOnboardingStep: (s: number) => void;
  updatePersona: (p: Partial<PersonaSettings>) => void;
  deletePersona: () => void;
  setConsent: (c: ConsentRecord) => void;
  connectInstagram: () => void;
  disconnectInstagram: () => void;
  connectGmail: () => void;
  disconnectGmail: () => void;
  connectOutlook: () => void;
  disconnectOutlook: () => void;
  generateContentPlan: () => void;
  generateAsset: (prompt: string, type: "image" | "video", options?: { theme?: string; mood?: string; location?: string }) => void;
  approveAsset: (id: string) => void;
  addToQueue: (assetId: string, scheduledTime: string) => void;
  postNow: (queueId: string) => void;
  cancelQueueItem: (queueId: string) => void;
  addNotification: (msg: string, type: Notification["type"]) => void;
  setRagDocuments: (docs: RagDocumentItem[]) => void;
  updateCreatorSetup: (patch: Partial<CreatorSetupSnapshot>) => void;
  addUserStudioEntity: (entity: StudioEntity) => void;
  /** Toggle marketplace listing: `published` shows under Marketplace → Your AI agents. */
  setAgentMarketplacePublished: (entityId: string, published: boolean) => void;
  addMarketplaceSubscription: (input: Omit<MarketplaceSubscription, "id" | "subscribedAt">) => void;
  removeMarketplaceSubscription: (avatarId: string) => void;
  /** Mark follow-feed update rows as read (What changed, chat, view avatar). */
  markFollowUpdatesSeen: (updateIds: string[]) => void;
  /** Remove agent/avatar from session lists (deletes mock catalog row or user-created entity). */
  removeStudioEntity: (entityId: string) => void;
  bumpAvatarClawStorage: () => void;
  updateUser: (patch: Partial<Pick<UserProfile, "firstName" | "lastName">>) => void;
  openProUpgradePaywall: () => void;
  closeProUpgradeModal: () => void;
  goProUpgradeCheckout: () => void;
  returnToProUpgradePaywall: () => void;
  completeMockProPurchase: (payload: { cardholderName: string; cardLast4: string }) => void;
  /** True when the mock plan is Pro (AvatarClaw unlocked). */
  hasActiveProAccess: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

function buildInitialUser(): UserProfile {
  const persisted = loadPersistedUser();
  const merged: UserProfile = { ...mockUser, ...(persisted || {}) };
  merged.avatar = userInitials(merged);
  return merged;
}

function getInitialAppState(): AppState {
  const persistedStudio = loadPersistedUserStudioEntities();
  const persistedOnboarding = loadPersistedOnboardingComplete();
  const persistedPersona = loadPersistedPersona();
  const persistedCreator = loadPersistedCreatorSetup();
  const { subscriptionPlan, mockBillingPayments, proAccessExpiresAt } = loadPersistedPlanBilling();
  const persona =
    persistedPersona != null ? { ...mockPersona, ...persistedPersona } : mockPersona;
  const creatorSetup =
    persistedCreator != null ? { ...emptyCreatorSetup(), ...persistedCreator } : emptyCreatorSetup();
  return {
    user: buildInitialUser(),
    onboardingComplete: persistedOnboarding,
    onboardingStep: 0,
    persona,
    consent: { likenessConsent: false, automatedPostingConsent: false, platformTerms: false, signatureName: "", timestamp: "" },
    instagram: { connected: false, username: "", token: "", permissions: [], connectedAt: "" },
    emailGmail: emptyLinkedEmail("gmail"),
    emailOutlook: emptyLinkedEmail("outlook"),
    calendarEntries: [],
    assets: [],
    queue: [],
    history: [],
    notifications: [],
    ragDocuments: [],
    creatorSetup,
    userStudioEntities: persistedStudio,
    studioEntityOverrides: {},
    marketplaceSubscriptions: [],
    seenFollowUpdateIds: loadPersistedSeenFollowUpdateIds(),
    removedStudioEntityIds: [],
    avatarClawStorageGeneration: 0,
    subscriptionPlan,
    proAccessExpiresAt,
    mockBillingPayments,
    proUpgradeModalStep: null,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(getInitialAppState);

  React.useEffect(() => {
    persistUserStudioEntities(state.userStudioEntities);
  }, [state.userStudioEntities]);

  React.useEffect(() => {
    persistOnboardingComplete(state.onboardingComplete);
  }, [state.onboardingComplete]);

  React.useEffect(() => {
    persistPersona(state.persona);
  }, [state.persona]);

  React.useEffect(() => {
    persistCreatorSetup(state.creatorSetup);
  }, [state.creatorSetup]);

  React.useEffect(() => {
    persistUser(state.user);
  }, [state.user]);

  React.useEffect(() => {
    persistSeenFollowUpdateIds(state.seenFollowUpdateIds);
  }, [state.seenFollowUpdateIds]);

  React.useEffect(() => {
    persistPlanBilling(state.subscriptionPlan, state.mockBillingPayments, state.proAccessExpiresAt);
  }, [state.subscriptionPlan, state.mockBillingPayments, state.proAccessExpiresAt]);

  const hasActiveProAccess = isProSubscriptionActive(state.subscriptionPlan, state.proAccessExpiresAt);

  const openProUpgradePaywall = useCallback(() => {
    if (isProSubscriptionActive(state.subscriptionPlan, state.proAccessExpiresAt)) return;
    setState((s) => ({ ...s, proUpgradeModalStep: "paywall" }));
  }, [state.subscriptionPlan, state.proAccessExpiresAt]);

  const closeProUpgradeModal = useCallback(() => {
    setState((s) => ({ ...s, proUpgradeModalStep: null }));
  }, []);

  const goProUpgradeCheckout = useCallback(() => {
    setState((s) => ({ ...s, proUpgradeModalStep: "checkout" }));
  }, []);

  const returnToProUpgradePaywall = useCallback(() => {
    setState((s) => ({ ...s, proUpgradeModalStep: "paywall" }));
  }, []);

  const completeMockProPurchase = useCallback((payload: { cardholderName: string; cardLast4: string }) => {
    const sentAt = new Date().toISOString();
    const now = new Date();
    setState((s) => {
      const periodStartIso = now.toISOString();
      const dateLabel = now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
      const payment: MockBillingPayment = {
        id: `ztx_${Date.now().toString(36)}`,
        date: dateLabel,
        item: "Pro Plan",
        amountLabel: "USD 39.99",
        status: "Paid",
        transactionId: `ZTX-MOCK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        planName: "Pro",
        paymentMethodLabel: "Credit card",
        receiptEmailSentAt: sentAt,
        cardholderName: payload.cardholderName.trim(),
        cardLast4: payload.cardLast4,
        periodStartIso,
      };
      return {
        ...s,
        subscriptionPlan: "pro",
        proAccessExpiresAt: null,
        mockBillingPayments: [payment, ...s.mockBillingPayments],
        /** Close paywall/checkout; success UI is shown outside the Dialog (see ProUpgradeModals). */
        proUpgradeModalStep: null,
      };
    });
  }, []);

  const updateUser = useCallback((patch: Partial<Pick<UserProfile, "firstName" | "lastName">>) => {
    setState((s) => {
      const next: UserProfile = { ...s.user, ...patch };
      next.avatar = userInitials(next);
      return { ...s, user: next };
    });
  }, []);

  const setOnboardingComplete = (v: boolean) => setState(s => ({ ...s, onboardingComplete: v }));
  const setOnboardingStep = (step: number) => setState(s => ({ ...s, onboardingStep: step }));
  const updatePersona = (p: Partial<PersonaSettings>) => setState(s => ({ ...s, persona: { ...s.persona, ...p } }));
  const deletePersona = useCallback(() => {
    clearStudioSessionStorage();
    setState((s) => ({
      ...s,
      persona: emptyPersona,
      onboardingComplete: false,
      ragDocuments: [],
      creatorSetup: emptyCreatorSetup(),
      userStudioEntities: [],
      seenFollowUpdateIds: [],
      subscriptionPlan: "free",
      proAccessExpiresAt: null,
      mockBillingPayments: [],
      proUpgradeModalStep: null,
    }));
  }, []);

  const setRagDocuments = useCallback((docs: RagDocumentItem[]) => {
    setState(s => ({ ...s, ragDocuments: docs }));
  }, []);

  const updateCreatorSetup = useCallback((patch: Partial<CreatorSetupSnapshot>) => {
    setState(s => ({ ...s, creatorSetup: { ...s.creatorSetup, ...patch } }));
  }, []);

  const addUserStudioEntity = useCallback((entity: StudioEntity) => {
    setState((s) => {
      const prev = s.userStudioEntities.find((e) => e.id === entity.id);
      const stored = prev ? ({ ...prev, ...entity } as StudioEntity) : entity;
      return {
        ...s,
        userStudioEntities: [stored, ...s.userStudioEntities.filter((e) => e.id !== entity.id)],
      };
    });
  }, []);

  const setAgentMarketplacePublished = useCallback((entityId: string, published: boolean) => {
    setState((s) => {
      const userEnt = s.userStudioEntities.find((e) => e.id === entityId);
      const override = s.studioEntityOverrides[entityId];
      const patch: Partial<StudioEntity> = {
        status: published ? "published" : "draft",
        published_at: published ? new Date().toISOString() : null,
      };
      if (published) {
        const seg =
          userEnt?.marketplaceBrowseSegment ??
          (override?.marketplaceBrowseSegment as MarketplaceBrowseSegment | undefined) ??
          "Social avatars";
        const feat = userEnt?.marketplaceFeatured ?? override?.marketplaceFeatured ?? false;
        const pri = userEnt?.marketplaceFeaturedPriority ?? override?.marketplaceFeaturedPriority ?? 0;
        patch.marketplaceBrowseSegment = seg;
        patch.marketplaceFeatured = feat;
        patch.marketplaceFeaturedPriority = pri;
      }
      const inUser = s.userStudioEntities.some((e) => e.id === entityId);
      if (inUser) {
        return {
          ...s,
          userStudioEntities: s.userStudioEntities.map((e) => (e.id === entityId ? ({ ...e, ...patch } as StudioEntity) : e)),
        };
      }
      return {
        ...s,
        studioEntityOverrides: {
          ...s.studioEntityOverrides,
          [entityId]: { ...s.studioEntityOverrides[entityId], ...patch },
        },
      };
    });
  }, []);

  const addMarketplaceSubscription = useCallback((input: Omit<MarketplaceSubscription, "id" | "subscribedAt">) => {
    setState(s => {
      if (s.marketplaceSubscriptions.some((x) => x.avatarId === input.avatarId)) return s;
      const sub: MarketplaceSubscription = {
        ...input,
        id: `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`,
        subscribedAt: new Date().toISOString(),
      };
      return { ...s, marketplaceSubscriptions: [sub, ...s.marketplaceSubscriptions] };
    });
  }, []);

  const removeMarketplaceSubscription = useCallback((avatarId: string) => {
    setState((s) => ({
      ...s,
      marketplaceSubscriptions: s.marketplaceSubscriptions.filter((x) => x.avatarId !== avatarId),
    }));
  }, []);

  const markFollowUpdatesSeen = useCallback((updateIds: string[]) => {
    if (updateIds.length === 0) return;
    setState((s) => {
      const next = new Set(s.seenFollowUpdateIds);
      for (const id of updateIds) next.add(id);
      return { ...s, seenFollowUpdateIds: [...next] };
    });
  }, []);

  const bumpAvatarClawStorage = useCallback(() => {
    setState((s) => ({ ...s, avatarClawStorageGeneration: s.avatarClawStorageGeneration + 1 }));
  }, []);

  const removeStudioEntity = useCallback((entityId: string) => {
    if (entityId === AVATARCLAW_USER_AGENT_ID) {
      clearAvatarClawAgentInstance();
      clearWorkspaceOverrides();
    }
    setState((s) => {
      const studioEntityOverrides = { ...s.studioEntityOverrides };
      delete studioEntityOverrides[entityId];
      const removedStudioEntityIds = s.removedStudioEntityIds.includes(entityId)
        ? s.removedStudioEntityIds
        : [...s.removedStudioEntityIds, entityId];
      return {
        ...s,
        userStudioEntities: s.userStudioEntities.filter((e) => e.id !== entityId),
        studioEntityOverrides,
        removedStudioEntityIds,
        marketplaceSubscriptions: s.marketplaceSubscriptions.filter((x) => x.avatarId !== entityId),
      };
    });
  }, []);
  const setConsent = (c: ConsentRecord) => setState(s => ({ ...s, consent: c }));

  const connectInstagram = () => setState(s => ({ ...s, instagram: mockInstagram }));
  const disconnectInstagram = () => setState(s => ({
    ...s,
    instagram: { connected: false, username: "", token: "", permissions: [], connectedAt: "" },
  }));

  // TODO: Replace with Google OAuth (Gmail API) — redirect to backend `/auth/google` and store refresh token server-side.
  const connectGmail = () => setState(s => ({ ...s, emailGmail: { ...mockLinkedGmail, connectedAt: new Date().toISOString() } }));
  const disconnectGmail = () => setState(s => ({ ...s, emailGmail: emptyLinkedEmail("gmail") }));

  // TODO: Replace with Microsoft OAuth (Microsoft Graph Mail.Send) — redirect to backend `/auth/microsoft`.
  const connectOutlook = () => setState(s => ({ ...s, emailOutlook: { ...mockLinkedOutlook, connectedAt: new Date().toISOString() } }));
  const disconnectOutlook = () => setState(s => ({ ...s, emailOutlook: emptyLinkedEmail("outlook") }));

  const generateContentPlan = useCallback(() => {
    setState(s => ({ ...s, calendarEntries: mockCalendarEntries }));
  }, []);

  const generateAsset = useCallback((
    prompt: string,
    type: "image" | "video",
    options?: { theme?: string; mood?: string; location?: string }
  ) => {
    const theme = options?.theme || "Custom";
    const mood = options?.mood || "—";
    const location = options?.location ?? "";
    const newAsset: GeneratedAsset = {
      id: `asset-${Date.now()}`,
      type,
      theme,
      caption: prompt.trim() || `AI-generated ${theme.toLowerCase()} content ✨ #AI #Creator`,
      mood,
      hashtags: ["#AI", "#Content", "#Creator"],
      provider: "Kling AI",
      createdAt: new Date().toISOString(),
      status: "generating",
      prompt: prompt.trim() || undefined,
      location: location || undefined,
    };
    setState(s => ({ ...s, assets: [newAsset, ...s.assets] }));
    setTimeout(() => {
      setState(s => ({
        ...s,
        assets: s.assets.map(a => a.id === newAsset.id ? { ...a, status: "ready" as const } : a),
      }));
    }, 2500);
  }, []);

  const approveAsset = (id: string) => {
    setState(s => ({
      ...s,
      assets: s.assets.map(a => a.id === id ? { ...a, status: "approved" as const } : a),
    }));
  };

  const addToQueue = (assetId: string, scheduledTime: string) => {
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;
    const item: QueueItem = {
      id: `queue-${Date.now()}`,
      assetId,
      caption: asset.caption,
      scheduledTime,
      platform: "Instagram",
      status: "queued",
      type: asset.type,
      theme: asset.theme,
    };
    setState(s => ({
      ...s,
      queue: [...s.queue, item],
      assets: s.assets.map(a => a.id === assetId ? { ...a, status: "queued" as const } : a),
    }));
  };

  const postNow = (queueId: string) => {
    const item = state.queue.find(q => q.id === queueId);
    if (!item) return;
    const success = Math.random() > 0.2;
    setState(s => ({
      ...s,
      queue: s.queue.filter(q => q.id !== queueId),
      history: [{
        ...item,
        status: success ? "posted" as const : "failed" as const,
        errorReason: success ? undefined : "Rate limit exceeded — try again later",
        scheduledTime: new Date().toISOString(),
      }, ...s.history],
    }));
  };

  const cancelQueueItem = (queueId: string) => {
    setState(s => ({ ...s, queue: s.queue.filter(q => q.id !== queueId) }));
  };

  const addNotification = (message: string, type: Notification["type"]) => {
    const n: Notification = { id: `notif-${Date.now()}`, message, type, timestamp: new Date().toISOString() };
    setState(s => ({ ...s, notifications: [n, ...s.notifications].slice(0, 20) }));
  };

  // Load sample data for dashboard when onboarding completes
  const loadSampleData = useCallback(() => {
    setState(s => {
      if (s.onboardingComplete && s.calendarEntries.length === 0) {
        return {
          ...s,
          calendarEntries: mockCalendarEntries,
          assets: mockAssets,
          queue: mockQueue,
          history: mockHistory,
          consent: mockConsent,
          instagram: mockInstagram,
        };
      }
      return s;
    });
  }, []);

  // Auto-load sample data when onboarding completes
  React.useEffect(() => {
    if (state.onboardingComplete) loadSampleData();
  }, [state.onboardingComplete, loadSampleData]);

  return (
    <AppContext.Provider value={{
      ...state,
      setOnboardingComplete,
      setOnboardingStep,
      updatePersona,
      deletePersona,
      setConsent,
      connectInstagram,
      disconnectInstagram,
      connectGmail,
      disconnectGmail,
      connectOutlook,
      disconnectOutlook,
      generateContentPlan,
      generateAsset,
      approveAsset,
      addToQueue,
      postNow,
      cancelQueueItem,
      addNotification,
      setRagDocuments,
      updateCreatorSetup,
      addUserStudioEntity,
      setAgentMarketplacePublished,
      addMarketplaceSubscription,
      removeMarketplaceSubscription,
      markFollowUpdatesSeen,
      removeStudioEntity,
      bumpAvatarClawStorage,
      updateUser,
      openProUpgradePaywall,
      closeProUpgradeModal,
      goProUpgradeCheckout,
      returnToProUpgradePaywall,
      completeMockProPurchase,
      hasActiveProAccess,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
