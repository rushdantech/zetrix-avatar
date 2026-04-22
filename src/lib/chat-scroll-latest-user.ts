export type UserRowDataAttr = "data-zc-user-row" | "data-mp-user-row";

const PEEK_PX = 88;

/**
 * Positions the user row near the top of the scroll viewport, leaving ~`PEEK_PX`
 * of prior content visible. Use a native `overflow-y-auto` container (ref) —
 * Radix ScrollArea keeps scroll on an inner viewport and nested flex layouts
 * often make programmatic scroll unreliable.
 */
export function scrollLatestUserRowInViewport(
  viewport: HTMLElement | null,
  dataAttr: UserRowDataAttr,
  userMessageId: string,
  behavior: ScrollBehavior = "auto",
) {
  if (!viewport) return;
  const sel = `[${dataAttr}="${CSS.escape(userMessageId)}"]`;
  const el = viewport.querySelector(sel) as HTMLElement | null;
  if (!el) return;

  const vpRect = viewport.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const yInContent = viewport.scrollTop + (elRect.top - vpRect.top);
  const maxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
  const target = Math.min(Math.max(0, yInContent - PEEK_PX), maxScroll);
  viewport.scrollTo({ top: target, behavior });
}

export function scheduleScrollLatestUserRowInViewport(
  getViewport: () => HTMLElement | null,
  dataAttr: UserRowDataAttr,
  userMessageId: string,
) {
  const runAuto = () =>
    scrollLatestUserRowInViewport(getViewport(), dataAttr, userMessageId, "auto");
  const runSmooth = () =>
    scrollLatestUserRowInViewport(getViewport(), dataAttr, userMessageId, "smooth");

  queueMicrotask(runAuto);
  requestAnimationFrame(() => requestAnimationFrame(runAuto));
  window.setTimeout(runAuto, 0);
  window.setTimeout(runAuto, 50);
  window.setTimeout(runAuto, 120);
  window.setTimeout(runSmooth, 220);
  window.setTimeout(runAuto, 420);
  window.setTimeout(runAuto, 600);
}
