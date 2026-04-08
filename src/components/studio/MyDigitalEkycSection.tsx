import { QrCode, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MYDIGITAL_ID_DEEP_LINK =
  "mydigitalid://ekyc/verify?session=demo-zetrix-avatar&source=zetrix";

export function MyDigitalEkycSection({
  completed,
  onCompletedChange,
}: {
  completed: boolean;
  onCompletedChange: (value: boolean) => void;
}) {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1 text-xl font-bold">MyDigital ID (eKYC)</h3>
        <p className="text-sm text-muted-foreground">
          Optional: verify with MyDigital ID before consent. If you complete verification, a mock Zetrix DID and MyKad VC are
          stored on your avatar after creation (view them on the avatar profile).
        </p>
      </div>

      {isMobile ? (
        <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Smartphone className="h-4 w-4 text-primary" />
            Mobile — open wallet
          </div>
          <p className="text-xs text-muted-foreground">
            Tap the button to deep link into the MyDigital ID wallet app (demo URL; installs may vary).
          </p>
          <Button asChild className="w-full sm:w-auto">
            <a href={MYDIGITAL_ID_DEEP_LINK}>Open MyDigital ID wallet</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <QrCode className="h-4 w-4 text-primary" />
            Desktop — scan QR
          </div>
          <p className="text-xs text-muted-foreground">
            Scan this code with the MyDigital ID wallet app on your phone to connect this session (mock placeholder).
          </p>
          <div
            className={cn(
              "mx-auto flex h-48 w-48 items-center justify-center rounded-xl border-2 border-dashed border-border bg-card",
            )}
          >
            <QrCode className="h-28 w-28 text-foreground/70" strokeWidth={1} />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant={completed ? "secondary" : "default"}
          onClick={() => {
            onCompletedChange(true);
            toast.success("MyDigital ID verification marked complete (demo).");
          }}
          disabled={completed}
        >
          {completed ? "Verification complete (demo)" : "I’ve completed verification in the wallet (demo)"}
        </Button>
        {completed && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onCompletedChange(false)} className="text-muted-foreground">
            Undo (demo)
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        You can skip this step and continue — no DID or VC will be issued for this avatar.
      </p>
    </div>
  );
}
