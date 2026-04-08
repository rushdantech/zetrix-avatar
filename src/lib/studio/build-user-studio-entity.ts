import type { PersonaSettings } from "@/lib/mock-data";
import {
  DEFAULT_CUSTOM_API_INTEGRATION_CODE,
  emptyCapabilityAccessRequestedMap,
  emptyCapabilityApiKeyMap,
} from "@/lib/studio/constants";
import { buildMockMykadVcForAvatar, zetrixDidForAvatar } from "@/lib/studio/mock-avatar-mykad-vc";
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
  "name" | "bio" | "audience" | "tonePlayful" | "toneBold" | "toneWitty" | "styleTags" | "avatarArchetype"
>;

export function buildIndividualStudioEntity(params: {
  personaForm: PersonaFormSlice;
  photosCount: number;
  questionnaireAnswers: Record<number, string | string[] | number>;
  voiceCloningEnabled: boolean;
  ragDocuments: RagDocumentItem[];
  mydigitalEkycCompleted: boolean;
}): StudioEntityIndividual {
  const id = `ind_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  const name = params.personaForm.name.trim() || "Untitled avatar";
  const zetrixDid = params.mydigitalEkycCompleted ? zetrixDidForAvatar(id) : undefined;
  const mykadVc =
    params.mydigitalEkycCompleted && zetrixDid
      ? buildMockMykadVcForAvatar({ avatarId: id, avatarName: name, zetrixDid })
      : undefined;

  const setup: IndividualAvatarSetupMock = {
    bio: params.personaForm.bio,
    ...(params.personaForm.avatarArchetype?.trim()
      ? { avatarArchetype: params.personaForm.avatarArchetype.trim() }
      : {}),
    audience: params.personaForm.audience,
    styleTags: [...params.personaForm.styleTags],
    tonePlayful: params.personaForm.tonePlayful,
    toneBold: params.personaForm.toneBold,
    toneWitty: params.personaForm.toneWitty,
    photoCount: params.photosCount,
    voiceCloningEnabled: params.voiceCloningEnabled,
    questionnaireAnswers: { ...params.questionnaireAnswers },
    ragDocuments: params.ragDocuments.map((d) => ({ ...d })),
    ...(params.mydigitalEkycCompleted && zetrixDid && mykadVc
      ? { mydigitalEkycVerified: true, zetrixDid, mykadVc }
      : {}),
  };
  return {
    id,
    name,
    type: "individual",
    description: (params.personaForm.bio || params.personaForm.name).slice(0, 220),
    status: "draft",
    image: null,
    created_at: new Date().toISOString(),
    published_at: null,
    marketplace_downloads: 0,
    marketplace_active_subscriptions: 0,
    zid_credentialed: params.mydigitalEkycCompleted,
    zid_status: params.mydigitalEkycCompleted ? "active" : undefined,
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

/** Build a full draft from an existing enterprise entity (e.g. agent detail → capabilities editor). */
export function enterpriseEntityToAgentDraft(entity: StudioEntityEnterprise): EnterpriseAgentDraft {
  const s = entity.enterpriseSetup;
  return mergeEnterpriseDraftDefaults({
    name: entity.name,
    description: entity.description,
    agentType: s.agentType,
    department: s.department,
    capabilities: [...s.capabilities],
    capabilityApiKeys: { ...(s.capabilityApiKeys ?? {}) },
    capabilityApiAccessRequested: { ...(s.capabilityApiAccessRequested ?? {}) },
    customApiIntegration: s.customApiIntegration ? { ...s.customApiIntegration } : undefined,
    operatingHours: s.operatingHours,
    maxConcurrentTasks: s.maxConcurrentTasks,
    escalationEmail: s.escalationEmail,
    setupIdentityNow: s.setupIdentityNow,
    selectedScopes: [...s.selectedScopes],
    validityStart: s.validityStart,
    validityEnd: s.validityEnd,
    knowledgebaseDocuments: [...(s.knowledgebaseDocuments ?? [])],
  });
}

const DEFAULT_MAX_CONCURRENT = 5;

/** Merge defaults before validating Create Agent step 2 or agent detail capabilities save. */
export function enterpriseStep2PayloadForValidation(v: EnterpriseAgentDraft): EnterpriseAgentDraft {
  const merged = mergeEnterpriseDraftDefaults(v);
  return {
    ...merged,
    capabilities: merged.capabilities ?? [],
    operatingHours: merged.operatingHours ?? "24/7",
    maxConcurrentTasks:
      typeof merged.maxConcurrentTasks === "number" && Number.isFinite(merged.maxConcurrentTasks)
        ? merged.maxConcurrentTasks
        : Number(merged.maxConcurrentTasks) || DEFAULT_MAX_CONCURRENT,
    escalationEmail: merged.escalationEmail ?? "",
  };
}
