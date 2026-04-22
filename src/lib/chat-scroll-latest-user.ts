export type UserRowDataAttr = "data-zc-user-row" | "data-mp-user-row";

const PEEK_PX = 88;
const SETTLE_MAX_FRAMES = 28;
const SETTLE_TOLERANCE_PX = 8;

/**
 * Positions the user row near the top of the scroll viewport, leaving ~`PEEK_PX`
 * of prior content visible. Pass the actual `overflow-y-auto` element (ref).
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

/**
 * Re-apply scroll until the user row sits near `PEEK_PX` or layout settles.
 * Pass `AbortSignal` from the owning `useLayoutEffect` cleanup so a follow-up
 * message (e.g. assistant reply) does not keep fighting scroll position.
 */
export function settleScrollLatestUserRowInViewport(
  getViewport: () => HTMLElement | null,
  dataAttr: UserRowDataAttr,
  userMessageId: string,
  signal?: AbortSignal,
) {
  let frames = 0;
  const tick = () => {
    if (signal?.aborted) return;
    const vp = getViewport();
    if (!vp) {
      if (frames++ < SETTLE_MAX_FRAMES) requestAnimationFrame(tick);
      return;
    }
    scrollLatestUserRowInViewport(vp, dataAttr, userMessageId, "auto");

    const sel = `[${dataAttr}="${CSS.escape(userMessageId)}"]`;
    const el = vp.querySelector(sel) as HTMLElement | null;
    frames++;
    if (!el || frames >= SETTLE_MAX_FRAMES) return;

    const vpRect = vp.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const topGap = elRect.top - vpRect.top;
    const canScroll = vp.scrollHeight > vp.clientHeight + 1;
    const aligned = Math.abs(topGap - PEEK_PX) <= SETTLE_TOLERANCE_PX;
    if (canScroll && !aligned) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
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
