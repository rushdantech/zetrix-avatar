import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/contexts/AppContext";
import type { EnterpriseAgentDraft } from "@/types/studio";
import {
  enterpriseStep1Schema,
  enterpriseStep3Schema,
  enterpriseStep5ConsentSchema,
} from "@/lib/studio/create-avatar-schemas";
import { applyZodIssues } from "@/lib/studio/apply-zod-issues";
import {
  EnterpriseStepProfile,
  EnterpriseStepKnowledgebase,
  EnterpriseStepIdentity,
  EnterpriseStepEkyc,
  EnterpriseStepConsent,
  EnterpriseStepReview,
} from "@/components/studio/enterprise-form-steps";
import { cn } from "@/lib/utils";
import { buildEnterpriseStudioEntity } from "@/lib/studio/build-user-studio-entity";
import {
  DEFAULT_CUSTOM_API_INTEGRATION_CODE,
  emptyCapabilityAccessRequestedMap,
  emptyCapabilityApiKeyMap,
} from "@/lib/studio/constants";

const WIZARD_STORAGE_KEY = "zetrix-create-enterprise-agent-wizard";

type PersistedWizard = { step: number; values: EnterpriseAgentDraft };

function loadPersistedWizard(): PersistedWizard | null {
  try {
    const raw = sessionStorage.getItem(WIZARD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedWizard;
    if (typeof parsed.step !== "number" || parsed.step < 1 || parsed.step > 6 || !parsed.values || typeof parsed.values !== "object") {
      return null;
    }
    return { step: parsed.step, values: parsed.values };
  } catch {
    return null;
  }
}

function persistWizard(step: number, values: EnterpriseAgentDraft) {
  try {
    sessionStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify({ step, values }));
  } catch {
    /* ignore quota / private mode */
  }
}

