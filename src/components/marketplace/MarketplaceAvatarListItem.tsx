import { useRef, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  browseAvatarSegmentChipLabel,
  browseAvatarSegmentForListing,
  isMarketplaceListingFeatured,
} from "@/lib/studio/marketplace-browse-categories";
import type { MarketplaceListingCard } from "@/lib/studio/marketplace-listing";
import { MarketplaceFeaturedBadge } from "@/components/marketplace/MarketplaceFeaturedBadge";
import { UnverifiedRibbon } from "@/components/marketplace/UnverifiedRibbon";
import { VerifiedRibbon } from "@/components/marketplace/VerifiedRibbon";

const STUDIO_STATUS = new Set(["draft", "active", "published", "archived"]);

type Props = {
  avatar: MarketplaceListingCard;
  subscribed: boolean;
  onSubscribe: (a: MarketplaceListingCard) => void;
  onUnfollow?: (a: MarketplaceListingCard) => void;
  onChat: (a: MarketplaceListingCard) => void;
  /** Discover / browse: open anchored profile when clicking avatar or name (card variant). */
  onOpenProfile?: (a: MarketplaceListingCard, anchorRect: DOMRect) => void;
  /** `list` = horizontal row (sidebar). `card` = box tile for marketplace browse grid. */
  variant?: "list" | "card";
  /**
   * Following tab: use browse-style card even when `avatar.isYours` (subscriptions are flagged yours for chat).
   * Shows Following + unfollow, never Follow.
   */
  surface?: "default" | "following";
  /** Show “Updated” chip (unseen activity). Coexists with Featured. */
  showUpdatedBadge?: boolean;
};

function ChipRow({
  browseCategory,
  enterprise,
  statusLabel,
  featured,
  showUpdatedBadge,
  compact,
}: {
  browseCategory: string;
  enterprise: boolean;
  statusLabel: string | null;
  featured: boolean;
  showUpdatedBadge?: boolean;
  compact?: boolean;
}) {
  const chip = compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]";
  return (
    <div className={cn("flex flex-wrap gap-1", compact ? "" : "justify-center sm:justify-start")}>
      <span
        className={cn(
          "inline-block rounded-full border border-border/80 bg-muted/50 font-medium text-foreground/90",
          chip,
        )}
      >
        {browseCategory}
      </span>
      {featured && <MarketplaceFeaturedBadge size={compact ? "xs" : "sm"} />}
      {showUpdatedBadge && (
        <span
          className={cn(
            "inline-block rounded-full border border-sky-500/40 bg-sky-500/12 font-medium text-sky-950 dark:text-sky-100",
            chip,
          )}
        >
          Updated
        </span>
      )}
      <span
        className={cn(
          "inline-block rounded-full font-medium",
          chip,
          enterprise ? "bg-blue-500/15 text-blue-700 dark:text-blue-300" : "bg-purple-500/15 text-purple-700 dark:text-purple-300",
        )}
      >
        {enterprise ? "AI agent" : "Avatar"}
      </span>
      {statusLabel && (
        <span className={cn("inline-block rounded-full bg-secondary font-medium text-muted-foreground", chip)}>
          {statusLabel}
        </span>
      )}
    </div>
  );
}

function CardProfileOrStatic({
  avatarMark,
  name,
  avatar,
  onOpenProfile,
}: {
  avatarMark: ReactNode;
  name: string;
  avatar: MarketplaceListingCard;
  onOpenProfile?: (a: MarketplaceListingCard, rect: DOMRect) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  if (!onOpenProfile) {
    return (
      <>
        {avatarMark}
        <p className="w-full text-center text-sm font-semibold leading-tight sm:text-left">{name}</p>
      </>
    );
  }
  const open = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = ref.current;
    if (!el) return;
    onOpenProfile(avatar, el.getBoundingClientRect());
  };
  return (
    <div ref={ref} className="flex flex-col items-center gap-2 sm:items-start">
      <button
        type="button"
        onClick={open}
        className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        aria-label={`View profile: ${name}`}
      >
        {avatarMark}
      </button>
      <button
        type="button"
        onClick={open}
        className="w-full text-center text-sm font-semibold leading-tight text-foreground hover:underline sm:text-left"
        aria-label={`View profile: ${name}`}
      >
        {name}
      </button>
    </div>
  );
}

function PublisherLine({ name, compact }: { name: string; compact?: boolean }) {
  return (
    <p
      className={cn(
        "w-full text-muted-foreground",
        compact ? "text-[9px] leading-tight" : "text-[10px] sm:text-[11px] leading-snug",
      )}
    >
      <span className="font-medium text-foreground/80">Publisher:</span> {name}
    </p>
  );
}

