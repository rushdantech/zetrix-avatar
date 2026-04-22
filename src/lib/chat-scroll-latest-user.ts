/**
 * Radix ScrollArea: the element with `[data-radix-scroll-area-viewport]` is the one
 * whose `scrollTop` must be updated (scrollIntoView often does not move it).
 */
export function getRadixScrollViewport(scrollAreaRoot: HTMLElement | null): HTMLElement | null {
  if (!scrollAreaRoot) return null;
  return scrollAreaRoot.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
}

export type UserRowDataAttr = "data-zc-user-row" | "data-mp-user-row";

const PEEK_PX = 88;

/**
 * Positions the user row near the top of the chat viewport, leaving ~`PEEK_PX`
 * of prior content visible (same thread scroll; no nested scrollers).
 */
export function scrollLatestUserRowToTop(
  scrollAreaRootId: string,
  dataAttr: UserRowDataAttr,
  userMessageId: string,
  behavior: ScrollBehavior = "auto",
) {
  const root = document.getElementById(scrollAreaRootId);
  const vp = getRadixScrollViewport(root);
  const el = root?.querySelector(`[${dataAttr}="${userMessageId}"]`) as HTMLElement | null;
  if (!vp || !el) return;

  const vpRect = vp.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const yInContent = vp.scrollTop + (elRect.top - vpRect.top);
  const target = Math.max(0, yInContent - PEEK_PX);
  vp.scrollTo({ top: target, behavior });
}

export function scheduleScrollLatestUserRowToTop(
  scrollAreaRootId: string,
  dataAttr: UserRowDataAttr,
  userMessageId: string,
) {
  const runAuto = () => scrollLatestUserRowToTop(scrollAreaRootId, dataAttr, userMessageId, "auto");
  const runSmooth = () => scrollLatestUserRowToTop(scrollAreaRootId, dataAttr, userMessageId, "smooth");

  queueMicrotask(runAuto);
  requestAnimationFrame(() => requestAnimationFrame(runAuto));
  window.setTimeout(runAuto, 0);
  window.setTimeout(runAuto, 50);
  window.setTimeout(runAuto, 120);
  window.setTimeout(runSmooth, 220);
  window.setTimeout(runAuto, 420);
}
