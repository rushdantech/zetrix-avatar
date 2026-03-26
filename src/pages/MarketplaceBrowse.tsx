import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";
import type { StudioEntityIndividual } from "@/types/studio";
import {
  DASHBOARD_PRIMARY_AVATAR_ID,
  JOB_AGENT_AVATAR_ID,
  isPlatformBundledStudioId,
  subscriptionToSidebarCard,
  subscribeBrowseEnterprises,
  subscribeBrowseIndividuals,
  type MarketplaceListingCard
} from "@/lib/studio/marketplace-listing";
import { studioIndividualToListingCard } from "@/lib/studio/individual-marketplace-cards";
import { studioEnterpriseToListingCard } from "@/lib/studio/enterprise-marketplace-cards";
import { AVATAR_BROWSE_SECTION_ORDER, groupListingsByBrowseCategory } from "@/lib/studio/marketplace-browse-categories";
import { MarketplaceAvatarListItem } from "@/components/marketplace/MarketplaceAvatarListItem";
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
import { toast } from "sonner";

type PaidStep = "subscription" | "payment" | "success";
type BrowseAvatarType = "user-generated" | "enterprise";

export default function MarketplaceBrowse() {
  const navigate = useNavigate();
  const {
    marketplaceSubscriptions,
    addMarketplaceSubscription,
    userStudioEntities,
    onboardingComplete,
    persona,
  } = useApp();
  const merged = useMergedStudioEntities();
  const userEntityIds = useMemo(() => new Set(userStudioEntities.map((e) => e.id)), [userStudioEntities]);
  const myCreatedAvatars = useMemo(
    () =>
      merged
        .filter((e): e is StudioEntityIndividual => e.type === "individual")
        .map((e) => studioIndividualToListingCard(e)),
    [merged],
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
    for (const card of myCreatedAvatars) byId.set(card.id, card);
    for (const card of mySubscribedListings) byId.set(card.id, card);
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [myCreatedAvatars, mySubscribedListings]);

  const browseJobAgentCard = useMemo(() => {
    const entity = merged.find((e) => e.type === "enterprise" && e.id === JOB_AGENT_AVATAR_ID);
    if (!entity || entity.type !== "enterprise") return null;
    return {
      ...studioEnterpriseToListingCard(entity),
      isYours: false,
    } as MarketplaceListingCard;
  }, [merged]);

  const browseEnterpriseAvatars = useMemo(() => {
    if (!browseJobAgentCard) return [] as MarketplaceListingCard[];
    return [browseJobAgentCard];
  }, [browseJobAgentCard]);

  const subscribeIndividualsGrouped = useMemo(
    () => groupListingsByBrowseCategory(subscribeIndividuals, AVATAR_BROWSE_SECTION_ORDER),
    [subscribeIndividuals],
  );

  const [subscribeTarget, setSubscribeTarget] = useState<MarketplaceListingCard | null>(null);
  const [paidStep, setPaidStep] = useState<PaidStep>("subscription");
  const [browseAvatarType, setBrowseAvatarType] = useState<BrowseAvatarType>("user-generated");

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
      marketplaceKind: subscribeTarget.marketplaceKind,
      pricingTier: subscribeTarget.pricingTier,
      priceMonthlyMyr: subscribeTarget.priceMonthlyMyr,
    });
    closeDialog();
  };

  const confirmFree = () => {
    if (!subscribeTarget) return;
    finalizeSubscription();
    toast.success(`You're following ${subscribeTarget.name} (free).`);
  };

  const confirmPaidSuccess = () => {
    if (!subscribeTarget) return;
    finalizeSubscription();
    toast.success(`Payment confirmed — you're following ${subscribeTarget.name}.`);
  };

  const startOrOpenChat = (avatar: MarketplaceListingCard) => {
    const isMine =
      userEntityIds.has(avatar.id) ||
      isPlatformBundledStudioId(avatar.id) ||
      (avatar.id === DASHBOARD_PRIMARY_AVATAR_ID && onboardingComplete && Boolean(persona.name?.trim()));
    if (!subscribedIds.has(avatar.id) && !isMine) {
      toast.info("Follow first to chat from Marketplace Chat.", { description: avatar.name });
      return;
    }
    navigate(`/marketplace/chat?open=${encodeURIComponent(avatar.id)}`);
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

      <Tabs defaultValue="my-avatars" className="w-full">
        <TabsList className="mb-4 grid w-full max-w-xl grid-cols-2">
          <TabsTrigger value="my-avatars">My Avatars</TabsTrigger>
          <TabsTrigger value="avatars">Browse Avatars</TabsTrigger>
        </TabsList>
        <TabsContent value="my-avatars" className="space-y-6">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">My Avatars</h2>
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
                    onChat={startOrOpenChat}
                  />
                ))}
              </div>
            )}
          </section>
        </TabsContent>
        <TabsContent value="avatars" className="space-y-6">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Avatars</h2>
            <p className="text-xs text-muted-foreground">
              Published avatars from other users and enterprise avatars.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBrowseAvatarType("user-generated")}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  browseAvatarType === "user-generated"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                User generated Avatars
              </button>
              <button
                type="button"
                onClick={() => setBrowseAvatarType("enterprise")}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  browseAvatarType === "enterprise"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                Enterprise Avatars
              </button>
            </div>

            {browseAvatarType === "user-generated" ? (
              subscribeIndividuals.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border py-4 text-center text-sm text-muted-foreground">
                  No user-created avatar listings available right now.
                </p>
              ) : (
                <div className="space-y-6 pt-2">
                  {subscribeIndividualsGrouped.map(({ category, items }) => (
                    <div key={category} className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</h4>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((avatar) => (
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
                  ))}
                </div>
              )
            ) : browseEnterpriseAvatars.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border py-4 text-center text-sm text-muted-foreground">
                No enterprise avatar listings available right now.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                {browseEnterpriseAvatars.map((avatar) => (
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
      </Tabs>
    </div>
  );
}
