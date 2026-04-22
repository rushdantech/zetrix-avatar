import { useEffect, useState } from "react";
import type { RefObject } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BOTTOM_EDGE_PX = 20;

type ChatScrollDownCueProps = {
  viewportRef: RefObject<HTMLDivElement | null>;
  /** When this changes, overflow is re-measured (e.g. message count or thread id). */
  contentVersion: string | number;
  className?: string;
};

/**
 * Shown when the chat viewport has overflow and the user is not at the bottom.
 * Hidden once scrolled to the end of the thread.
 */
export function ChatScrollDownCue({ viewportRef, contentVersion, className }: ChatScrollDownCueProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) {
      setShow(false);
      return;
    }

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const hasOverflow = scrollHeight > clientHeight + 2;
      const notAtBottom = scrollTop + clientHeight < scrollHeight - BOTTOM_EDGE_PX;
      setShow(hasOverflow && notAtBottom);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(() => queueMicrotask(update));
    ro.observe(el);
    const inner = el.firstElementChild;
    if (inner instanceof HTMLElement) ro.observe(inner);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, [viewportRef, contentVersion]);

  const scrollDown = () => {
    const el = viewportRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const remaining = scrollHeight - scrollTop - clientHeight;
    if (remaining <= 1) return;
    const chunk = Math.max(Math.min(clientHeight * 0.72, remaining), Math.min(160, remaining));
    el.scrollBy({ top: remaining <= BOTTOM_EDGE_PX + 8 ? remaining : chunk, behavior: "smooth" });
  };

  if (!show) return null;

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label="Scroll down for more"
      onClick={scrollDown}
      className={cn(
        "pointer-events-auto absolute bottom-3 left-1/2 z-20 h-10 w-10 -translate-x-1/2 rounded-full border border-border bg-card/95 text-foreground shadow-md backdrop-blur-sm",
        "hover:bg-muted/90",
        className,
      )}
    >
      <ChevronDown className="h-5 w-5" aria-hidden />
    </Button>
  );
}