export function MarketplaceAvatarListItem({
  avatar,
  subscribed,
  onSubscribe,
  onUnfollow,
  onChat,
  onOpenProfile,
  variant = "list",
  surface = "default",
  showUpdatedBadge = false,
}: Props) {
  const enterprise = avatar.marketplaceKind === "enterprise";
  const browseCategory = browseAvatarSegmentChipLabel(browseAvatarSegmentForListing(avatar));
  const featured = isMarketplaceListingFeatured(avatar);
  const followingSurface = surface === "following";
  const statusLabel = avatar.category && STUDIO_STATUS.has(String(avatar.category).toLowerCase()) ? avatar.category : null;
  const ekycVerified = !enterprise && Boolean(avatar.ekycVerified);
  const publisherName = !enterprise && avatar.ekycPublisherName?.trim() ? avatar.ekycPublisherName.trim() : null;
  const kycRibbon = enterprise ? null : ekycVerified ? (
    <VerifiedRibbon size={variant === "card" ? "default" : "compact"} />
  ) : (
    <UnverifiedRibbon size={variant === "card" ? "default" : "compact"} />
  );

  const avatarMark = (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-center rounded-xl font-bold",
        variant === "card" ? "h-14 w-14 text-lg" : "h-10 w-10 rounded-lg text-sm",
        enterprise ? "bg-info/20 text-info" : "gradient-primary text-primary-foreground",
        avatar.isYours && enterprise && "font-bold",
        !avatar.isYours && enterprise && "font-semibold",
        !avatar.isYours && !enterprise && "bg-primary/20 text-primary font-semibold",
      )}
    >
      {avatar.name.charAt(0)}
    </div>
  );

  if (variant === "card") {
    if (avatar.isYours && !followingSurface) {
      const showUnfollow = subscribed && !!onUnfollow;
      return (
        <div
          className={cn(
            "relative flex h-full min-h-[200px] w-full flex-col rounded-xl border border-border bg-card text-left shadow-card transition-all",
            enterprise ? "hover:border-info/40 hover:bg-secondary/30" : "hover:border-primary/40 hover:bg-secondary/30",
          )}
        >
          {kycRibbon}
          {onOpenProfile ? (
            <div className="flex flex-1 flex-col p-4 text-left">
              <CardProfileOrStatic
                avatarMark={avatarMark}
                name={avatar.name}
                avatar={avatar}
                onOpenProfile={onOpenProfile}
              />
              <button
                type="button"
                onClick={() => onChat(avatar)}
                className="mt-2 flex flex-1 flex-col items-center gap-2 text-left transition-colors hover:bg-secondary/30 sm:items-start"
              >
                <ChipRow
                  browseCategory={browseCategory}
                  enterprise={enterprise}
                  statusLabel={statusLabel}
                  featured={featured}
                  showUpdatedBadge={showUpdatedBadge}
                />
                {publisherName && <PublisherLine name={publisherName} />}
                <p className="line-clamp-3 w-full text-center text-[11px] leading-snug text-muted-foreground sm:text-left">{avatar.bio}</p>
                <div className="mt-auto flex w-full items-center justify-end gap-1 pt-3 text-[11px] font-medium text-primary">
                  Chat <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => onChat(avatar)} className="flex flex-1 flex-col p-4 text-left">
              <div className="flex flex-col items-center gap-2 sm:items-start">
                {avatarMark}
                <p className="w-full text-center text-sm font-semibold leading-tight sm:text-left">{avatar.name}</p>
                <ChipRow
                  browseCategory={browseCategory}
                  enterprise={enterprise}
                  statusLabel={statusLabel}
                  featured={featured}
                  showUpdatedBadge={showUpdatedBadge}
                />
                {publisherName && <PublisherLine name={publisherName} />}
                <p className="line-clamp-3 w-full text-center text-[11px] leading-snug text-muted-foreground sm:text-left">{avatar.bio}</p>
              </div>
              <div className="mt-auto flex items-center justify-end gap-1 pt-3 text-[11px] font-medium text-primary">
                Chat <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </button>
          )}
          {showUnfollow && (
            <div className="flex items-center justify-end border-t border-border bg-secondary/25 px-4 py-3">
              <button
                type="button"
                onClick={() => onUnfollow(avatar)}
                className="rounded-md bg-destructive/10 px-3 py-1.5 text-[11px] font-semibold text-destructive hover:bg-destructive/20"
              >
                Unfollow
              </button>
            </div>
          )}
          {!showUnfollow && (
            <div className="px-4 pb-4" />
          )}
        </div>
      );
    }
    return (
      <div className="relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {kycRibbon}
        {onOpenProfile ? (
          <div className="flex flex-1 flex-col p-4 text-left">
            <CardProfileOrStatic
              avatarMark={avatarMark}
              name={avatar.name}
              avatar={avatar}
              onOpenProfile={onOpenProfile}
            />
            <button
              type="button"
              onClick={() => onChat(avatar)}
              className="mt-2 flex flex-1 flex-col items-center gap-2 text-left transition-colors hover:bg-secondary/40 sm:items-start"
            >
              <ChipRow
                browseCategory={browseCategory}
                enterprise={enterprise}
                statusLabel={statusLabel}
                featured={featured}
                showUpdatedBadge={showUpdatedBadge}
              />
              {publisherName && <PublisherLine name={publisherName} />}
              <p className="line-clamp-3 w-full text-center text-[11px] leading-snug text-muted-foreground sm:text-left">{avatar.bio}</p>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onChat(avatar)}
            className="flex flex-1 flex-col p-4 text-left transition-colors hover:bg-secondary/40"
          >
            <div className="flex flex-col items-center gap-2 sm:items-start">
              {avatarMark}
              <p className="w-full text-center text-sm font-semibold leading-tight sm:text-left">{avatar.name}</p>
              <ChipRow
                browseCategory={browseCategory}
                enterprise={enterprise}
                statusLabel={statusLabel}
                featured={featured}
                showUpdatedBadge={showUpdatedBadge}
              />
              {publisherName && <PublisherLine name={publisherName} />}
              <p className="line-clamp-3 w-full text-center text-[11px] leading-snug text-muted-foreground sm:text-left">{avatar.bio}</p>
            </div>
          </button>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-secondary/25 px-4 py-3">
          <span className="text-[11px] font-medium">
            {avatar.pricingTier === "free" ? (
              <span className="text-success">Free</span>
            ) : (
              <span className="text-foreground">RM {avatar.priceMonthlyMyr}/mo</span>
            )}
          </span>
          {followingSurface ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium text-success">Following</span>
              {onUnfollow ? (
                <button
                  type="button"
                  onClick={() => onUnfollow(avatar)}
                  className="rounded-md bg-destructive/10 px-3 py-1.5 text-[11px] font-semibold text-destructive hover:bg-destructive/20"
                >
                  Unfollow
                </button>
              ) : null}
            </div>
          ) : subscribed ? (
            onUnfollow ? (
              <button
                type="button"
                onClick={() => onUnfollow(avatar)}
                className="rounded-md bg-destructive/10 px-3 py-1.5 text-[11px] font-semibold text-destructive hover:bg-destructive/20"
              >
                Unfollow
              </button>
            ) : (
              <span className="text-[11px] font-medium text-success">Following</span>
            )
          ) : (
            <button
              type="button"
              onClick={() => onSubscribe(avatar)}
              className="rounded-md bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/20"
            >
              Follow
            </button>
          )}
        </div>
      </div>
    );
  }

  const inner = (
    <>
      {avatarMark}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{avatar.name}</p>
        <ChipRow
          browseCategory={browseCategory}
          enterprise={enterprise}
          statusLabel={statusLabel}
          featured={featured}
          showUpdatedBadge={showUpdatedBadge}
          compact
        />
        {publisherName && <PublisherLine name={publisherName} compact />}
        <p className="line-clamp-2 text-[10px] text-muted-foreground">{avatar.bio}</p>
      </div>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
    </>
  );

  if (avatar.isYours) {
    return (
      <button
        type="button"
        onClick={() => onChat(avatar)}
        className={cn(
          "relative flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-all",
          enterprise ? "hover:border-info/40 hover:bg-secondary/50" : "hover:border-primary/40 hover:bg-secondary/50",
        )}
      >
        {kycRibbon}
        {inner}
      </button>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card">
      {kycRibbon}
      <button
        type="button"
        onClick={() => onChat(avatar)}
        className={cn(
          "flex w-full items-center gap-3 p-3 text-left transition-all",
          enterprise ? "hover:bg-secondary/50" : "hover:bg-secondary/50",
        )}
      >
        {inner}
      </button>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-secondary/20 px-3 py-2">
        <span className="text-[11px] font-medium">
          {avatar.pricingTier === "free" ? (
            <span className="text-success">Free</span>
          ) : (
            <span className="text-foreground">RM {avatar.priceMonthlyMyr}/mo</span>
          )}
        </span>
        {subscribed ? (
          onUnfollow ? (
            <button
              type="button"
              onClick={() => onUnfollow(avatar)}
              className="rounded-md bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive hover:bg-destructive/20"
            >
              Unfollow
            </button>
          ) : (
            <span className="text-[11px] font-medium text-success">Following</span>
          )
        ) : (
          <button
            type="button"
            onClick={() => onSubscribe(avatar)}
            className="rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20"
          >
            Follow
          </button>
        )}
      </div>
    </div>
  );
}
