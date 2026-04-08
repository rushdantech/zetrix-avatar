/** Mock Agent MyKad VC — proves agent ownership binding after MyDigital ID eKYC (UI demo only). */
export function buildMockAgentMykadVc(params: { agentName: string; agentId: string; holderDid: string }) {
  const now = new Date().toISOString();
  const exp = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  return {
    "@context": ["https://www.w3.org/ns/credentials/v2"],
    type: ["VerifiableCredential", "MyKadCardCredential", "AgentBindingCredential"],
    issuer: "did:zetrix:authority:malaysia-mydigital",
    credentialSubject: {
      id: params.holderDid,
      agentId: params.agentId,
      agentName: params.agentName,
      documentType: "MyKad",
      bindingPurpose: "Agent ownership attestation",
    },
    issuanceDate: now,
    expirationDate: exp,
  };
}
