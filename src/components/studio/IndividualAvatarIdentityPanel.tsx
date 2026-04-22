import { CredentialViewer } from "@/components/identity/CredentialViewer";
import { MockEkycFlow } from "@/components/studio/MockEkycFlow";
import {
  clearMockEkycFromIndividualEntity,
  deriveMockEkycSnapshotFromSetup,
  mergeMockEkycSnapshotIntoIndividualEntity,
} from "@/lib/studio/mock-ekyc-merge";
import type { StudioEntityIndividual } from "@/types/studio";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function IndividualAvatarIdentityPanel({
  entity,
  onEkycPersist,
}: {
  entity: StudioEntityIndividual;
  onEkycPersist?: (next: StudioEntityIndividual) => void;
}) {
  const s = entity.individualSetup;
  const persisted = deriveMockEkycSnapshotFromSetup(s);
  const hasVc = Boolean(s.mydigitalEkycVerified && s.zetrixDid && s.mykadVc);

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6 text-sm shadow-card">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <h3 className="text-lg font-bold">eKYC</h3>
          <p className="mt-1 text-muted-foreground">
            Perform eKYC to verify and provide an identity to your avatar. Mock providers only — no real verification.
          </p>
        </div>
      </div>

      {onEkycPersist ? (
        <MockEkycFlow
          mode="profile"
          persistedSnapshot={persisted}
          onPersistSnapshot={(snap) => {
            onEkycPersist(mergeMockEkycSnapshotIntoIndividualEntity(entity, snap));
            toast.success(
              snap.provider === "mydigital"
                ? "Identity verified via MyDigital ID (demo)."
                : "Identity verified via Onfido (demo).",
            );
          }}
          onClearSnapshot={() => {
            onEkycPersist(clearMockEkycFromIndividualEntity(entity));
            toast.message("eKYC cleared — you can verify again when you are ready.");
          }}
        />
      ) : (
        <p className="text-xs text-muted-foreground">Saving identity from this screen is unavailable.</p>
      )}

      {hasVc ? (
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">MyKad VC (mock)</p>
          <CredentialViewer data={s.mykadVc} />
        </div>
      ) : null}
    </div>
  );
}
