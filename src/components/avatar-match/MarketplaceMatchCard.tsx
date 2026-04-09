import { cn } from "@/lib/utils";
import type { MarketplaceListingCard } from "@/lib/studio/marketplace-listing";
import type { MatchQualityLabel } from "@/lib/avatar-match/mock-match-scoring";
import { MatchScore } from "./MatchScore";

type Props = {
  listing: MarketplaceListingCard;
  percent: number;
  label: MatchQualityLabel;
  rankIndex: number;
};

export function MarketplaceMatchCard({ listing, percent, label, rankIndex }: Props) {
  const isTopThree = rankIndex < 3;

  return (
    <div
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border bg-card text-left shadow-card transition-all duration-200",
        "hover:border-primary/35 hover:shadow-md hover:-translate-y-0.5",
        isTopThree && "border-primary/45 ring-2 ring-primary/15 shadow-glow",
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary/50">
        <div
          className={cn(
            "flex h-full w-full items-center justify-center text-4xl font-bold transition-transform duration-200 group-hover:scale-[1.03]",
            listing.marketplaceKind === "enterprise"
              ? "bg-gradient-to-br from-info/25 to-info/5 text-info"
              : "gradient-primary text-primary-foreground",
          )}
        >
          {listing.name.slice(0, 1)}
        </div>
        {isTopThree && (
          <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
            Top {rankIndex + 1}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-sm font-semibold leading-tight">{listing.name}</h3>
          {listing.marketplaceKind === "individual" && listing.ekycVerified && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              <span className="rounded-full border border-success/30 bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                Verified
              </span>
            </div>
          )}
          {listing.marketplaceKind === "individual" && listing.ekycPublisherName?.trim() && (
            <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
              <span className="font-medium text-foreground/80">Publisher:</span> {listing.ekycPublisherName.trim()}
            </p>
          )}
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground">{listing.bio}</p>
        </div>
        <div className="mt-auto border-t border-border pt-3">
          <MatchScore percent={percent} label={label} large={false} />
        </div>
      </div>
    </div>
  );
}
