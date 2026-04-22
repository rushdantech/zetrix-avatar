import { useCallback, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getRadixScrollViewport } from "@/lib/scroll-chat-anchor";

/**
 * Overlay on the chat column: when the Radix scroll viewport has content below the fold,
 * shows a down control that scrolls the **main** thread (same viewport as messages).
 */
export function ChatViewportMoreBelow({
  scrollAreaRootId,
  watchKey,
}: {
  scrollAreaRootId: string;
  /** Bumps when messages / session change so overflow is re-checked. */
  watchKey: string | number;
}) {
  const [show, setShow] = useState(false);

  const refresh = useCallback(() => {
    const root = document.getElementById(scrollAreaRootId);
    const vp = getRadixScrollViewport(root);
    if (!vp) {
      setShow(false);
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = vp;
    const overflow = scrollHeight > clientHeight + 2;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 56;
    setShow(overflow && !nearBottom);
  }, [scrollAreaRootId]);

  const scrollDown = useCallback(() => {
    const root = document.getElementById(scrollAreaRootId);
    const vp = getRadixScrollViewport(root);
    if (!vp) return;
    const room = vp.scrollHeight - vp.scrollTop - vp.clientHeight;
    const delta = Math.min(Math.max(vp.clientHeight * 0.88, 140), room);
    vp.scrollBy({ top: delta, behavior: "smooth" });
  }, [scrollAreaRootId]);

  useEffect(() => {
    refresh();
  }, [watchKey, refresh]);

  useEffect(() => {
    const root = document.getElementById(scrollAreaRootId);
    const vp = getRadixScrollViewport(root);
    if (!vp) return;
    const onScroll = () => refresh();
    vp.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      vp.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [scrollAreaRootId, refresh]);

  if (!show) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center">
      <button
        type="button"
        aria-label="Scroll chat down for more"
        onClick={scrollDown}
        className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-background/95 text-muted-foreground shadow-md backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-muted hover:text-foreground"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  );
}
