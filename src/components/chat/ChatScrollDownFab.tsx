import { useCallback, useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Show when there is more content below than this (ChatGPT-style). */
const FROM_BOTTOM_SHOW_PX = 72;

type ChatScrollDownFabProps = {
  scrollRef: RefObject<HTMLDivElement | null>;
  /** Bumps listeners when thread content changes (messages, typing, session). */
  contentKey: string | number;
  className?: string;
};

/**
 * Floating down-chevron when the scroll viewport has overflow and the user is
 * not at the bottom. Hides at end of thread. Sits above the composer (parent
 * should be `relative` around the scroll viewport only).
 */
export function ChatScrollDownFab({ scrollRef, contentKey, className }: ChatScrollDownFabProps) {
  const [visible, setVisible] = useState(false);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      setVisible(false);
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = el;
    const distFromBottom = scrollHeight - scrollTop - clientHeight;
    const hasOverflow = scrollHeight > clientHeight + 2;
    setVisible(hasOverflow && distFromBottom > FROM_BOTTOM_SHOW_PX);
  }, [scrollRef]);

  useLayoutEffect(() => {
    measure();
  }, [measure, contentKey]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const inner = el.firstElementChild;
    if (inner instanceof Element) ro.observe(inner);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [scrollRef, measure, contentKey]);

  const onClick = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const dist = scrollHeight - scrollTop - clientHeight;
    const step = Math.min(Math.ceil(clientHeight * 0.85), Math.max(1, dist));
    el.scrollBy({ top: step, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      className={cn(
        "absolute bottom-3 left-1/2 z-20 flex h-9 w-9 -translate-x-1/2 items-center justify-center",
        "rounded-full border border-border/90 bg-background/95 text-muted-foreground shadow-md backdrop-blur-sm",
        "ring-1 ring-black/5 dark:ring-white/10",
        "hover:bg-secondary hover:text-foreground",
        "transition-[opacity,transform,box-shadow] duration-200",
        className,
      )}
      onClick={onClick}
      aria-label="Scroll down for more"
    >
      <ChevronDown className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
    </button>
  );
}
