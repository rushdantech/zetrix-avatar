import type { StudioEntityIndividual } from "@/types/studio";

/** Deterministic 64-char lowercase hex from a seed (fictional ZID method id). */
function deriveHex64(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const parts: string[] = [];
  let state = (h >>> 0) ^ (seed.length * 0x811c9dc5);
  for (let i = 0; i < 8; i++) {
    state = Math.imul(state ^ (state >>> 13), 1274126177) >>> 0;
    parts.push(state.toString(16).padStart(8, "0"));
  }
  return parts.join("").slice(0, 64).padEnd(64, "0");
}

export function didZidFromSeed(seed: string): string {
  return `did:zid:${deriveHex64(seed)}`;
}

function mockUuid(seed: string): string {
  const h = deriveHex64(`${seed}:uuid`);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

function mockIcNumber(seed: string): string {
  const h = deriveHex64(`${seed}:ic`);
  const n = BigInt(`0x${h.slice(0, 14)}`);
  const day = Number(n % 28n) + 1;
  const month = Number((n / 28n) % 12n) + 1;
  const year = 1975 + Number((n / (28n * 12n)) % 30n);
  const yy = String(year).slice(2);
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const pb = String(10 + Number((n / (28n * 12n * 30n)) % 5n)).padStart(2, "0");
  const serial = String(Number((n / (28n * 12n * 30n * 5n)) % 10000n)).padStart(4, "0");
  return `${yy}${mm}${dd}-${pb}-${serial}`;
}

function isoDateOnly(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const HOLDER_PROFILES = [
  {
    fullName: "Ahmad Zulkifli bin Hassan",
    citizenship: "MYS",
    gender: "male",
    address: {
      line1: "No. 18, Jalan SS 21/39",
      line2: "Damansara Utama",
      city: "Petaling Jaya",
      state: "Selangor",
      postcode: "47400",
    },
  },
  {
    fullName: "Siti Nurhaliza binti Ramli",
    citizenship: "MYS",
    gender: "female",
    address: {
      line1: "Lot 7, Persiaran Gurney",
      line2: "Pulau Tikus",
      city: "George Town",
      state: "Pulau Pinang",
      postcode: "10250",
    },
  },
  {
    fullName: "Rajesh Kumar a/l Subramaniam",
    citizenship: "MYS",
    gender: "male",
    address: {
      line1: "42, Jalan Temenggor",
      line2: "Taman Canning",
      city: "Ipoh",
      state: "Perak",
      postcode: "31400",
    },
  },
  {
    fullName: "Lim Wei Jing",
    citizenship: "MYS",
    gender: "female",
    address: {
      line1: "B-12-05, Residensi Astaka",
      line2: "Jalan Bukit Bintang",
      city: "Kuala Lumpur",
      state: "Wilayah Persekutuan",
      postcode: "55100",
    },
  },
] as const;

function pickHolder(avatarId: string) {
  const idx =
    parseInt(deriveHex64(avatarId).slice(0, 8), 16) % HOLDER_PROFILES.length;
  return HOLDER_PROFILES[idx];
}

/**
 * Zetrix-style subject DID for the avatar operator (mock).
 * Stored on the entity as `zetrixDid` for historical field naming.
 */
export function zetrixDidForAvatar(avatarId: string): string {
  return didZidFromSeed(`subject:${avatarId}`);
}

/**
 * Mock MyKad-linked VC for an AI avatar binding (demo only).
 * Shape matches a plausible W3C VC with Malaysian identity subject.
 */
export function buildMockMykadVcForAvatar(params: {
  avatarId: string;
  avatarName: string;
  zetrixDid: string;
  /** When set (wizard mock), use this identity instead of a random holder. */
  subjectOverride?: { fullName: string; icNumber: string; dateOfBirth: string };
}): Record<string, unknown> {
  const { avatarId, avatarName, zetrixDid, subjectOverride } = params;
  const holder = subjectOverride
    ? {
        fullName: subjectOverride.fullName,
        citizenship: "MYS" as const,
        gender: "male" as const,
        address: {
          line1: "No. 12, Jalan Demo",
          line2: "Taman Contoh",
          city: "Kuala Lumpur",
          state: "Wilayah Persekutuan",
          postcode: "50450",
        },
      }
    : pickHolder(avatarId);
  const ic = subjectOverride ? subjectOverride.icNumber : mockIcNumber(avatarId);
  const dateOfBirth = subjectOverride
    ? subjectOverride.dateOfBirth
    : (() => {
        const n = BigInt(`0x${deriveHex64(avatarId + ":dob").slice(0, 10)}`);
        const dobYear = 1978 + Number(n % 22n);
        const dobMonth = Number((n / 22n) % 12n) + 1;
        const dobDay = Number((n / (22n * 12n)) % 28n) + 1;
        return isoDateOnly(dobYear, dobMonth, dobDay);
      })();

  const issuerDid = didZidFromSeed(`issuer:mydigital-national:${avatarId}`);
  const operatorDid = didZidFromSeed(`operator:${avatarId}`);
  const vcId = `urn:uuid:${mockUuid(avatarId)}`;
  const statusListId = `https://status.mydigital-id.gov.my/v1/lists/2026q1#${deriveHex64(avatarId + ":st").slice(0, 6)}`;

  const issued = new Date();
  issued.setUTCHours(issued.getUTCHours() - 2);
  const issuanceDate = issued.toISOString();
  const exp = new Date(issued);
  exp.setFullYear(exp.getFullYear() + 2);
  const expirationDate = exp.toISOString();

  const verifiedAt = new Date(issued.getTime() - 8 * 60 * 1000).toISOString();
  const proofCreated = new Date(issued.getTime() - 1 * 60 * 1000).toISOString();
  const proofValue = `z${deriveHex64(`${avatarId}:proof`)}${deriveHex64(`${avatarId}:proof2`).slice(0, 48)}`;

  return {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      "https://w3id.org/security/data-integrity/v2",
      "https://schemas.mydigital-id.gov.my/credentials/mykad-agent/v1",
    ],
    id: vcId,
    type: ["VerifiableCredential", "MyKadIdentityCredential", "AIAgentLinkedIdentityCredential"],
    issuer: issuerDid,
    issuanceDate,
    expirationDate,
    credentialSubject: {
      id: zetrixDid,
      fullName: holder.fullName,
      icNumber: ic,
      citizenship: holder.citizenship,
      dateOfBirth,
      gender: holder.gender,
      address: { ...holder.address },
      agentBinding: {
        agentName: avatarName.trim() || "Untitled avatar",
        agentVersion: "1.0.0",
        operatorDid,
        delegationScope: ["avatar.marketplace", "avatar.profile", "persona.attestation"],
        canActOnBehalfOf: true,
      },
      verificationStatus: {
        identityProofingLevel: "IAL2",
        kycCompleted: true,
        verifiedAt,
      },
    },
    credentialStatus: {
      id: statusListId,
      type: "BitstringStatusListEntry",
      statusPurpose: "revocation",
      statusListIndex: String(parseInt(deriveHex64(avatarId + ":idx").slice(0, 6), 16) % 500_000),
      statusListCredential: "https://status.mydigital-id.gov.my/v1/lists/2026q1",
    },
    proof: {
      type: "DataIntegrityProof",
      cryptosuite: "eddsa-rdfc-2022",
      created: proofCreated,
      verificationMethod: `${issuerDid}#assert-key-2026-01`,
      proofPurpose: "assertionMethod",
      proofValue,
    },
  };
}

/** Bundle as `[{ did, vc }]` for exports or debugging; app stores fields separately. */
export function buildAvatarIdentityMockBundle(params: {
  avatarId: string;
  avatarName: string;
}): { did: string; vc: Record<string, unknown> }[] {
  const did = zetrixDidForAvatar(params.avatarId);
  return [{ did, vc: buildMockMykadVcForAvatar({ ...params, zetrixDid: did }) }];
}

