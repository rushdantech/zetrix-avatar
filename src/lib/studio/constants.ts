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
  { key: "submit-government-form", label: "LHDN Tax Filing", description: "Submit tax forms to LHDN portal" },
  { key: "ssm-filings", label: "SSM Filings", description: "Submit annual returns and company forms to SSM" },
  { key: "authorize-payment", label: "Payment Authorization", description: "Authorize and process payments via JMYR" },
  { key: "sign-document", label: "Document Signing", description: "Sign documents using enterprise identity" },
  { key: "issue-credential", label: "Credential Issuance", description: "Issue verifiable credentials to third parties" },
  { key: "custom-api", label: "Custom API", description: "Connect to custom REST/GraphQL endpoints" },
] as const;
