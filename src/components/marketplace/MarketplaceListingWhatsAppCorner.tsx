import { MessageCircle } from "lucide-react";
import { marketplaceWhatsAppRawForListingId } from "@/lib/marketplace/marketplace-whatsapp-mocks";
import { cn } from "@/lib/utils";
import { digitsForWhatsAppLink, displayPhoneLabel, whatsAppWebUrl } from "@/lib/studio/whatsapp-contact";

type Props = {
  avatarId: string;
  className?: string;
};

export function MarketplaceListingWhatsAppCorner({ avatarId, className }: Props) {
  const raw = marketplaceWhatsAppRawForListingId(avatarId);
  if (!raw?.trim()) return null;
  const digits = digitsForWhatsAppLink(raw);
  if (!digits) return null;
  const href = whatsAppWebUrl(digits);
  const display = displayPhoneLabel(raw, digits);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "flex max-w-[9.5rem] flex-col items-end gap-0 rounded-lg border border-emerald-200/90 bg-emerald-50/95 px-2 py-1 text-right shadow-sm transition-colors hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/55",
        className,
      )}
    >
      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-800 dark:text-emerald-200">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#25D366] text-white" aria-hidden>
          <MessageCircle className="h-3 w-3" />
        </span>
        <span className="font-mono tabular-nums leading-none text-emerald-950 dark:text-emerald-50">{display}</span>
      </span>
      <span className="pr-0.5 text-[9px] font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-300">
        WhatsApp
      </span>
    </a>
  );
}
