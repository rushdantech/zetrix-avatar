import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, Loader2, Sparkles } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";
import { deriveMyIndividualMarketplaceCards } from "@/lib/studio/marketplace-listing";
import { listingsForAvatarMatch } from "@/lib/avatar-match/match-marketplace-list";
import { matchQualityLabel, stableMockMatchPercent } from "@/lib/avatar-match/mock-match-scoring";
import { AvatarSelector } from "@/components/avatar-match/AvatarSelector";
import { TopMatchesSection, type MatchRow } from "@/components/avatar-match/TopMatchesSection";
import { cn } from "@/lib/utils";

export default function AvatarMatch() {
  const { userStudioEntities, onboardingComplete, persona } = useApp();
  const merged = useMergedStudioEntities();

  const ownedOptions = useMemo(
    () => deriveMyIndividualMarketplaceCards(userStudioEntities, merged, onboardingComplete, persona),
    [userStudioEntities, merged, onboardingComplete, persona],
  );

  const [selectedUserAvatarId, setSelectedUserAvatarId] = useState<string | null>(null);
  const [matchRows, setMatchRows] = useState<MatchRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!selectedUserAvatarId) {
      setMatchRows(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setMatchRows(null);
    const delayMs = 500 + Math.random() * 1000;
    timerRef.current = setTimeout(() => {
      const listings = listingsForAvatarMatch(merged, selectedUserAvatarId);
      const rows: MatchRow[] = listings.map((listing) => {
        const percent = stableMockMatchPercent(selectedUserAvatarId, listing.id);
        return {
          listing,
          percent,
          label: matchQualityLabel(percent),
        };
      });
      rows.sort((a, b) => b.percent - a.percent);
      setMatchRows(rows);
      setLoading(false);
      timerRef.current = null;
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [selectedUserAvatarId, merged]);

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <HeartHandshake className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Avatar Match</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Pick one of your avatars to see mock compatibility scores against marketplace avatars. Real harness
              comparison will replace these scores in a future release.
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Choose your avatar</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Select an avatar you own or control from Avatar Studio. We’ll compare it to published marketplace listings.
        </p>
        <div className="mt-4">
          {ownedOptions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-secondary/30 px-4 py-6 text-center text-sm text-muted-foreground">
              <Sparkles className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
              <p>You don’t have any avatars yet.</p>
              <Link
                to="/studio/avatars/create"
                className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
              >
                Create an avatar →
              </Link>
            </div>
          ) : (
            <AvatarSelector
              options={ownedOptions}
              value={selectedUserAvatarId}
              onChange={(id) => setSelectedUserAvatarId(id)}
              id="avatar-match-owned"
            />
          )}
        </div>
      </section>

      {!selectedUserAvatarId && ownedOptions.length > 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/20 px-6 py-16 text-center">
          <HeartHandshake className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-foreground">Choose an avatar to see matches</p>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">
            Select one of your avatars above. We’ll show marketplace avatars ranked by mock match percentage.
          </p>
        </div>
      )}

      {selectedUserAvatarId && loading && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
            <span>Calculating matches…</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-64 animate-pulse rounded-xl border border-border bg-secondary/40",
                  "transition-opacity duration-300",
                )}
              />
            ))}
          </div>
        </div>
      )}

      {selectedUserAvatarId && !loading && matchRows && matchRows.length === 0 && (
        <p className="text-sm text-muted-foreground">No marketplace avatars to compare yet.</p>
      )}

      {selectedUserAvatarId && !loading && matchRows && matchRows.length > 0 && (
        <TopMatchesSection rows={matchRows} />
      )}
    </div>
  );
}
