import { Copy } from "lucide-react";
import { toast } from "sonner";
import { truncateDid } from "@/lib/identity/format";

export function DIDDisplay({ did, full = false }: { did: string; full?: boolean }) {
  const text = full ? did : truncateDid(did);
  return (
    <div className="flex items-center gap-2">
      <code className="rounded bg-secondary px-2 py-1 text-xs">{text}</code>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(did);
          toast.info("Copied!");
        }}
        className="rounded p-1 hover:bg-secondary"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
