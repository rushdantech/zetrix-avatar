import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function BootstrapTokenModal({
  open,
  token,
  copied,
  onCopiedChange,
  onClose,
}: {
  open: boolean;
  token: string;
  copied: boolean;
  onCopiedChange: (v: boolean) => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Bootstrap token generated</DialogTitle>
          <DialogDescription>
            This token will only be shown once. Copy it now and configure it in your agent environment.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
          One-time display. You will not be able to retrieve this exact token again.
        </div>
        <div className="rounded-lg border border-border bg-secondary p-3">
          <code className="block break-all text-sm">{token}</code>
          <button
            className="mt-2 inline-flex items-center gap-1 rounded-md bg-card px-2 py-1 text-xs"
            onClick={async () => {
              await navigator.clipboard.writeText(token);
              toast.info("Copied!");
            }}
          >
            <Copy className="h-3 w-3" /> Copy token
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={copied} onChange={(e) => onCopiedChange(e.target.checked)} />
          I've copied the token
        </label>
        <button
          disabled={!copied}
          onClick={onClose}
          className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Done
        </button>
      </DialogContent>
    </Dialog>
  );
}
