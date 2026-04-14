import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { AvatarProfileData } from "@/lib/marketplace/avatar-profile";
import { VerifiedInlineBadge } from "@/components/marketplace/VerifiedRibbon";
import { UnverifiedInlineBadge } from "@/components/marketplace/UnverifiedRibbon";
import { cn } from "@/lib/utils";

const POPUP_MAX_W = 320;
const POPUP_FEATURED_MAX_W = 560;
const VIEWPORT_PAD = 12;
const ANCHOR_GAP = 10;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: AvatarProfileData | null;
  /** Used for desktop anchoring; ignored for Featured variant and on small screens. */
  anchorRect: DOMRect | null;
  /** Featured Browse: large centered dialog (~⅓ viewport min-height) with cover image. */
  variant?: "default" | "featured";
};

function getFocusable(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
}

export function AvatarProfilePopup({
  open,
  onOpenChange,
  data,
  anchorRect,
  variant = "default",
}: Props) {
  const isMobile = useIsMobile();
  const isFeatured = variant === "featured";
  const titleId = useId();
  const descId = useId();
  const nameLabelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const [desktopPos, setDesktopPos] = useState<{ top: number; left: number } | null>(null);

  const close = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const repositionDesktop = useCallback(() => {
    if (!open || isMobile || isFeatured || !anchorRect || !panelRef.current) return;
    const el = panelRef.current;
    const w = Math.min(el.offsetWidth, POPUP_MAX_W);
    const h = el.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = anchorRect.left + anchorRect.width / 2 - w / 2;
    let top = anchorRect.bottom + ANCHOR_GAP;

    if (top + h > vh - VIEWPORT_PAD) {
      top = anchorRect.top - h - ANCHOR_GAP;
    }
    if (top < VIEWPORT_PAD) {
      top = VIEWPORT_PAD;
    }
    left = Math.min(Math.max(left, VIEWPORT_PAD), vw - w - VIEWPORT_PAD);

    setDesktopPos({ top, left });
  }, [open, isMobile, isFeatured, anchorRect]);

  useLayoutEffect(() => {
    if (!open || isMobile || isFeatured) {
      setDesktopPos(null);
      return;
    }
    repositionDesktop();
  }, [open, isMobile, isFeatured, anchorRect, data, repositionDesktop]);

  useEffect(() => {
    if (!open || isMobile || isFeatured) return;
    const ro = new ResizeObserver(() => repositionDesktop());
    if (panelRef.current) ro.observe(panelRef.current);
    const onWin = () => repositionDesktop();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [open, isMobile, isFeatured, repositionDesktop]);

  useEffect(() => {
    if (!open) return;

    const onDocPointer = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node | null;
      if (panelRef.current && t && !panelRef.current.contains(t)) {
        close();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };

    document.addEventListener("mousedown", onDocPointer);
    document.addEventListener("touchstart", onDocPointer, { passive: true });
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDocPointer);
      document.removeEventListener("touchstart", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open || !data) return;

    prevFocus.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusables = getFocusable(panel);
    const first = focusables[0];
    requestAnimationFrame(() => first?.focus());

    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !panel) return;
      const nodes = getFocusable(panel);
      if (nodes.length === 0) return;
      const firstN = nodes[0];
      const lastN = nodes[nodes.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === firstN) {
          e.preventDefault();
          lastN?.focus();
        }
      } else if (document.activeElement === lastN) {
        e.preventDefault();
        firstN?.focus();
      }
    };

    document.addEventListener("keydown", onTab);
    return () => {
      document.removeEventListener("keydown", onTab);
      prevFocus.current?.focus?.();
    };
  }, [open, data]);

  if (!open || !data) return null;

  const hasDescription = Boolean(data.description?.trim());
  const hasPublisher = Boolean(data.publisher?.trim());
  const hasCategory = Boolean(data.category?.trim());
  const coverSrc = data.coverPlaceholderSrc?.trim();

  const sectionLabelClass = "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground";

  const profileSections = (
    <div className="divide-y divide-border/70">
      <section className="space-y-2 px-3.5 py-3.5" aria-labelledby={nameLabelId}>
        <h3 id={nameLabelId} className={sectionLabelClass}>
          Name
        </h3>
        <p id={titleId} className="text-lg font-semibold leading-snug tracking-tight text-foreground">
          {data.name}
        </p>
      </section>

      {hasDescription ? (
        <section className="space-y-2 px-3.5 py-3.5">
          <h3 className={sectionLabelClass}>Description</h3>
          <p id={descId} className="text-[13px] leading-relaxed text-muted-foreground line-clamp-4">
            {data.description}
          </p>
        </section>
      ) : null}

      <section className="space-y-2 px-3.5 py-3.5">
        <h3 className={sectionLabelClass}>Verification status</h3>
        <div>{data.verified ? <VerifiedInlineBadge /> : <UnverifiedInlineBadge />}</div>
      </section>

      {hasPublisher ? (
        <section className="space-y-2 px-3.5 py-3.5">
          <h3 className={sectionLabelClass}>Publisher</h3>
          <p className="text-[13px] leading-snug text-foreground/90">{data.publisher}</p>
        </section>
      ) : null}

      {hasCategory ? (
        <section className="space-y-2 px-3.5 py-3.5">
          <h3 className={sectionLabelClass}>Category</h3>
          <div>
            <span className="inline-flex rounded-full border border-border/90 bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium text-foreground/90">
              {data.category}
            </span>
          </div>
        </section>
      ) : null}
    </div>
  );

  const closeToolbar = (
    <div className="flex shrink-0 items-center justify-end border-b border-border/80 bg-secondary/20 px-2 py-2">
      <button
        type="button"
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Close profile"
        onClick={close}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );

  const body = isFeatured ? (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={hasDescription ? descId : undefined}
      className={cn(
        "fixed left-1/2 top-1/2 z-[100] flex max-h-[min(92vh,calc(100vh-1.5rem))] w-[min(92vw,560px)] min-h-[33vh] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-xl outline-none",
        "duration-200 animate-in fade-in-0 zoom-in-95",
      )}
      style={{ maxWidth: POPUP_FEATURED_MAX_W }}
    >
      <div className="relative w-full shrink-0 overflow-hidden border-b border-border/40 bg-muted/20">
        <div className="relative aspect-square w-full bg-muted/40">
          {coverSrc ? (
            <img
              src={coverSrc}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
              decoding="async"
            />
          ) : (
            <div
              className="absolute inset-0 h-full w-full bg-gradient-to-br from-primary/30 via-secondary/40 to-info/25"
              aria-hidden
            />
          )}
        </div>
      </div>
      {closeToolbar}
      <div className="min-h-0 flex-1 overflow-y-auto">{profileSections}</div>
    </div>
  ) : (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={hasDescription ? descId : undefined}
      className={cn(
        "z-[100] flex max-h-[min(420px,calc(100vh-2rem))] w-[min(100vw-2rem,320px)] flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-lg outline-none",
        "duration-200 animate-in fade-in-0 zoom-in-95",
        isMobile ? "slide-in-from-bottom-4" : "origin-top",
        isMobile
          ? "fixed inset-x-0 bottom-0 mx-auto max-h-[min(85vh,560px)] w-full max-w-lg rounded-b-none rounded-t-2xl pb-[env(safe-area-inset-bottom,0px)] sm:max-h-[min(480px,85vh)]"
          : "fixed max-w-[320px]",
        !isMobile && !desktopPos && "pointer-events-none opacity-0",
      )}
      style={
        !isMobile && desktopPos
          ? { top: desktopPos.top, left: desktopPos.left, maxWidth: POPUP_MAX_W }
          : undefined
      }
    >
      {closeToolbar}
      <div className="min-h-0 flex-1 overflow-y-auto text-sm">{profileSections}</div>
    </div>
  );

  const underlay = (
    <>
      {isMobile || isFeatured ? (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          className="fixed inset-0 z-[90] animate-in fade-in-0 duration-200 bg-background/70 backdrop-blur-[1px]"
          onClick={close}
        />
      ) : null}
      {body}
    </>
  );

  return createPortal(underlay, document.body);
}
