/**
 * Radix ScrollArea mounts the scrollable viewport inside the root node with this attribute.
 */
export function getRadixScrollViewport(scrollAreaRoot: HTMLElement | null): HTMLElement | null {
  if (!scrollAreaRoot) return null;
  return scrollAreaRoot.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
}

/**
 * Scroll the latest user row into view inside the main thread (`scroll-margin` on the row
 * leaves a band of the previous message visible). Retries help Radix layout.
 */
export function scheduleScrollUserRowIntoView(
  getScrollAreaRoot: () => HTMLElement | null,
  getUserAnchorSelector: (userId: string) => string,
  userMessageId: string,
) {
  const run = () => {
    const root = getScrollAreaRoot();
    const el = root?.querySelector(getUserAnchorSelector(userMessageId)) as HTMLElement | null;
    el?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  };
  queueMicrotask(run);
  requestAnimationFrame(() => requestAnimationFrame(run));
  window.setTimeout(run, 80);
  window.setTimeout(run, 260);
}
