import { useRef, type MouseEvent } from "react";
import { MessageCircle, Phone } from "lucide-react";
import type { MarketplaceListingCard } from "@/lib/studio/marketplace-listing";
import { featuredPromotionalHook } from "@/lib/studio/featured-marketplace";
import { browseAvatarSegmentChipLabel, browseAvatarSegmentForListing } from "@/lib/studio/marketplace-browse-categories";
import { MarketplaceFeaturedBadge } from "@/components/marketplace/MarketplaceFeaturedBadge";
import { MarketplaceListingWhatsAppCorner } from "@/components/marketplace/MarketplaceListingWhatsAppCorner";
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
  onCall?: (a: MarketplaceListingCard) => void;
};

export function FeaturedPromoCard({ avatar, subscribed, onChat, onFollow, onOpenProfile, onCall }: Props) {
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
    <VerifiedRibbon size="compact" />
  ) : (
    <UnverifiedRibbon size="compact" />
  );

  const avatarMark = (
    <div
      className={cn(
        "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
        enterprise ? "bg-info/20 text-info" : "bg-primary/20 text-primary",
      )}
    >
      {avatar.name.charAt(0)}
    </div>
  );

  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-xl border bg-card text-left",
        "border-amber-500/20 ring-1 ring-amber-500/10 shadow-md",
        "transition-[box-shadow,transform] duration-200 hover:border-amber-500/35 hover:shadow-lg",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-500/[0.06] to-transparent"
        aria-hidden
      />
      {kycRibbon}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div ref={profileAnchorRef} className="flex items-start gap-3">
          {onOpenProfile ? (
            <button
              type="button"
              onClick={openProfile}
              className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              aria-label={`View profile: ${avatar.name}`}
            >
              {avatarMark}
            </button>
          ) : (
            avatarMark
          )}
          <div className="min-w-0 flex-1 space-y-1.5">
            <MarketplaceFeaturedBadge size="xs" />
            {onOpenProfile ? (
              <button
                type="button"
                onClick={openProfile}
                className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                aria-label={`View profile: ${avatar.name}`}
              >
                <span className="line-clamp-2 block text-sm font-semibold leading-snug text-foreground">{avatar.name}</span>
              </button>
            ) : (
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{avatar.name}</h3>
            )}
            <p className="text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground/75">Publisher:</span> {publisherLabel(avatar)}
            </p>
            <span className="inline-flex w-fit rounded-full border border-border/70 bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-foreground/80">
              {segmentLabel}
            </span>
          </div>
        </div>
        <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{hook}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
          <MarketplaceListingWhatsAppCorner avatarId={avatar.id} variant="inline" />
          {avatar.pricingTier === "free" ? (
            <span className="text-xs font-semibold text-success">Free</span>
          ) : (
            <span className="text-xs font-semibold text-foreground">RM {avatar.priceMonthlyMyr}/mo</span>
          )}
        </div>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 border-t border-border/80 bg-secondary/20 px-3 py-3">
        <Button type="button" size="sm" variant="default" className="flex-1 gap-1.5 min-w-[7rem]" onClick={() => onChat(avatar)}>
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          Chat
        </Button>
        {onCall ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5 min-w-[7rem]"
            onClick={() => onCall(avatar)}
          >
            <Phone className="h-3.5 w-3.5" aria-hidden />
            Call
          </Button>
        ) : null}
        {!subscribed && !avatar.isYours ? (
          <Button type="button" size="sm" variant="secondary" className="flex-1 min-w-[7rem]" onClick={() => onFollow(avatar)}>
            Follow
          </Button>
        ) : null}
      </div>
    </article>
  );
}
