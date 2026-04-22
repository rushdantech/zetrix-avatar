import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * UI-only layout for the **current** assistant bubble: a fixed top strip (caller-supplied,
 * typically the latest user text) and a scrollable assistant body with an overflow down-arrow.
 * Does not add messages to any thread; no built-in “context” copy.
 */
type Tone = "card" | "secondary";

export function ActiveAssistantScrollResponse({
  userStrip,
  children,
  className,
  tone = "card",
}: {
  userStrip: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Match surrounding assistant surface (Marketplace uses secondary). */
  tone?: Tone;
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
        "flex max-h-[min(72dvh,40rem)] min-h-0 flex-col overflow-hidden rounded-xl border border-border shadow-sm sm:max-h-[min(70vh,36rem)]",
        tone === "secondary" ? "bg-secondary text-foreground" : "bg-card text-foreground",
        className,
      )}
    >
      <div
        className={cn(
          "sticky top-0 z-10 shrink-0 border-b border-border px-4 py-2.5 backdrop-blur-md",
          tone === "secondary" ? "bg-secondary/95" : "bg-card/95",
        )}
      >
        {userStrip}
      </div>
      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          className="h-full min-h-[6rem] overflow-y-auto overscroll-y-contain scroll-smooth px-4 py-3"
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
