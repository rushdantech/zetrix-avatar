import { MessageCircle, Sparkles } from "lucide-react";
import type { MarketplaceFollowUpdateFeedItem } from "@/types/marketplace-follow";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  items: MarketplaceFollowUpdateFeedItem[];
  seenIds: Set<string>;
  onChat: (avatarId: string) => void;
  onViewAvatar: (avatarId: string) => void;
  onWhatChanged: (item: MarketplaceFollowUpdateFeedItem) => void;
};

export function FollowingUpdatesFeed({ items, seenIds, onChat, onViewAvatar, onWhatChanged }: Props) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
        No updates yet. Follow avatars from Browse to see personality tweaks and new traits here.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const unread = !seenIds.has(item.id);
        return (
          <li
            key={item.id}
            className={cn(
              "rounded-xl border bg-card p-4 shadow-sm transition-colors",
              unread ? "border-primary/25 ring-1 ring-primary/10" : "border-border",
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
                  "bg-primary/15 text-primary",
                )}
              >
                {item.avatarName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground">{item.avatarName}</span>
                  {item.avatarIsFeatured ? (
                    <span
                      className="inline-flex items-center gap-0.5 rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-950 dark:text-amber-100"
                      title="Featured on Browse"
                    >
                      <Sparkles className="h-3 w-3" aria-hidden />
                      Featured
                    </span>
                  ) : null}
                  {unread ? (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      New
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground/80">Publisher:</span> {item.publisherName}
                </p>
                <p className="text-xs font-medium text-primary">{item.updateTypeLabel}</p>
                <p className="text-sm leading-relaxed text-foreground/90">{item.summary}</p>
                <p className="text-[11px] text-muted-foreground">{formatRelativeTime(item.occurredAt)}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border/80 pt-3">
              <Button type="button" size="sm" variant="default" className="gap-1.5" onClick={() => onChat(item.avatarId)}>
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                Chat
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => onViewAvatar(item.avatarId)}>
                View avatar
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => onWhatChanged(item)}>
                What changed
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
