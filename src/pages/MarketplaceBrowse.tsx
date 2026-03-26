import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Store } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";
import {
  browseCatalogEnterprises,
  browseCatalogIndividuals,
  type MarketplaceListingCard,
} from "@/lib/studio/marketplace-listing";
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
  const { marketplaceSubscriptions, addMarketplaceSubscription } = useApp();
  const merged = useMergedStudioEntities();
  const individuals = useMemo(() => browseCatalogIndividuals(merged), [merged]);
  const enterprises = useMemo(() => browseCatalogEnterprises(merged), [merged]);
  const subscribedIds = useMemo(() => new Set(marketplaceSubscriptions.map((s) => s.avatarId)), [marketplaceSubscriptions]);

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
    if (!subscribedIds.has(avatar.id)) {
      toast.info("Subscribe first to chat from Marketplace Chat.", { description: avatar.name });
      return;
    }
    navigate(`/marketplace?open=${encodeURIComponent(avatar.id)}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20 lg:pb-8">
      <div className="flex flex-wrap items-start gap-4">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Marketplace Chat
        </Link>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Store className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Browse marketplace</h1>
          <p className="text-sm text-muted-foreground">
            Discover avatars and AI agents. Subscribe to add them to your Marketplace Chat sidebar.
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

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="mb-4 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="individual">Avatars</TabsTrigger>
          <TabsTrigger value="enterprise">AI Agents</TabsTrigger>
        </TabsList>
        <TabsContent value="individual" className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">All avatar listings</h2>
          <div className="space-y-2">
            {individuals.map((avatar) => (
              <MarketplaceAvatarListItem
                key={avatar.id}
                avatar={avatar}
                subscribed={subscribedIds.has(avatar.id)}
                onSubscribe={setSubscribeTarget}
                onChat={startOrOpenChat}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="enterprise" className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">All agent listings</h2>
          <div className="space-y-2">
            {enterprises.map((avatar) => (
              <MarketplaceAvatarListItem
                key={avatar.id}
                avatar={avatar}
                subscribed={subscribedIds.has(avatar.id)}
                onSubscribe={setSubscribeTarget}
                onChat={startOrOpenChat}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
