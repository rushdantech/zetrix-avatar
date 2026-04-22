/**
 * ScrollArea (Radix) nests the scrollable element under the root with this attribute.
 */
export function getRadixScrollViewport(scrollAreaRoot: HTMLElement | null): HTMLElement | null {
  if (!scrollAreaRoot) return null;
  return scrollAreaRoot.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
}

export type UserRowDataAttr = "data-zc-user-row" | "data-mp-user-row";

/**
 * Scrolls the thread so the given user row sits at the top of the viewport.
 * Put `scroll-margin-top` on that row so a band of earlier messages stays visible.
 */
export function scrollLatestUserRowToTop(
  scrollAreaRootId: string,
  dataAttr: UserRowDataAttr,
  userMessageId: string,
) {
  const root = document.getElementById(scrollAreaRootId);
  const el = root?.querySelector(`[${dataAttr}="${userMessageId}"]`) as HTMLElement | null;
  el?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
}

/** Radix layout can lag one frame; retry keeps the anchor scroll reliable. */
export function scheduleScrollLatestUserRowToTop(
  scrollAreaRootId: string,
  dataAttr: UserRowDataAttr,
  userMessageId: string,
) {
  const run = () => scrollLatestUserRowToTop(scrollAreaRootId, dataAttr, userMessageId);
  queueMicrotask(run);
  requestAnimationFrame(() => requestAnimationFrame(run));
  window.setTimeout(run, 80);
  window.setTimeout(run, 260);
}
