import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type UserPreview = { content: string; attachments?: Array<{ id: string; name: string }> };

/** Latest assistant bubble only: sticky duplicate of the user message above scrollable reply. */
export function MarketplaceLatestResponsePanel({
  pairedUser,
  bubbleClassName,
  children,
}: {
  pairedUser: UserPreview;
  bubbleClassName?: string;
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showDown, setShowDown] = useState(false);

  const refresh = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      setShowDown(false);
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = el;
    const overflow = scrollHeight > clientHeight + 2;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 48;
    setShowDown(overflow && !nearBottom);
  }, []);

  useLayoutEffect(() => {
    refresh();
  }, [children, refresh]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => refresh();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [refresh]);

  const scrollDown = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const room = el.scrollHeight - el.scrollTop - el.clientHeight;
    const delta = Math.min(Math.max(el.clientHeight * 0.85, 120), room);
    el.scrollTo({ top: el.scrollTop + delta, behavior: "smooth" });
  }, []);

  return (
    <div
      className={cn(
        "flex max-h-[min(72dvh,40rem)] min-h-0 max-w-[92%] flex-col overflow-hidden rounded-xl sm:max-h-[min(70vh,36rem)] sm:max-w-[75%]",
        bubbleClassName,
      )}
    >
      <div className="sticky top-0 z-10 shrink-0 border-b border-border/60 bg-secondary/95 px-3 py-2 backdrop-blur-md supports-[backdrop-filter]:bg-secondary/90">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Your message (context)</p>
        {pairedUser.attachments && pairedUser.attachments.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {pairedUser.attachments.map((a) => (
              <span key={a.id} className="rounded-md bg-background/60 px-2 py-0.5 text-[11px]">
                {a.name}
              </span>
            ))}
          </div>
        ) : null}
        <p className="mt-1 text-sm font-medium leading-snug text-foreground">{pairedUser.content || "—"}</p>
      </div>
      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          className="h-full min-h-[6rem] overflow-y-auto overscroll-y-contain scroll-smooth px-3 py-2.5"
        >
          {children}
        </div>
        {showDown ? (
          <button
            type="button"
            aria-label="Scroll down for more"
            onClick={scrollDown}
            className="pointer-events-auto absolute bottom-2 left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-border/80 bg-background/95 text-muted-foreground shadow-md backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-muted hover:text-foreground"
          >
            <ChevronDown className="h-5 w-5" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
