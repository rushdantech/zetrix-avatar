import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { digitsForWhatsAppLink, displayPhoneLabel, whatsAppWebUrl } from "@/lib/studio/whatsapp-contact";

type Size = "md" | "sm";

/**
 * Renders a prominent WhatsApp CTA when `raw` contains a number that normalizes to valid digits. Otherwise renders null.
 */
export function AvatarWhatsAppContact({
  raw,
  className,
  size = "md",
  label = "Message on WhatsApp",
}: {
  /** Raw value from admin (E.164, local, with spaces) */
  raw: string | undefined;
  className?: string;
  size?: Size;
  /** Shown as secondary line under the number */
  label?: string;
}) {
  if (!raw?.trim()) return null;
  const digits = digitsForWhatsAppLink(raw);
  if (!digits) return null;
  const display = displayPhoneLabel(raw, digits);
  const href = whatsAppWebUrl(digits);
  const isSm = size === "sm";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex w-full min-w-0 max-w-sm items-center gap-3 rounded-xl border border-emerald-200/90 bg-emerald-50/90 px-4 py-3 text-left shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50",
        isSm && "px-3 py-2.5",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-white",
          isSm && "h-9 w-9",
        )}
        aria-hidden
      >
        <MessageCircle className={cn("h-5 w-5", isSm && "h-4 w-4")} />
      </span>
      <span className="min-w-0">
        <span className={cn("block font-mono text-sm font-semibold tabular-nums text-emerald-950", isSm && "text-xs")}>
          {display}
        </span>
        <span
          className={cn(
            "mt-0.5 block text-xs font-medium text-emerald-800/90 group-hover:underline",
            isSm && "text-[10px]",
          )}
        >
          {label}
        </span>
      </span>
    </a>
  );
}
