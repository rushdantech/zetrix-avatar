import { MessageCircle, Sparkles } from "lucide-react";
import type { MarketplaceFollowUpdateFeedItem } from "@/types/marketplace-follow";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Props = {
  item: MarketplaceFollowUpdateFeedItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartChat: (avatarId: string) => void;
  onViewAvatar: (avatarId: string) => void;
  /** Called when the sheet opens so unread state can clear */
  onMarkSeen: (updateId: string) => void;
};

export function WhatChangedDialog({ item, open, onOpenChange, onStartChat, onViewAvatar, onMarkSeen }: Props) {
  const p = item?.whatChanged;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next && item) onMarkSeen(item.id);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-lg">
        {item && p && (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
                    "bg-primary/20 text-primary",
                  )}
                >
                  {item.avatarName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-left leading-snug">{p.title}</DialogTitle>
                  <DialogDescription className="text-left">
                    {item.avatarName}
                    {p.versionLabel ? (
                      <span className="text-muted-foreground"> · {p.versionLabel}</span>
                    ) : null}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Before</p>
                <ul className="mt-1.5 space-y-1 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm">
                  {Object.entries(p.traitsBefore).map(([k, v]) => (
                    <li key={k}>
                      <span className="font-medium text-foreground">{k}:</span>{" "}
                      <span className="text-muted-foreground">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">After</p>
                <ul className="mt-1.5 space-y-1 rounded-lg border border-primary/20 bg-primary/[0.06] px-3 py-2 text-sm">
                  {Object.entries(p.traitsAfter).map(([k, v]) => {
                    const changed = p.changedTraitKeys.includes(k);
                    return (
                      <li key={k} className={cn(changed && "font-medium text-foreground")}>
                        <span className="font-medium text-foreground">{k}:</span>{" "}
                        <span className={cn(changed ? "text-foreground" : "text-muted-foreground")}>{v}</span>
                        {changed ? (
                          <Sparkles className="ml-1 inline h-3.5 w-3.5 text-amber-500" aria-hidden />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">
                Changed: {p.changedTraitKeys.join(", ")}. Your next chats will pick up these vibes automatically.
              </p>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onViewAvatar(item.avatarId)}>
                View avatar
              </Button>
              <Button
                type="button"
                className="w-full gap-2 gradient-primary text-primary-foreground hover:opacity-95 sm:w-auto"
                onClick={() => onStartChat(item.avatarId)}
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                Start chatting
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
