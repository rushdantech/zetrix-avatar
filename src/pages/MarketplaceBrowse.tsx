import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Gem,
  LayoutGrid,
  Search,
  Star,
  Store,
  UserRound,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";
import {
  DASHBOARD_PRIMARY_AVATAR_ID,
  JOB_AGENT_AVATAR_ID,
  deriveMyEnterpriseMarketplaceCards,
  deriveMyIndividualMarketplaceCards,
  subscriptionToSidebarCard,
  subscribeBrowseIndividuals,
  subscribeBrowseEnterprises,
  type MarketplaceListingCard
} from "@/lib/studio/marketplace-listing";
import {
  browseAvatarSegmentForListing,
  isMarketplaceListingFeatured,
  type BrowseAvatarSegment,
} from "@/lib/studio/marketplace-browse-categories";
import { fuzzyFilterMarketplaceListingCards } from "@/lib/studio/marketplace-browse-search";
import {
  partitionFeaturedCurated,
  sortFeaturedListingsByPriority,
} from "@/lib/studio/featured-marketplace";
import { FeaturedHeroCard } from "@/components/marketplace/FeaturedHeroCard";
import { FeaturedPromoCard } from "@/components/marketplace/FeaturedPromoCard";
import { MarketplaceAvatarListItem } from "@/components/marketplace/MarketplaceAvatarListItem";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FollowingUpdatesFeed } from "@/components/marketplace/FollowingUpdatesFeed";
import {
  avatarHasUnseenUpdates,
  buildMockFollowUpdateFeed,
  countUnreadFeedItems,
  feedIdsForAvatar,
  lastUpdateTimestampForAvatar,
} from "@/lib/marketplace/follow-feed-mock";
import { toast } from "sonner";

type PaidStep = "subscription" | "payment" | "success";

type FollowingSort = "recent-updated" | "az" | "recent-followed";

/** Browse filter: all, featured spotlight, or one of the four segments. */
type BrowseSegmentFilter = "all" | "featured" | BrowseAvatarSegment;

const BROWSE_FILTER_CHIPS: {
  id: BrowseSegmentFilter;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "featured", label: "Featured", icon: Star },
  { id: "Public figures", label: "Public", icon: UserRound },
  { id: "Company avatars", label: "Company", icon: Building2 },
  { id: "Social avatars", label: "Social", icon: Users },
  { id: "Premium avatars", label: "Premium", icon: Gem },
];

