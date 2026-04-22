import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MsgUserTask } from "@/lib/studio/avatarclaw-runtime-sessions";

/**
 * Wraps only the **latest** bot execution card: duplicate of the paired user request
 * stays sticky at the top of this card while the response body scrolls; down-arrow when overflow.
 * Does not alter the original user bubble in the thread.
 */
export function AvatarClawLatestResponsePanel({
  pairedUserTask,
  className,
  children,
}: {
  pairedUserTask: MsgUserTask;
  className?: string;
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
        "flex max-h-[min(72dvh,40rem)] min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm sm:max-h-[min(70vh,36rem)]",
        className,
      )}
    >
      <div className="sticky top-0 z-10 shrink-0 border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur-md supports-[backdrop-filter]:bg-card/90">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Your request (context)</p>
        <p className="mt-1 text-sm font-medium leading-snug text-foreground">{pairedUserTask.goal}</p>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {pairedUserTask.constraints} · {pairedUserTask.deadline}
        </p>
      </div>
      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          className="h-full max-h-[inherit] min-h-[8rem] overflow-y-auto overscroll-y-contain scroll-smooth px-4 py-3"
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
