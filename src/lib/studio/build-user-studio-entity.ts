import type { PersonaSettings } from "@/lib/mock-data";
import type {
  EnterpriseAgentDraft,
  IndividualAvatarSetupMock,
  RagDocumentItem,
  StudioEntityEnterprise,
  StudioEntityIndividual,
} from "@/types/studio";

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
  const id = `ent_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    name: v.name.trim() || "Untitled agent",
    type: "enterprise",
    description: (v.description || v.name).slice(0, 280),
    status: "draft",
    image: null,
    created_at: new Date().toISOString(),
    published_at: null,
    marketplace_downloads: 0,
    marketplace_active_subscriptions: 0,
    zid_credentialed: opts.credentialed,
    zid_status: opts.credentialed ? "active" : undefined,
    zid_scopes: opts.credentialed && v.selectedScopes.length ? [...v.selectedScopes] : undefined,
    enterpriseSetup: {
      agentType: v.agentType,
      department: v.department ?? "",
      capabilities: [...v.capabilities],
      capabilityApiKeys: { ...v.capabilityApiKeys },
      capabilityApiAccessRequested: { ...v.capabilityApiAccessRequested },
      customApiIntegration: { ...v.customApiIntegration },
      operatingHours: v.operatingHours,
      maxConcurrentTasks: v.maxConcurrentTasks,
      escalationEmail: v.escalationEmail,
      setupIdentityNow: v.setupIdentityNow,
      selectedScopes: [...v.selectedScopes],
      validityStart: v.validityStart ?? "",
      validityEnd: v.validityEnd ?? "",
    },
  };
}
