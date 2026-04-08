/**
 * Mock MyKad VC issued to an avatar after MyDigital ID eKYC (demo only).
 * Production will replace with real issuance from Zetrix / ZID services.
 */
export function buildMockMykadVcForAvatar(params: {
  avatarId: string;
  avatarName: string;
  zetrixDid: string;
}): Record<string, unknown> {
  const now = new Date().toISOString();
  const exp = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  return {
    "@context": ["https://www.w3.org/ns/credentials/v2"],
    type: ["VerifiableCredential", "ZIDMyKadCredential", "AvatarBindingCredential"],
    issuer: "did:zetrix:authority:malaysia-zid",
    credentialSubject: {
      id: params.zetrixDid,
      avatarId: params.avatarId,
      avatarDisplayName: params.avatarName,
      documentType: "MyKad",
      bindingPurpose: "Proves the human controller of this avatar (holder attestation via MyDigital ID).",
    },
    issuanceDate: now,
    expirationDate: exp,
  };
}

export function zetrixDidForAvatar(avatarId: string): string {
  const slug = avatarId.replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 48) || "avatar";
  return `did:zetrix:avatar:${slug}`;
}
