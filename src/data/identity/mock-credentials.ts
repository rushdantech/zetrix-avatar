export const mockZidIdentityCredential = {
  "@context": ["https://www.w3.org/ns/credentials/v2"],
  type: ["VerifiableCredential", "ZIDIdentityCredential"],
  issuer: "did:zetrix:authority:malaysia-zid",
  credentialSubject: {
    id: "did:zetrix:enterprise:zetrix-ai-bhd:3fca97d1a4e5b88d121113f0",
    legalName: "Zetrix AI Bhd",
    registrationType: "SSM Certificate",
    registrationNo: "201901234567",
  },
  issuanceDate: "2026-01-12T09:00:00Z",
  expirationDate: "2027-01-12T09:00:00Z",
};
