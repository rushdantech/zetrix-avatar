/**
 * Radix ScrollArea mounts the scrollable viewport inside the root node with this attribute.
 */
export function getRadixScrollViewport(scrollAreaRoot: HTMLElement | null): HTMLElement | null {
  if (!scrollAreaRoot) return null;
  return scrollAreaRoot.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
}

/**
 * Scroll a Radix (or any) chat viewport so `anchorEl` sits near the top,
 * leaving roughly `peekPx` of vertical space above it (previous message tail).
 */
export function scrollViewportAnchorNearTop(
  viewport: HTMLElement,
  anchorEl: HTMLElement,
  peekPx = 88,
  behavior: ScrollBehavior = "smooth",
) {
  const vpRect = viewport.getBoundingClientRect();
  const elRect = anchorEl.getBoundingClientRect();
  const delta = elRect.top - vpRect.top - peekPx;
  const next = Math.max(0, viewport.scrollTop + delta);
  viewport.scrollTo({ top: next, behavior });
}

/**
 * Radix may enable scrolling after layout/effects; retry so scrollTop updates reliably.
 */
export function scheduleScrollViewportAnchorNearTop(
  getScrollAreaRoot: () => HTMLElement | null,
  getUserAnchorSelector: (userId: string) => string,
  userMessageId: string,
  peekPx = 88,
) {
  const run = () => {
    const root = getScrollAreaRoot();
    const vp = getRadixScrollViewport(root);
    const el = root?.querySelector(getUserAnchorSelector(userMessageId)) as HTMLElement | null;
    if (vp && el) scrollViewportAnchorNearTop(vp, el, peekPx, "smooth");
  };
  queueMicrotask(run);
  requestAnimationFrame(() => requestAnimationFrame(run));
  window.setTimeout(run, 80);
  window.setTimeout(run, 220);
}
