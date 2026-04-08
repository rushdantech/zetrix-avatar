import type { MarketplaceListingCard } from "@/lib/studio/marketplace-listing";
import type { MatchQualityLabel } from "@/lib/avatar-match/mock-match-scoring";
import { MarketplaceMatchCard } from "./MarketplaceMatchCard";

export type MatchRow = {
  listing: MarketplaceListingCard;
  percent: number;
  label: MatchQualityLabel;
};

type Props = {
  rows: MatchRow[];
};

export function TopMatchesSection({ rows }: Props) {
  if (rows.length === 0) return null;

  const topThree = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div className="space-y-8">
      {topThree.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Top matches</h2>
          <p className="text-xs text-muted-foreground">Highest compatibility scores for your selected avatar.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topThree.map((row, i) => (
              <MarketplaceMatchCard
                key={row.listing.id}
                listing={row.listing}
                percent={row.percent}
                label={row.label}
                rankIndex={i}
              />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">More matches</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rest.map((row, i) => (
              <MarketplaceMatchCard
                key={row.listing.id}
                listing={row.listing}
                percent={row.percent}
                label={row.label}
                rankIndex={i + 3}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
