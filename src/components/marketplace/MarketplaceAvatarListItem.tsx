import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { browseCategoryForListing } from "@/lib/studio/marketplace-browse-categories";
import type { MarketplaceListingCard } from "@/lib/studio/marketplace-listing";

const STUDIO_STATUS = new Set(["draft", "active", "published", "archived"]);

type Props = {
  avatar: MarketplaceListingCard;
  subscribed: boolean;
  onSubscribe: (a: MarketplaceListingCard) => void;
  onChat: (a: MarketplaceListingCard) => void;
};

export function MarketplaceAvatarListItem({ avatar, subscribed, onSubscribe, onChat }: Props) {
  const enterprise = avatar.marketplaceKind === "enterprise";
  const browseCategory = browseCategoryForListing(avatar);
  const statusLabel = avatar.category && STUDIO_STATUS.has(String(avatar.category).toLowerCase()) ? avatar.category : null;

  const inner = (
    <>
      <div
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold",
          enterprise ? "bg-info/20 text-info" : "gradient-primary text-primary-foreground",
          avatar.isYours && enterprise && "font-bold",
          !avatar.isYours && enterprise && "font-semibold",
          !avatar.isYours && !enterprise && "bg-primary/20 text-primary font-semibold",
        )}
      >
        {avatar.name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{avatar.name}</p>
        <span
          className={cn(
            "mr-1 inline-block rounded-full border border-border/80 bg-muted/50 px-1.5 py-0.5 text-[9px] font-medium text-foreground/90",
          )}
        >
          {browseCategory}
        </span>
        <span
          className={cn(
            "mr-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-medium",
            enterprise ? "bg-blue-500/15 text-blue-700 dark:text-blue-300" : "bg-purple-500/15 text-purple-700 dark:text-purple-300",
          )}
        >
          {enterprise ? "AI agent" : "Avatar"}
        </span>
        {statusLabel && (
          <span className="mr-1 inline-block rounded-full bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground">
            {statusLabel}
          </span>
        )}
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
          "flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-all",
          enterprise ? "hover:border-info/40 hover:bg-secondary/50" : "hover:border-primary/40 hover:bg-secondary/50",
        )}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
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
          <span className="text-[11px] font-medium text-success">Subscribed</span>
        ) : (
          <button
            type="button"
            onClick={() => onSubscribe(avatar)}
            className="rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20"
          >
            Subscribe
          </button>
        )}
      </div>
    </div>
  );
}