function clearPersistedWizard() {
  try {
    sessionStorage.removeItem(WIZARD_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const validityDefaults = () => {
  const start = new Date().toISOString().slice(0, 10);
  const end = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return { start, end };
};

function newEnterpriseDefaults(): EnterpriseAgentDraft {
  const { start, end } = validityDefaults();
  return {
    name: "",
    description: "",
    agentType: "Internal Operations",
    department: "",
    capabilities: [],
    capabilityApiKeys: emptyCapabilityApiKeyMap(),
    capabilityApiAccessRequested: emptyCapabilityAccessRequestedMap(),
    customApiIntegration: {
      endpointUrl: "",
      httpMethod: "POST",
      integrationCode: DEFAULT_CUSTOM_API_INTEGRATION_CODE,
    },
    operatingHours: "24/7",
    maxConcurrentTasks: 5,
    escalationEmail: "",
    setupIdentityNow: false,
    selectedScopes: [],
    validityStart: start,
    validityEnd: end,
    knowledgebaseDocuments: [],
    ekycMyDigitalCompleted: false,
    consentAgentTerms: false,
    consentMyDigitalStatement: false,
  };
}

function mergeWizardValues(saved: PersistedWizard | null): EnterpriseAgentDraft {
  const d = newEnterpriseDefaults();
  if (!saved?.values) return d;
  const v = saved.values;
  return {
    ...d,
    ...v,
    capabilityApiKeys: { ...d.capabilityApiKeys, ...(v.capabilityApiKeys ?? {}) },
    capabilityApiAccessRequested: { ...d.capabilityApiAccessRequested, ...(v.capabilityApiAccessRequested ?? {}) },
    customApiIntegration: { ...d.customApiIntegration, ...(v.customApiIntegration ?? {}) },
    selectedScopes: Array.isArray(v.selectedScopes) ? [...v.selectedScopes] : [],
    capabilities: Array.isArray(v.capabilities) ? [...v.capabilities] : [],
    knowledgebaseDocuments: Array.isArray(v.knowledgebaseDocuments)
      ? v.knowledgebaseDocuments.map((x) => ({ ...x }))
      : [],
    ekycMyDigitalCompleted: typeof v.ekycMyDigitalCompleted === "boolean" ? v.ekycMyDigitalCompleted : d.ekycMyDigitalCompleted,
    consentAgentTerms: typeof v.consentAgentTerms === "boolean" ? v.consentAgentTerms : d.consentAgentTerms,
    consentMyDigitalStatement:
      typeof v.consentMyDigitalStatement === "boolean" ? v.consentMyDigitalStatement : d.consentMyDigitalStatement,
  };
}

export default function CreateAgent() {
  const navigate = useNavigate();
  const { addUserStudioEntity } = useApp();
  const savedWizardRef = useRef(loadPersistedWizard());
  const [step, setStep] = useState(() => savedWizardRef.current?.step ?? 1);
  const [agentSetupLoading, setAgentSetupLoading] = useState(false);
  /** Mirrors last create: used for provisioning dialog copy + post-timeout navigation. */
  const [agentSetupWithIdentity, setAgentSetupWithIdentity] = useState(false);
  const [setupProgress, setSetupProgress] = useState(0);
  const setupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setupRafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (setupTimerRef.current) clearTimeout(setupTimerRef.current);
      if (setupRafRef.current != null) cancelAnimationFrame(setupRafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!agentSetupLoading) {
      setSetupProgress(0);
      return;
    }
    const start = performance.now();
    const duration = 10_000;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setSetupProgress(Math.round(t * 100));
      if (t < 1) setupRafRef.current = requestAnimationFrame(tick);
      else setupRafRef.current = null;
    };
    setupRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (setupRafRef.current != null) {
        cancelAnimationFrame(setupRafRef.current);
        setupRafRef.current = null;
      }
    };
  }, [agentSetupLoading]);

  const enterpriseForm = useForm<EnterpriseAgentDraft>({
    defaultValues: mergeWizardValues(savedWizardRef.current),
    mode: "onTouched",
  });

  const watchedValues = enterpriseForm.watch();
  useEffect(() => {
    if (agentSetupLoading) return;
    const id = window.setTimeout(() => {
      persistWizard(step, enterpriseForm.getValues());
    }, 450);
    return () => window.clearTimeout(id);
  }, [watchedValues, step, agentSetupLoading, enterpriseForm]);

  const backToMyAgents = () => {
    persistWizard(step, enterpriseForm.getValues());
    navigate("/studio/agents");
  };

  const abandonWizard = () => {
    clearPersistedWizard();
    navigate("/studio/agents");
  };

  const cancelProvisioning = () => {
    if (setupTimerRef.current) {
      clearTimeout(setupTimerRef.current);
      setupTimerRef.current = null;
    }
    setAgentSetupLoading(false);
    setStep(6);
    persistWizard(6, enterpriseForm.getValues());
    toast.message("Setup cancelled", { description: "You can edit the review step and try again." });
  };

  const enterpriseStepLabels = ["Profile", "Knowledge base", "Identity", "MyDigital ID", "Consent", "Review"];
  const totalEnterpriseSteps = 6;

  const prevStep = () => {
    if (step > 1) {
      setStep((s) => {
        const next = s - 1;
        queueMicrotask(() => persistWizard(next, enterpriseForm.getValues()));
        return next;
      });
    }
  };

  const nextEnterprise = async () => {
    enterpriseForm.clearErrors();
    const v = enterpriseForm.getValues();
    if (step === 1) {
      const r = enterpriseStep1Schema.safeParse({
        name: v.name,
        description: v.description,
      });
      if (!r.success) {
        applyZodIssues(r.error.issues, enterpriseForm.setError);
        return;
      }
    }
    if (step === 3) {
      const r = enterpriseStep3Schema.safeParse({
        setupIdentityNow: v.setupIdentityNow,
        selectedScopes: v.selectedScopes,
        validityStart: v.validityStart,
        validityEnd: v.validityEnd,
      });
      if (!r.success) {
        applyZodIssues(r.error.issues, enterpriseForm.setError);
        return;
      }
    }
    if (step === 5) {
      const r = enterpriseStep5ConsentSchema.safeParse({
        consentAgentTerms: v.consentAgentTerms,
        consentMyDigitalStatement: v.consentMyDigitalStatement,
      });
      if (!r.success) {
        applyZodIssues(r.error.issues, enterpriseForm.setError);
        return;
      }
    }
    if (step < totalEnterpriseSteps) {
      setStep((s) => {
        const next = s + 1;
        queueMicrotask(() => persistWizard(next, enterpriseForm.getValues()));
        return next;
      });
    }
  };

  const finishEnterprise = () => {
    enterpriseForm.clearErrors();
    const v = enterpriseForm.getValues();
    const r5 = enterpriseStep5ConsentSchema.safeParse({
      consentAgentTerms: v.consentAgentTerms,
      consentMyDigitalStatement: v.consentMyDigitalStatement,
    });
    if (!r5.success) {
      applyZodIssues(r5.error.issues, enterpriseForm.setError);
      setStep(5);
      toast.error("Accept the consent items before creating.");
      return;
    }
    const r3 = enterpriseStep3Schema.safeParse({
      setupIdentityNow: v.setupIdentityNow,
      selectedScopes: v.selectedScopes,
      validityStart: v.validityStart,
      validityEnd: v.validityEnd,
    });
    if (!r3.success) {
      applyZodIssues(r3.error.issues, enterpriseForm.setError);
      setStep(3);
      toast.error("Fix identity & compliance fields before creating.");
      return;
    }
    setAgentSetupWithIdentity(v.setupIdentityNow);
    setAgentSetupLoading(true);
    if (setupTimerRef.current) clearTimeout(setupTimerRef.current);
    setupTimerRef.current = setTimeout(() => {
      setupTimerRef.current = null;
      const credentialed = v.setupIdentityNow;
      const createdAgent = buildEnterpriseStudioEntity(v, { credentialed });
      addUserStudioEntity(createdAgent);
      setAgentSetupLoading(false);
      clearPersistedWizard();
      if (credentialed) {
        toast.success("Agent created with digital identity", {
          description: "Opening task chat so you can configure this agent immediately.",
        });
        navigate("/studio/agents", { state: { openTaskChatAgentId: createdAgent.id } });
      } else {
        toast.success("Agent created. Find it in My Agents.");
        navigate("/studio/agents", {
          state: {
            showNoZidBanner: true,
            openTaskChatAgentId: createdAgent.id,
          },
        });
      }
    }, 10_000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20 lg:pb-0">
      <Dialog open={agentSetupLoading} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-md [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
              </span>
              <span>Provisioning your AI agent</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-base leading-relaxed">
              Spooling up compute, memory, and task queues for your agent
              {(() => {
                const v = enterpriseForm.getValues();
                const parts = [
                  agentSetupWithIdentity && "digital identity binding",
                  v.ekycMyDigitalCompleted && "MyDigital ID verification",
                ].filter(Boolean) as string[];
                if (parts.length === 0) return ".";
                return `, including ${parts.join(" and ")}.`;
              })()}{" "}
              Setup completes in about <span className="font-medium text-foreground">10 seconds</span>, then task chat opens for
              configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>Spooling up…</span>
              <span className="tabular-nums font-medium text-foreground">{setupProgress}%</span>
            </div>
            <Progress value={setupProgress} className="h-2" aria-label="Agent provisioning progress" />
          </div>
          <p className="text-xs text-muted-foreground">Please keep this tab open while setup completes.</p>
          <button
            type="button"
            onClick={cancelProvisioning}
            className="mt-2 w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary/80"
          >
            Cancel setup and edit draft
          </button>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="space-y-2">
          <button
            type="button"
            onClick={backToMyAgents}
            disabled={agentSetupLoading}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
            Back to My Agents
          </button>
          <p className="text-xs text-muted-foreground">
            Your answers are saved in this browser until the agent is created or you discard the draft.
          </p>
          <h1 className="text-2xl font-bold">Create Agent Task</h1>
        </div>
        <Link to="/studio/avatars/create" className="text-sm font-medium text-primary hover:underline sm:pt-7">
          Create avatar instead →
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">AI agent</h2>
            <p className="text-xs text-muted-foreground">
              Step {step} of {totalEnterpriseSteps}: {enterpriseStepLabels[step - 1]}
            </p>
          </div>
        </div>

        <div className="mb-6 flex gap-1">
          {enterpriseStepLabels.map((label, i) => (
            <div
              key={label}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i < step ? "gradient-primary" : i === step - 1 ? "bg-primary/50" : "bg-secondary",
              )}
              title={label}
            />
          ))}
        </div>

        <Form {...enterpriseForm}>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {step === 1 && <EnterpriseStepProfile />}
            {step === 2 && <EnterpriseStepKnowledgebase />}
            {step === 3 && <EnterpriseStepIdentity />}
            {step === 4 && <EnterpriseStepEkyc />}
            {step === 5 && <EnterpriseStepConsent />}
            {step === 6 && <EnterpriseStepReview />}

            <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={abandonWizard}
                disabled={agentSetupLoading}
                className="rounded-lg bg-secondary px-4 py-2 text-sm disabled:pointer-events-none disabled:opacity-50"
              >
                Discard draft
              </button>
              <div className="flex flex-wrap gap-2">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={agentSetupLoading}
                    className="rounded-lg bg-secondary px-4 py-2 text-sm disabled:pointer-events-none disabled:opacity-50"
                  >
                    Back
                  </button>
                )}
                {step < totalEnterpriseSteps ? (
                  <button
                    type="button"
                    onClick={nextEnterprise}
                    disabled={agentSetupLoading}
                    className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={finishEnterprise}
                    disabled={agentSetupLoading}
                    className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
                  >
                    Create AI agent
                  </button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
