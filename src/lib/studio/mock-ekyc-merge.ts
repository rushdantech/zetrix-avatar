import type {
  IndividualAvatarSetupMock,
  MockEkycVerificationSnapshot,
  StudioEntityIndividual,
} from "@/types/studio";
import { buildMockMykadVcForAvatar, zetrixDidForAvatar } from "@/lib/studio/mock-avatar-mykad-vc";

/** Identity shown in the mock MyDigital ID approve step and stored on the VC when that path completes. */
export const MYDIGITAL_WIZARD_SUBJECT = {
  fullName: "Ahmad bin Ismail",
  icNumber: "900101-10-1234",
  dateOfBirth: "1990-01-01",
} as const;

export const ONFIDO_WIZARD_RESULT = {
  displayName: "Jordan Lee",
  maskedId: "A***65432",
} as const;

export function maskMalaysianIc(ic: string): string {
  const t = ic.trim();
  const parts = t.split("-");
  if (parts.length >= 3) return `${parts[0]}-**-****`;
  if (t.length >= 6) return `${t.slice(0, 6)}-**-****`;
  return "****";
}

function snapshotFromMykadVc(mykadVc: Record<string, unknown>, verifiedAt: string): MockEkycVerificationSnapshot {
  const cs = mykadVc.credentialSubject as Record<string, unknown> | undefined;
  const fullName = typeof cs?.fullName === "string" ? cs.fullName : "Verified holder";
  const ic = typeof cs?.icNumber === "string" ? cs.icNumber : "";
  return {
    provider: "mydigital",
    displayName: fullName,
    maskedId: maskMalaysianIc(ic || "--------"),
    verifiedAt,
  };
}

/** Derive a display snapshot from stored setup (new field or legacy MyDigital VC). */
export function deriveMockEkycSnapshotFromSetup(setup: IndividualAvatarSetupMock): MockEkycVerificationSnapshot | null {
  if (setup.mockEkycVerification) return setup.mockEkycVerification;
  if (setup.mydigitalEkycVerified && setup.zetrixDid && setup.mykadVc) {
    const vc = setup.mykadVc as Record<string, unknown>;
    const cs = vc.credentialSubject as Record<string, unknown> | undefined;
    const vs = cs?.verificationStatus as Record<string, unknown> | undefined;
    const verifiedAt =
      typeof vs?.verifiedAt === "string" ? vs.verifiedAt : new Date().toISOString();
    return snapshotFromMykadVc(vc, verifiedAt);
  }
  return null;
}

export function buildMydigitalWizardSnapshot(verifiedAt: string): MockEkycVerificationSnapshot {
  return {
    provider: "mydigital",
    displayName: MYDIGITAL_WIZARD_SUBJECT.fullName,
    maskedId: maskMalaysianIc(MYDIGITAL_WIZARD_SUBJECT.icNumber),
    verifiedAt,
  };
}

export function buildOnfidoWizardSnapshot(verifiedAt: string): MockEkycVerificationSnapshot {
  return {
    provider: "onfido",
    displayName: ONFIDO_WIZARD_RESULT.displayName,
    maskedId: ONFIDO_WIZARD_RESULT.maskedId,
    verifiedAt,
  };
}

export function mergeMockEkycSnapshotIntoIndividualEntity(
  entity: StudioEntityIndividual,
  snapshot: MockEkycVerificationSnapshot,
): StudioEntityIndividual {
  if (snapshot.provider === "mydigital") {
    const zetrixDid = zetrixDidForAvatar(entity.id);
    const mykadVc = buildMockMykadVcForAvatar({
      avatarId: entity.id,
      avatarName: entity.name,
      zetrixDid,
      subjectOverride: {
        fullName: MYDIGITAL_WIZARD_SUBJECT.fullName,
        icNumber: MYDIGITAL_WIZARD_SUBJECT.icNumber,
        dateOfBirth: MYDIGITAL_WIZARD_SUBJECT.dateOfBirth,
      },
    });
    return {
      ...entity,
      zid_credentialed: true,
      zid_status: "active",
      individualSetup: {
        ...entity.individualSetup,
        mockEkycVerification: snapshot,
        mydigitalEkycVerified: true,
        zetrixDid,
        mykadVc,
      },
    };
  }
  return {
    ...entity,
    zid_credentialed: false,
    zid_status: undefined,
    individualSetup: {
      ...entity.individualSetup,
      mockEkycVerification: snapshot,
      mydigitalEkycVerified: false,
      zetrixDid: undefined,
      mykadVc: undefined,
    },
  };
}

export function clearMockEkycFromIndividualEntity(entity: StudioEntityIndividual): StudioEntityIndividual {
  return {
    ...entity,
    zid_credentialed: false,
    zid_status: undefined,
    individualSetup: {
      ...entity.individualSetup,
      mockEkycVerification: undefined,
      mydigitalEkycVerified: undefined,
      zetrixDid: undefined,
      mykadVc: undefined,
    },
  };
}

/** Attach mock MyDigital eKYC + VC to a catalog or user avatar (demo). */
export function applyMockEkycToIndividualEntity(entity: StudioEntityIndividual): StudioEntityIndividual {
  const zetrixDid = zetrixDidForAvatar(entity.id);
  const mykadVc = buildMockMykadVcForAvatar({
    avatarId: entity.id,
    avatarName: entity.name,
    zetrixDid,
  });
  const vs = (mykadVc.credentialSubject as Record<string, unknown> | undefined)?.verificationStatus as
    | Record<string, unknown>
    | undefined;
  const verifiedAt = typeof vs?.verifiedAt === "string" ? vs.verifiedAt : new Date().toISOString();
  const mockEkycVerification = snapshotFromMykadVc(mykadVc, verifiedAt);
  return {
    ...entity,
    zid_credentialed: true,
    zid_status: "active",
    individualSetup: {
      ...entity.individualSetup,
      mydigitalEkycVerified: true,
      zetrixDid,
      mykadVc,
      mockEkycVerification,
    },
  };
}
