import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Store } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";
import {
  DASHBOARD_PRIMARY_AVATAR_ID,
  isPlatformBundledStudioId,
  myStudioBrowseIndividualCards,
  subscriptionToSidebarCard,
  subscribeBrowseEnterprises,
  subscribeBrowseIndividuals,
  type MarketplaceListingCard,
} from "@/lib/studio/marketplace-listing";
import {
  AGENT_BROWSE_SECTION_ORDER,
  AVATAR_BROWSE_SECTION_ORDER,
  groupListingsByBrowseCategory,
} from "@/lib/studio/marketplace-browse-categories";
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
  const myCreatedAvatars = useMemo(() => myStudioBrowseIndividualCards(userStudioEntities), [userStudioEntities]);
  const subscribedAvatarCards = useMemo(
    () =>
      marketplaceSubscriptions
        .filter((s) => s.marketplaceKind === "individual")
        .map((s) => subscriptionToSidebarCard(s, merged)),
    [marketplaceSubscriptions, merged],
  );
  const subscribeIndividuals = useMemo(
    () => subscribeBrowseIndividuals(merged, userEntityIds),
    [merged, userEntityIds],
  );
  const subscribeEnterprises = useMemo(
    () => subscribeBrowseEnterprises(merged, userEntityIds),
    [merged, userEntityIds],
  );
  const subscribedIds = useMemo(() => new Set(marketplaceSubscriptions.map((s) => s.avatarId)), [marketplaceSubscriptions]);

  const myAvatars = useMemo(() => {
    const byId = new Map<string, MarketplaceListingCard>();
    for (const card of myCreatedAvatars) byId.set(card.id, card);
    for (const card of subscribedAvatarCards) if (!byId.has(card.id)) byId.set(card.id, card);
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [myCreatedAvatars, subscribedAvatarCards]);
  const myAvatarsGrouped = useMemo(
    () => groupListingsByBrowseCategory(myAvatars, AVATAR_BROWSE_SECTION_ORDER),
    [myAvatars],
  );
  const subscribeIndividualsGrouped = useMemo(
    () => groupListingsByBrowseCategory(subscribeIndividuals, AVATAR_BROWSE_SECTION_ORDER),
    [subscribeIndividuals],
  );
  const subscribeEnterprisesGrouped = useMemo(
    () => groupListingsByBrowseCategory(subscribeEnterprises, AGENT_BROWSE_SECTION_ORDER),
    [subscribeEnterprises],
  );

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
      marketplaceKind: subscribeTarget.marketplaceKind,
      pricingTier: subscribeTarget.pricingTier,
      priceMonthlyMyr: subscribeTarget.priceMonthlyMyr,
    });
    closeDialog();
  };

  const confirmFree = () => {
    if (!subscribeTarget) return;
    finalizeSubscription();
    toast.success(`You're subscribed to ${subscribeTarget.name} (free).`);
  };

  const confirmPaidSuccess = () => {
    if (!subscribeTarget) return;
    finalizeSubscription();
    toast.success(`Payment confirmed — you're subscribed to ${subscribeTarget.name}.`);
  };

  const startOrOpenChat = (avatar: MarketplaceListingCard) => {
    const isMine =
      userEntityIds.has(avatar.id) ||
      isPlatformBundledStudioId(avatar.id) ||
      (avatar.id === DASHBOARD_PRIMARY_AVATAR_ID && onboardingComplete && Boolean(persona.name?.trim()));
    if (!subscribedIds.has(avatar.id) && !isMine) {
      toast.info("Subscribe first to chat from Marketplace Chat.", { description: avatar.name });
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
          <h1 className="text-xl font-bold text-foreground">Browse marketplace</h1>
          <p className="text-sm text-muted-foreground">
            Browse and subscribe to published listings. Chat is available after subscription.
          </p>
        </div>
      </div>

      <Dialog open={subscribeTarget !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-md">
          {!isPaid && subscribeTarget && (
            <>
              <DialogHeader>
                <DialogTitle>Confirm subscription</DialogTitle>
                <DialogDescription>
                  Subscribe to {subscribeTarget.name} ({subscribeTarget.marketplaceKind === "enterprise" ? "AI agent" : "Avatar"}).
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
                  Confirm subscription
                </Button>
              </DialogFooter>
            </>
          )}

          {isPaid && subscribeTarget && paidStep === "subscription" && (
            <>
              <DialogHeader>
                <DialogTitle>Subscribe</DialogTitle>
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
                  confirmed (demo). {subscribeTarget.name} is now in your subscriptions.
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
        <TabsList className="mb-4 grid w-full max-w-xl grid-cols-3">
          <TabsTrigger value="my-avatars">My Avatars</TabsTrigger>
          <TabsTrigger value="avatars">Avatars</TabsTrigger>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
        </TabsList>
        <TabsContent value="my-avatars" className="space-y-6">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">My Avatars</h2>
            <p className="text-xs text-muted-foreground">
              Avatars you created and avatars you subscribed to.
            </p>
            {myAvatars.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                No avatars yet. Create one in Avatar Studio or subscribe from the Avatars tab.
              </p>
            ) : (
              <div className="space-y-6">
                {myAvatarsGrouped.map(({ category, items }) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((avatar) => (
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
                  </div>
                ))}
              </div>
            )}
          </section>
        </TabsContent>
        <TabsContent value="avatars" className="space-y-6">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Avatars</h2>
            <p className="text-xs text-muted-foreground">
              Published avatars by other users.
            </p>
            {subscribeIndividuals.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                No published avatar listings available right now.
              </p>
            ) : (
              <div className="space-y-6">
                {subscribeIndividualsGrouped.map(({ category, items }) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</h3>
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
            )}
          </section>
        </TabsContent>
        <TabsContent value="agents" className="space-y-6">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">AI Agents</h2>
            <p className="text-xs text-muted-foreground">
              Published AI agents by other users.
            </p>
            {subscribeEnterprises.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                No published AI agent listings available right now.
              </p>
            ) : (
              <div className="space-y-6">
                {subscribeEnterprisesGrouped.map(({ category, items }) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</h3>
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
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