export default function MarketplaceBrowse() {
  const navigate = useNavigate();
  const {
    marketplaceSubscriptions,
    addMarketplaceSubscription,
    removeMarketplaceSubscription,
    userStudioEntities,
    onboardingComplete,
    persona,
    seenFollowUpdateIds,
    markFollowUpdatesSeen,
  } = useApp();
  const merged = useMergedStudioEntities();
  const userEntityIds = useMemo(() => new Set(userStudioEntities.map((e) => e.id)), [userStudioEntities]);
  const myStudioIndividuals = useMemo(
    () => deriveMyIndividualMarketplaceCards(userStudioEntities, merged, onboardingComplete, persona),
    [userStudioEntities, merged, onboardingComplete, persona],
  );
  const myStudioEnterprises = useMemo(
    () => deriveMyEnterpriseMarketplaceCards(userStudioEntities, merged),
    [userStudioEntities, merged],
  );
  const subscribeIndividuals = useMemo(
    () => subscribeBrowseIndividuals(merged, userEntityIds),
    [merged, userEntityIds],
  );
  const subscribedIds = useMemo(() => new Set(marketplaceSubscriptions.map((s) => s.avatarId)), [marketplaceSubscriptions]);

  const mySubscribedListings = useMemo(
    () => marketplaceSubscriptions.map((s) => subscriptionToSidebarCard(s, merged)),
    [marketplaceSubscriptions, merged],
  );
  const myAvatars = useMemo(() => {
    const byId = new Map<string, MarketplaceListingCard>();
    for (const card of myStudioIndividuals) byId.set(card.id, card);
    for (const card of myStudioEnterprises) byId.set(card.id, card);
    for (const card of mySubscribedListings) byId.set(card.id, card);
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [myStudioIndividuals, myStudioEnterprises, mySubscribedListings]);

  const browseEnterpriseAvatars = useMemo(() => {
    return [
      {
        id: JOB_AGENT_AVATAR_ID,
        name: "Job Application Avatar",
        bio: "Helps with job discovery, resume tailoring, and application follow-up with guided assistant workflows.",
        isYours: false,
        marketplaceKind: "individual",
        pricingTier: "free",
        marketplaceBrowseSegment: "Company avatars",
        marketplaceFeatured: true,
        marketplaceFeaturedPriority: 500,
        marketplaceFeaturedHook: "Discovery, resume tailoring, and follow-up in one guided workflow.",
      },
      {
        id: "zetrix-ai-avatar-myeg",
        name: "Zetrix AI Avatar",
        bio: "Access MyEG services and contact customer support quickly with guided, service-ready assistance.",
        isYours: false,
        marketplaceKind: "individual",
        pricingTier: "free",
        marketplaceBrowseSegment: "Company avatars",
        marketplaceFeatured: true,
        marketplaceFeaturedPriority: 480,
        marketplaceFeaturedHook: "Service-ready assistance for MyEG flows and customer support.",
      },
    ];
  }, []);

  const subscribeBrowseEnterpriseRows = useMemo(
    () => subscribeBrowseEnterprises(merged, userEntityIds),
    [merged, userEntityIds],
  );

  const allBrowseListings = useMemo(() => {
    const map = new Map<string, MarketplaceListingCard>();
    for (const c of subscribeIndividuals) map.set(c.id, c);
    for (const c of subscribeBrowseEnterpriseRows) map.set(c.id, c);
    for (const c of browseEnterpriseAvatars as MarketplaceListingCard[]) map.set(c.id, c);
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [subscribeIndividuals, subscribeBrowseEnterpriseRows, browseEnterpriseAvatars]);

  const [browseSearch, setBrowseSearch] = useState("");
  const [browseSegmentFilter, setBrowseSegmentFilter] = useState<BrowseSegmentFilter>("featured");

  const browseSegmentCounts = useMemo(() => {
    const counts: Record<BrowseSegmentFilter, number> = {
      all: allBrowseListings.length,
      featured: 0,
      "Public figures": 0,
      "Company avatars": 0,
      "Social avatars": 0,
      "Premium avatars": 0,
    };
    for (const c of allBrowseListings) {
      if (isMarketplaceListingFeatured(c)) counts.featured += 1;
      counts[browseAvatarSegmentForListing(c)] += 1;
    }
    return counts;
  }, [allBrowseListings]);

  const filteredBrowseListings = useMemo(() => {
    let list = allBrowseListings;
    if (browseSegmentFilter === "featured") {
      list = list.filter((c) => isMarketplaceListingFeatured(c));
    } else if (browseSegmentFilter !== "all") {
      list = list.filter((c) => browseAvatarSegmentForListing(c) === browseSegmentFilter);
    }
    return fuzzyFilterMarketplaceListingCards(list, browseSearch);
  }, [allBrowseListings, browseSegmentFilter, browseSearch]);

  const featuredCurated = useMemo(() => {
    if (browseSegmentFilter !== "featured" || filteredBrowseListings.length === 0) return null;
    const sorted = sortFeaturedListingsByPriority(filteredBrowseListings);
    return partitionFeaturedCurated(sorted);
  }, [browseSegmentFilter, filteredBrowseListings]);

  const followFeed = useMemo(
    () => buildMockFollowUpdateFeed(marketplaceSubscriptions, merged),
    [marketplaceSubscriptions, merged],
  );
  const seenFollowSet = useMemo(() => new Set(seenFollowUpdateIds), [seenFollowUpdateIds]);
  const followUnreadCount = useMemo(
    () => countUnreadFeedItems(followFeed, seenFollowSet),
    [followFeed, seenFollowSet],
  );

  const followingSubscriptionsWithCards = useMemo(
    () =>
      marketplaceSubscriptions.map((sub) => ({
        sub,
        card: subscriptionToSidebarCard(sub, merged),
      })),
    [marketplaceSubscriptions, merged],
  );

  const [followSort, setFollowSort] = useState<FollowingSort>("recent-updated");
  const sortedFollowingRows = useMemo(() => {
    const rows = [...followingSubscriptionsWithCards];
    if (followSort === "az") {
      rows.sort((a, b) => a.card.name.localeCompare(b.card.name));
      return rows;
    }
    if (followSort === "recent-followed") {
      rows.sort((a, b) => new Date(b.sub.subscribedAt).getTime() - new Date(a.sub.subscribedAt).getTime());
      return rows;
    }
    rows.sort((a, b) => {
      const ta =
        lastUpdateTimestampForAvatar(a.sub.avatarId, followFeed) || new Date(a.sub.subscribedAt).getTime();
      const tb =
        lastUpdateTimestampForAvatar(b.sub.avatarId, followFeed) || new Date(b.sub.subscribedAt).getTime();
      return tb - ta;
    });
    return rows;
  }, [followingSubscriptionsWithCards, followSort, followFeed]);

  const [mainTab, setMainTab] = useState("browse");

  const [subscribeTarget, setSubscribeTarget] = useState<MarketplaceListingCard | null>(null);
  const [paidStep, setPaidStep] = useState<PaidStep>("subscription");

  useEffect(() => {
    if (!subscribeTarget) setPaidStep("subscription");
  }, [subscribeTarget]);

  const isPaid = subscribeTarget?.pricingTier === "paid";

  const closeDialog = () => {
    setSubscribeTarget(null);
    setPaidStep("subscription");
  };

  const finalizeSubscription = () => {
    if (!subscribeTarget) return;
    addMarketplaceSubscription({
      avatarId: subscribeTarget.id,
      avatarName: subscribeTarget.name,
      category: subscribeTarget.category,
      marketplaceKind: subscribeTarget.marketplaceKind,
      pricingTier: subscribeTarget.pricingTier,
      priceMonthlyMyr: subscribeTarget.priceMonthlyMyr,
    });
    closeDialog();
  };

  const confirmFree = () => {
    if (!subscribeTarget) return;
    finalizeSubscription();
    setMainTab("following");
    toast.success(`You're following ${subscribeTarget.name} (free).`);
  };

  const confirmPaidSuccess = () => {
    if (!subscribeTarget) return;
    finalizeSubscription();
    setMainTab("following");
    toast.success(`Payment confirmed — you're following ${subscribeTarget.name}.`);
  };

  const startOrOpenChat = (avatar: MarketplaceListingCard) => {
    if (avatar.id === JOB_AGENT_AVATAR_ID && !subscribedIds.has(avatar.id)) {
      setSubscribeTarget(avatar);
      toast.info("Follow Job Application Avatar first to start chat.");
      return;
    }
    const isMine =
      avatar.isYours ||
      (avatar.id === DASHBOARD_PRIMARY_AVATAR_ID && onboardingComplete && Boolean(persona.name?.trim()));
    if (!subscribedIds.has(avatar.id) && !isMine) {
      setSubscribeTarget(avatar);
      toast.info("Follow first to chat from Marketplace Chat.", { description: avatar.name });
      return;
    }
    navigate(`/marketplace/chat?open=${encodeURIComponent(avatar.id)}`);
  };

  const markFeedSeenForAvatar = useCallback(
    (avatarId: string) => {
      const ids = feedIdsForAvatar(followFeed, avatarId);
      if (ids.length > 0) markFollowUpdatesSeen(ids);
    },
    [followFeed, markFollowUpdatesSeen],
  );

  const handleFollowingChat = (avatar: MarketplaceListingCard) => {
    markFeedSeenForAvatar(avatar.id);
    startOrOpenChat(avatar);
  };

  const handleFeedChatById = (avatarId: string) => {
    const sub = marketplaceSubscriptions.find((s) => s.avatarId === avatarId);
    if (!sub) return;
    markFeedSeenForAvatar(avatarId);
    startOrOpenChat(subscriptionToSidebarCard(sub, merged));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20 lg:pb-8">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Store className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Marketplace</h1>
          <p className="text-sm text-muted-foreground">
            Chat and follow Avatars
          </p>
        </div>
      </div>

      <Dialog open={subscribeTarget !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          {!isPaid && subscribeTarget && (
            <>
              <DialogHeader>
                <DialogTitle>Confirm follow</DialogTitle>
                <DialogDescription>
                  Follow {subscribeTarget.name} ({subscribeTarget.marketplaceKind === "enterprise" ? "AI agent" : "Avatar"}).
                </DialogDescription>
              </DialogHeader>
              <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                This listing is <strong>free</strong>. You can use it in chat under fair use.
              </p>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="button" onClick={confirmFree}>
                  Confirm follow
                </Button>
              </DialogFooter>
            </>
          )}

          {isPaid && subscribeTarget && paidStep === "subscription" && (
            <>
              <DialogHeader>
                <DialogTitle>Follow</DialogTitle>
                <DialogDescription>
                  {subscribeTarget.name} — <strong className="text-foreground">RM {subscribeTarget.priceMonthlyMyr} / month</strong>{" "}
                  per seat (demo).
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                You’ll confirm payment on the next step. No real charge is made in this prototype.
              </p>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => setPaidStep("payment")}>
                  Continue to payment
                </Button>
              </DialogFooter>
            </>
          )}

          {isPaid && subscribeTarget && paidStep === "payment" && (
            <>
              <DialogHeader>
                <DialogTitle>Confirm payment</DialogTitle>
                <DialogDescription>
                  Pay <strong className="text-foreground">RM {subscribeTarget.priceMonthlyMyr}</strong> for your first month
                  of {subscribeTarget.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 rounded-lg border border-border bg-secondary/40 px-3 py-3 text-sm">
                <p className="font-medium text-foreground">Demo card</p>
                <p className="text-muted-foreground">Visa ending in 4242 · Billing to your account on file</p>
                <p className="text-xs text-muted-foreground">This is a mock checkout for the prototype.</p>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setPaidStep("subscription")}>
                  Back
                </Button>
                <Button type="button" onClick={() => setPaidStep("success")}>
                  Pay now
                </Button>
              </DialogFooter>
            </>
          )}

          {isPaid && subscribeTarget && paidStep === "success" && (
            <>
              <DialogHeader>
                <DialogTitle>Payment successful</DialogTitle>
                <DialogDescription>
                  Your payment of <strong className="text-foreground">RM {subscribeTarget.priceMonthlyMyr}</strong> was
                  confirmed (demo). You are now following {subscribeTarget.name}.
                </DialogDescription>
              </DialogHeader>
              <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                You can start chatting from <strong>Marketplace Chat</strong> in the sidebar.
              </p>
              <DialogFooter>
                <Button type="button" className="w-full sm:w-auto" onClick={confirmPaidSuccess}>
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="mb-4 grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="browse">Browse Avatars</TabsTrigger>
          <TabsTrigger value="my-avatars">My Avatars</TabsTrigger>
          <TabsTrigger value="following" className="gap-1">
            <span>Following</span>
            {followUnreadCount > 0 ? (
              <span className="text-muted-foreground" aria-hidden>
                ·
              </span>
            ) : null}
            {followUnreadCount > 0 ? (
              <span className="tabular-nums text-muted-foreground">{followUnreadCount}</span>
            ) : null}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="browse" className="space-y-6">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Discover</h2>
            <p className="text-xs text-muted-foreground">
              {browseSegmentFilter === "featured" ? (
                <>
                  Hand-picked avatars worth trying now. A small spotlight of standout listings—chat in one tap when you are
                  ready.
                </>
              ) : (
                <>
                  Filter by Featured or category, then search. Creators choose Public, Company, Social, or Premium, and can add
                  Featured for spotlight placement.
                </>
              )}
            </p>

            <div className="w-full max-w-2xl space-y-3 pt-1">
              <div className="relative w-full">
                <div
                  role="radiogroup"
                  aria-label="Avatar type filters"
                  className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 pt-0.5 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"
                >
                  {BROWSE_FILTER_CHIPS.map(({ id, label, icon: Icon }) => {
                    const selected = browseSegmentFilter === id;
                    const count = browseSegmentCounts[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setBrowseSegmentFilter(id)}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ease-out",
                          "border-border/80 bg-muted/35 text-foreground/90",
                          "hover:bg-muted/65 hover:text-foreground",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          selected &&
                            "border-primary/35 bg-primary/[0.11] text-primary shadow-sm ring-1 ring-primary/20 hover:bg-primary/[0.16] hover:text-primary",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 opacity-60",
                            selected && "opacity-90",
                          )}
                          aria-hidden
                        />
                        <span>{label}</span>
                        <span
                          className={cn(
                            "tabular-nums text-xs text-muted-foreground/90",
                            selected && "text-primary/80",
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex w-full items-center gap-2 rounded-lg border border-border/90 bg-muted/25 px-3 py-2 shadow-sm">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <input
                  type="search"
                  value={browseSearch}
                  onChange={(e) => setBrowseSearch(e.target.value)}
                  placeholder="Search by name, publisher, or description…"
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground/90 outline-none placeholder:text-muted-foreground"
                  aria-label="Search avatars by name, publisher, or description"
                />
              </div>
            </div>

            {allBrowseListings.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border py-4 text-center text-sm text-muted-foreground">
                No avatar listings available right now.
              </p>
            ) : filteredBrowseListings.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border py-4 text-center text-sm text-muted-foreground">
                {browseSegmentFilter === "featured" ? (
                  browseSearch.trim() ? (
                    <>No featured avatars match your search. Try a different keyword or clear the search box.</>
                  ) : browseSegmentCounts.featured === 0 ? (
                    <>No featured avatars are live yet. Browse <strong className="text-foreground">All</strong> to explore the catalog.</>
                  ) : (
                    <>No featured avatars match your filters.</>
                  )
                ) : (
                  <>No avatars in this category match your search. Try another segment or keyword.</>
                )}
              </p>
            ) : browseSegmentFilter === "featured" && featuredCurated?.hero ? (
              <div className="space-y-8 pt-2">
                <FeaturedHeroCard
                  avatar={featuredCurated.hero}
                  subscribed={subscribedIds.has(featuredCurated.hero.id)}
                  onChat={startOrOpenChat}
                  onFollow={setSubscribeTarget}
                />
                {featuredCurated.secondary.length > 0 ? (
                  <div>
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Curated picks
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {featuredCurated.secondary.map((avatar) => (
                        <FeaturedPromoCard
                          key={avatar.id}
                          avatar={avatar}
                          subscribed={subscribedIds.has(avatar.id)}
                          onChat={startOrOpenChat}
                          onFollow={setSubscribeTarget}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
                {featuredCurated.remainder.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">More featured</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {featuredCurated.remainder.map((avatar) => (
                        <MarketplaceAvatarListItem
                          key={avatar.id}
                          variant="card"
                          avatar={avatar}
                          subscribed={subscribedIds.has(avatar.id)}
                          onSubscribe={setSubscribeTarget}
                          onChat={startOrOpenChat}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBrowseListings.map((avatar) => (
                  <MarketplaceAvatarListItem
                    key={avatar.id}
                    variant="card"
                    avatar={avatar}
                    subscribed={subscribedIds.has(avatar.id)}
                    onSubscribe={setSubscribeTarget}
                    onChat={startOrOpenChat}
                  />
                ))}
              </div>
            )}
          </section>
        </TabsContent>
        <TabsContent value="my-avatars" className="space-y-6">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your studio</h2>
            <p className="text-xs text-muted-foreground">Your created avatars and anything you follow.</p>
            {myAvatars.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                No avatars yet. Create one in Avatar Studio or follow from Browse Avatars.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {myAvatars.map((avatar) => (
                  <MarketplaceAvatarListItem
                    key={avatar.id}
                    variant="card"
                    avatar={avatar}
                    subscribed
                    onSubscribe={() => {}}
                    onUnfollow={
                      subscribedIds.has(avatar.id)
                        ? (target) => {
                            removeMarketplaceSubscription(target.id);
                            toast.success(`Unfollowed ${target.name}.`);
                          }
                        : undefined
                    }
                    onChat={startOrOpenChat}
                  />
                ))}
              </div>
            )}
          </section>
        </TabsContent>
        <TabsContent value="following" className="space-y-6">
          <Tabs defaultValue="follow-avatars" className="w-full">
            <TabsList className="mb-4 grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="follow-avatars">Avatars</TabsTrigger>
              <TabsTrigger value="follow-updates">Updates</TabsTrigger>
            </TabsList>
            <TabsContent value="follow-avatars" className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Everyone you follow in one place. Sort by what changed recently or keep it alphabetical.
              </p>
              {marketplaceSubscriptions.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
                  You are not following anyone yet. Open <strong className="text-foreground">Browse Avatars</strong> to follow
                  creators and agents.
                </p>
              ) : (
                <>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <Label htmlFor="following-sort" className="text-xs font-medium text-muted-foreground">
                      Sort
                    </Label>
                    <Select value={followSort} onValueChange={(v) => setFollowSort(v as FollowingSort)}>
                      <SelectTrigger id="following-sort" className="h-9 w-full max-w-xs bg-background sm:w-64">
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="recent-updated">Recently updated</SelectItem>
                        <SelectItem value="az">A–Z</SelectItem>
                        <SelectItem value="recent-followed">Recently followed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2 lg:grid-cols-3">
                    {sortedFollowingRows.map(({ card, sub }) => (
                      <MarketplaceAvatarListItem
                        key={sub.id}
                        variant="card"
                        surface="following"
                        avatar={card}
                        subscribed
                        showUpdatedBadge={avatarHasUnseenUpdates(card.id, followFeed, seenFollowSet)}
                        onSubscribe={() => {}}
                        onUnfollow={(target) => {
                          removeMarketplaceSubscription(target.id);
                          toast.success(`Unfollowed ${target.name}.`);
                        }}
                        onChat={handleFollowingChat}
                      />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
            <TabsContent value="follow-updates" className="space-y-3">
              <p className="text-xs text-muted-foreground">Latest from avatars you follow—newest first.</p>
              <FollowingUpdatesFeed items={followFeed} seenIds={seenFollowSet} onChat={handleFeedChatById} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
