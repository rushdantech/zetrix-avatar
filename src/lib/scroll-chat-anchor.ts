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
