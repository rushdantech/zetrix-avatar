export const PERSONALITY_TRAITS = [
  "Friendly",
  "Professional",
  "Humorous",
  "Empathetic",
  "Direct",
  "Creative",
  "Analytical",
] as const;

export const INDIVIDUAL_LANGUAGES = [
  "English",
  "Bahasa Malaysia",
  "Mandarin",
  "Tamil",
] as const;

export const KNOWLEDGE_DOMAINS = [
  "Finance",
  "Food & Cooking",
  "Education",
  "Travel",
  "Technology",
  "Health",
  "Legal",
  "Entertainment",
  "Sports",
  "Custom",
] as const;

export const ENTERPRISE_CAPABILITIES = [
  {
    key: "submit-government-form",
    label: "LHDN Tax Filing",
    description: "Submit tax forms to LHDN portal",
    authMode: "provider" as const,
    providerHint: "LHDN / MyTax API",
  },
  {
    key: "ssm-filings",
    label: "SSM Filings",
    description: "Submit annual returns and company forms to SSM",
    authMode: "provider" as const,
    providerHint: "SSM e-info / MyData API",
  },
  {
    key: "authorize-payment",
    label: "Payment Authorization",
    description: "Authorize and process payments via JMYR",
    authMode: "provider" as const,
    providerHint: "Banking / payment gateway API",
  },
  {
    key: "sign-document",
    label: "Document Signing",
    description: "Sign documents using enterprise identity",
    authMode: "provider" as const,
    providerHint: "Document signing / e-signature provider",
  },
  {
    key: "issue-credential",
    label: "Credential Issuance",
    description: "Issue verifiable credentials to third parties",
    authMode: "provider" as const,
    providerHint: "ZID / W3C VC issuer API",
  },
  {
    key: "custom-api",
    label: "Custom API",
    description: "Call your own REST or GraphQL endpoints from agent tasks",
    authMode: "custom_endpoint" as const,
    providerHint: "Your infrastructure",
  },
] as const;

export type EnterpriseCapabilityMeta = (typeof ENTERPRISE_CAPABILITIES)[number];

/** Starter snippet users can edit for Custom API (demo — not executed). */
export const DEFAULT_CUSTOM_API_INTEGRATION_CODE = `/**
 * Agent → your HTTP endpoint. Replace URL, headers, and body shape.
 * Runs in a secure sandbox in production; this wizard only saves the definition.
 */
export async function invokeCustomApi(payload: {
  task: string;
  input: Record<string, unknown>;
  agentId: string;
}): Promise<{ ok: boolean; data?: unknown; error?: string }> {
  const baseUrl = process.env.CUSTOM_AGENT_API_URL ?? "https://api.example.com";
  const res = await fetch(\`\${baseUrl}/v1/agent/hook\`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${process.env.CUSTOM_AGENT_API_KEY}\`,
    },
    body: JSON.stringify({
      task: payload.task,
      input: payload.input,
      metadata: { agentId: payload.agentId, source: "zetrix-agent-studio" },
    }),
  });
  if (!res.ok) {
    return { ok: false, error: await res.text() };
  }
  return { ok: true, data: await res.json() };
}
`;

export function emptyCapabilityApiKeyMap(): Record<string, string> {
  return Object.fromEntries(ENTERPRISE_CAPABILITIES.map((c) => [c.key, ""])) as Record<string, string>;
}

export function emptyCapabilityAccessRequestedMap(): Record<string, boolean> {
  return Object.fromEntries(ENTERPRISE_CAPABILITIES.map((c) => [c.key, false])) as Record<string, boolean>;
}
