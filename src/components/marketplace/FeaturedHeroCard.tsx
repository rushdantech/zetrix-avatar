import { useRef, type MouseEvent } from "react";
import { MessageCircle } from "lucide-react";
import type { MarketplaceListingCard } from "@/lib/studio/marketplace-listing";
import { featuredPromotionalHook } from "@/lib/studio/featured-marketplace";
import { browseAvatarSegmentChipLabel, browseAvatarSegmentForListing } from "@/lib/studio/marketplace-browse-categories";
import { MarketplaceFeaturedBadge } from "@/components/marketplace/MarketplaceFeaturedBadge";
import { UnverifiedRibbon } from "@/components/marketplace/UnverifiedRibbon";
import { VerifiedRibbon } from "@/components/marketplace/VerifiedRibbon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function publisherLabel(card: MarketplaceListingCard): string {
  if (card.marketplaceKind === "enterprise") return "Zetrix Platform";
  return card.ekycPublisherName?.trim() || "Independent creator";
}

type Props = {
  avatar: MarketplaceListingCard;
  subscribed: boolean;
  onChat: (a: MarketplaceListingCard) => void;
  onFollow: (a: MarketplaceListingCard) => void;
  onOpenProfile?: (a: MarketplaceListingCard, anchorRect: DOMRect) => void;
};

export function FeaturedHeroCard({ avatar, subscribed, onChat, onFollow, onOpenProfile }: Props) {
  const profileAnchorRef = useRef<HTMLDivElement>(null);
  const openProfile = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!onOpenProfile || !profileAnchorRef.current) return;
    onOpenProfile(avatar, profileAnchorRef.current.getBoundingClientRect());
  };
  const enterprise = avatar.marketplaceKind === "enterprise";
  const ekycVerified = !enterprise && Boolean(avatar.ekycVerified);
  const segmentLabel = browseAvatarSegmentChipLabel(browseAvatarSegmentForListing(avatar));
  const hook = featuredPromotionalHook(avatar);
  const kycRibbon = enterprise ? null : ekycVerified ? (
    <VerifiedRibbon size="default" />
  ) : (
    <UnverifiedRibbon size="default" />
  );

  const avatarMark = (
    <div
      className={cn(
        "flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl text-3xl font-bold shadow-inner sm:h-28 sm:w-28",
        enterprise ? "bg-info/20 text-info" : "bg-primary/20 text-primary",
      )}
    >
      {avatar.name.charAt(0)}
    </div>
  );

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card text-left shadow-lg",
        "border-amber-500/25 ring-1 ring-amber-500/20",
        "shadow-[0_12px_40px_-12px_rgba(245,158,11,0.15)]",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.12),transparent)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" aria-hidden />

      <div className="relative flex flex-col gap-6 p-5 sm:flex-row sm:items-stretch sm:gap-8 sm:p-7">
        {kycRibbon}
        <div ref={profileAnchorRef} className="flex w-full flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-8">
          <div className="flex justify-center sm:justify-start">
            {onOpenProfile ? (
              <button
                type="button"
                onClick={openProfile}
                className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                aria-label={`View profile: ${avatar.name}`}
              >
                {avatarMark}
              </button>
            ) : (
              avatarMark
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <MarketplaceFeaturedBadge size="md" />
              <span className="inline-flex rounded-full border border-border/80 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground/85">
                {segmentLabel}
              </span>
            </div>

            <div>
              {onOpenProfile ? (
                <button
                  type="button"
                  onClick={openProfile}
                  className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:w-auto"
                  aria-label={`View profile: ${avatar.name}`}
                >
                  <span className="block text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl">{avatar.name}</span>
                </button>
              ) : (
                <h3 className="text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl">{avatar.name}</h3>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground/80">Publisher:</span> {publisherLabel(avatar)}
              </p>
            </div>

          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{hook}</p>

          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-medium text-foreground">Pricing</span>
            {avatar.pricingTier === "free" ? (
              <span className="text-sm font-semibold text-success">Free</span>
            ) : (
              <span className="text-sm font-semibold text-foreground">
                RM {avatar.priceMonthlyMyr}
                <span className="font-normal text-muted-foreground"> / month</span>
              </span>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              type="button"
              className="w-full gap-2 gradient-primary text-primary-foreground hover:opacity-95 sm:w-auto"
              onClick={() => onChat(avatar)}
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Chat now
            </Button>
            {!subscribed && !avatar.isYours && (
              <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => onFollow(avatar)}>
                Follow
              </Button>
            )}
          </div>
        </div>
        </div>
      </div>
    </article>
  );
}
