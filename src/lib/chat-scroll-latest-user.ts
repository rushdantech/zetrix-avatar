export type UserRowDataAttr = "data-zc-user-row" | "data-mp-user-row";

const PEEK_PX = 88;
const SETTLE_MAX_FRAMES = 28;
const SETTLE_TOLERANCE_PX = 8;
/** Looser threshold so ResizeObserver does not fight typing-indicator layout tweaks. */
const RO_ALIGN_TOLERANCE_PX = 14;

function queryUserRow(viewport: HTMLElement, dataAttr: UserRowDataAttr, userMessageId: string) {
  const sel = `[${dataAttr}="${CSS.escape(userMessageId)}"]`;
  return viewport.querySelector(sel) as HTMLElement | null;
}

/** True when the user row is already near the intended top peek band. */
export function userRowNearPeekInViewport(
  viewport: HTMLElement | null,
  dataAttr: UserRowDataAttr,
  userMessageId: string,
  tolerancePx = SETTLE_TOLERANCE_PX,
): boolean {
  if (!viewport) return false;
  const el = queryUserRow(viewport, dataAttr, userMessageId);
  if (!el) return false;
  const vpRect = viewport.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const topGap = elRect.top - vpRect.top;
  return Math.abs(topGap - PEEK_PX) <= tolerancePx;
}

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
  const el = queryUserRow(viewport, dataAttr, userMessageId);
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

    const el = queryUserRow(vp, dataAttr, userMessageId);
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

/**
 * Deferred scroll attempts; pass the same `AbortSignal` as settle/cleanup so
 * timeouts do not run after the thread moves on (e.g. assistant reply at 400ms).
 */
export function scheduleScrollLatestUserRowInViewport(
  getViewport: () => HTMLElement | null,
  dataAttr: UserRowDataAttr,
  userMessageId: string,
  signal?: AbortSignal,
) {
  const runAuto = () => {
    if (signal?.aborted) return;
    scrollLatestUserRowInViewport(getViewport(), dataAttr, userMessageId, "auto");
  };

  queueMicrotask(runAuto);
  requestAnimationFrame(() => {
    if (signal?.aborted) return;
    requestAnimationFrame(runAuto);
  });
  const ids = [
    window.setTimeout(runAuto, 0),
    window.setTimeout(runAuto, 50),
    window.setTimeout(runAuto, 120),
    window.setTimeout(runAuto, 220),
    window.setTimeout(runAuto, 420),
    window.setTimeout(runAuto, 600),
  ];
  const cancel = () => ids.forEach(id => window.clearTimeout(id));
  signal?.addEventListener("abort", cancel, { once: true });
}
