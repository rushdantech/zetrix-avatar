import type { PersonaSettings } from "@/lib/mock-data";
import {
  DEFAULT_CUSTOM_API_INTEGRATION_CODE,
  emptyCapabilityAccessRequestedMap,
  emptyCapabilityApiKeyMap,
} from "@/lib/studio/constants";
import type {
  EnterpriseAgentDraft,
  IndividualAvatarSetupMock,
  RagDocumentItem,
  StudioEntityEnterprise,
  StudioEntityIndividual,
} from "@/types/studio";

/** RHF often omits nested defaults for never-mounted fields; merge before Zod or persistence. */
export function mergeEnterpriseDraftDefaults(v: EnterpriseAgentDraft): EnterpriseAgentDraft {
  const capK = emptyCapabilityApiKeyMap();
  const capR = emptyCapabilityAccessRequestedMap();
  const custom = {
    endpointUrl: "",
    httpMethod: "POST" as EnterpriseAgentDraft["customApiIntegration"]["httpMethod"],
    integrationCode: DEFAULT_CUSTOM_API_INTEGRATION_CODE,
  };
  return {
    ...v,
    capabilityApiKeys: { ...capK, ...(v.capabilityApiKeys ?? {}) },
    capabilityApiAccessRequested: { ...capR, ...(v.capabilityApiAccessRequested ?? {}) },
    customApiIntegration: { ...custom, ...(v.customApiIntegration ?? {}) },
    knowledgebaseDocuments: [...(v.knowledgebaseDocuments ?? [])],
  };
}

type PersonaFormSlice = Pick<
  PersonaSettings,
  "name" | "bio" | "audience" | "tonePlayful" | "toneBold" | "toneWitty" | "styleTags"
>;

export function buildIndividualStudioEntity(params: {
  personaForm: PersonaFormSlice;
  photosCount: number;
  questionnaireAnswers: Record<number, string | string[] | number>;
  voiceCloningEnabled: boolean;
  ragDocuments: RagDocumentItem[];
}): StudioEntityIndividual {
  const id = `ind_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  const setup: IndividualAvatarSetupMock = {
    bio: params.personaForm.bio,
    audience: params.personaForm.audience,
    styleTags: [...params.personaForm.styleTags],
    tonePlayful: params.personaForm.tonePlayful,
    toneBold: params.personaForm.toneBold,
    toneWitty: params.personaForm.toneWitty,
    photoCount: params.photosCount,
    voiceCloningEnabled: params.voiceCloningEnabled,
    questionnaireAnswers: { ...params.questionnaireAnswers },
    dpoAnswers: {},
    ragDocuments: params.ragDocuments.map((d) => ({ ...d })),
  };
  return {
    id,
    name: params.personaForm.name.trim() || "Untitled avatar",
    type: "individual",
    description: (params.personaForm.bio || params.personaForm.name).slice(0, 220),
    status: "draft",
    image: null,
    created_at: new Date().toISOString(),
    published_at: null,
    marketplace_downloads: 0,
    marketplace_active_subscriptions: 0,
    zid_credentialed: false,
    individualSetup: setup,
  };
}

export function buildEnterpriseStudioEntity(
  v: EnterpriseAgentDraft,
  opts: { credentialed: boolean },
): StudioEntityEnterprise {
  const n = mergeEnterpriseDraftDefaults(v);
  const id = `ent_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    name: n.name.trim() || "Untitled agent",
    type: "enterprise",
    description: (n.description || n.name).slice(0, 280),
    status: "draft",
    image: null,
    created_at: new Date().toISOString(),
    published_at: null,
    marketplace_downloads: 0,
    marketplace_active_subscriptions: 0,
    zid_credentialed: opts.credentialed,
    zid_status: opts.credentialed ? "active" : undefined,
    zid_scopes: opts.credentialed && n.selectedScopes.length ? [...n.selectedScopes] : undefined,
    enterpriseSetup: {
      agentType: n.agentType,
      department: n.department ?? "",
      capabilities: [...n.capabilities],
      capabilityApiKeys: { ...n.capabilityApiKeys },
      capabilityApiAccessRequested: { ...n.capabilityApiAccessRequested },
      customApiIntegration: { ...n.customApiIntegration },
      operatingHours: n.operatingHours,
      maxConcurrentTasks: n.maxConcurrentTasks,
      escalationEmail: n.escalationEmail,
      setupIdentityNow: n.setupIdentityNow,
      selectedScopes: [...n.selectedScopes],
      validityStart: n.validityStart ?? "",
      validityEnd: n.validityEnd ?? "",
      knowledgebaseDocuments: (n.knowledgebaseDocuments ?? []).map((d) => ({ ...d })),
    },
  };
}
