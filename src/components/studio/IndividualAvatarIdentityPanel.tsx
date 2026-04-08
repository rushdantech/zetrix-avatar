import { CredentialViewer } from "@/components/identity/CredentialViewer";
import type { StudioEntityIndividual } from "@/types/studio";
import { ShieldCheck } from "lucide-react";

export function IndividualAvatarIdentityPanel({ entity }: { entity: StudioEntityIndividual }) {
  const s = entity.individualSetup;
  const hasVc = s.mydigitalEkycVerified && s.zetrixDid && s.mykadVc;

  if (!hasVc) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm shadow-card">
        <h3 className="mb-1 text-lg font-bold">Identity (MyDigital ID)</h3>
        <p className="text-muted-foreground">
          You did not complete MyDigital ID verification when this avatar was created. No Zetrix DID or MyKad VC is stored for this
          listing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-sm shadow-card">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <h3 className="text-lg font-bold">Identity (MyDigital ID)</h3>
          <p className="mt-1 text-muted-foreground">
            In production, the MyKad verifiable credential proves to whom this avatar belongs. Below is the mock VC issued after
            eKYC in this demo.
          </p>
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs font-medium text-muted-foreground">Zetrix DID</p>
        <code className="block break-all rounded-lg bg-secondary px-3 py-2 text-xs">{s.zetrixDid}</code>
      </div>
      <div>
        <p className="mb-1 text-xs font-medium text-muted-foreground">MyKad VC (mock)</p>
        <CredentialViewer data={s.mykadVc} />
      </div>
    </div>
  );
}
