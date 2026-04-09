const ZETRIXCLAW_GUIDED_STORAGE_KEY = "zetrix-zetrixclaw-guided-setup";

export type ZetrixClawGuidedDraft = {
  currentStep: number;
  agentName?: string;
  updatedAt: number;
};

export function loadZetrixClawGuidedDraft(): ZetrixClawGuidedDraft | null {
  try {
    const raw = sessionStorage.getItem(ZETRIXCLAW_GUIDED_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ZetrixClawGuidedDraft;
    if (typeof parsed.currentStep !== "number" || parsed.currentStep < 1 || parsed.currentStep > 5) {
      return null;
    }
    return {
      currentStep: parsed.currentStep,
      agentName: typeof parsed.agentName === "string" ? parsed.agentName : undefined,
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveZetrixClawGuidedDraft(partial: Partial<Omit<ZetrixClawGuidedDraft, "updatedAt">> & { currentStep?: number }) {
  const prev = loadZetrixClawGuidedDraft();
  const next: ZetrixClawGuidedDraft = {
    currentStep: partial.currentStep ?? prev?.currentStep ?? 1,
    agentName: partial.agentName !== undefined ? partial.agentName : prev?.agentName,
    updatedAt: Date.now(),
  };
  try {
    sessionStorage.setItem(ZETRIXCLAW_GUIDED_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function clearZetrixClawGuidedDraft() {
  try {
    sessionStorage.removeItem(ZETRIXCLAW_GUIDED_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
