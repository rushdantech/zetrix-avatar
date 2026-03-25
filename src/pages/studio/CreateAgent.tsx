import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
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
import { BootstrapTokenModal } from "@/components/identity/BootstrapTokenModal";
import { useApp } from "@/contexts/AppContext";
import type { EnterpriseAgentDraft } from "@/types/studio";
import { enterpriseStep1Schema, enterpriseStep2Schema, enterpriseStep3Schema } from "@/lib/studio/create-avatar-schemas";
import { applyZodIssues } from "@/lib/studio/apply-zod-issues";
import {
  EnterpriseStepProfile,
  EnterpriseStepCapabilities,
  EnterpriseStepIdentity,
  EnterpriseStepReview,
} from "@/components/studio/enterprise-form-steps";
import { cn } from "@/lib/utils";
import { buildEnterpriseStudioEntity } from "@/lib/studio/build-user-studio-entity";
import {
  DEFAULT_CUSTOM_API_INTEGRATION_CODE,
  emptyCapabilityAccessRequestedMap,
  emptyCapabilityApiKeyMap,
} from "@/lib/studio/constants";

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
    setupIdentityNow: true,
    selectedScopes: [],
    validityStart: start,
    validityEnd: end,
  };
}

function newBootstrapToken() {
  return `zid_bootstrap_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 18)}`;
}

export default function CreateAgent() {
  const navigate = useNavigate();
  const { addUserStudioEntity } = useApp();
  const [step, setStep] = useState(1);
  const [showToken, setShowToken] = useState(false);
  const [tokenConfirmed, setTokenConfirmed] = useState(false);
  const [bootstrapToken, setBootstrapToken] = useState("");
  const [agentSetupLoading, setAgentSetupLoading] = useState(false);
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
    defaultValues: newEnterpriseDefaults(),
    mode: "onTouched",
  });

  const enterpriseStepLabels = ["Profile", "Capabilities", "Identity", "Review"];
  const totalEnterpriseSteps = 4;

  const prevStep = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const nextEnterprise = async () => {
    enterpriseForm.clearErrors();
    const v = enterpriseForm.getValues();
    if (step === 1) {
      const r = enterpriseStep1Schema.safeParse({
        name: v.name,
        description: v.description,
        agentType: v.agentType,
        department: v.department,
      });
      if (!r.success) {
        applyZodIssues(r.error.issues, enterpriseForm.setError);
        return;
      }
    }
    if (step === 2) {
      const r = enterpriseStep2Schema.safeParse({
        capabilities: v.capabilities,
        operatingHours: v.operatingHours,
        maxConcurrentTasks: v.maxConcurrentTasks,
        escalationEmail: v.escalationEmail ?? "",
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
    if (step < totalEnterpriseSteps) setStep((s) => s + 1);
  };

  const finishEnterprise = () => {
    enterpriseForm.clearErrors();
    const v = enterpriseForm.getValues();
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
    if (v.setupIdentityNow) {
      setBootstrapToken(newBootstrapToken());
      setTokenConfirmed(false);
      setShowToken(true);
    } else {
      setAgentSetupLoading(true);
      if (setupTimerRef.current) clearTimeout(setupTimerRef.current);
      setupTimerRef.current = setTimeout(() => {
        setupTimerRef.current = null;
        addUserStudioEntity(buildEnterpriseStudioEntity(v, { credentialed: false }));
        setAgentSetupLoading(false);
        toast.success("Agent created. Find it in My Agents.");
        navigate("/studio/agents", { state: { showNoZidBanner: true } });
      }, 10_000);
    }
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
              Spooling up compute, memory, and task queues for your agent. In this demo, setup completes in about{" "}
              <span className="font-medium text-foreground">10 seconds</span>, then you’ll go to My Agents.
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
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">Create Agent</h1>
        <Link to="/studio/avatars/create" className="text-sm font-medium text-primary hover:underline">
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
            {step === 2 && <EnterpriseStepCapabilities />}
            {step === 3 && <EnterpriseStepIdentity />}
            {step === 4 && <EnterpriseStepReview />}

            <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4">
              <button type="button" onClick={() => navigate("/studio/agents")} className="rounded-lg bg-secondary px-4 py-2 text-sm">
                Cancel
              </button>
              <div className="flex flex-wrap gap-2">
                {step > 1 && (
                  <button type="button" onClick={prevStep} className="rounded-lg bg-secondary px-4 py-2 text-sm">
                    Back
                  </button>
                )}
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextEnterprise}
                    className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={finishEnterprise}
                    className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Create AI agent
                  </button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>

      <BootstrapTokenModal
        open={showToken}
        token={bootstrapToken}
        copied={tokenConfirmed}
        onCopiedChange={setTokenConfirmed}
        onClose={() => {
          setShowToken(false);
          const v = enterpriseForm.getValues();
          addUserStudioEntity(buildEnterpriseStudioEntity(v, { credentialed: true }));
          toast.success("Agent created and credentialed. Listed in My Agents.");
          navigate("/identity/agents");
        }}
      />
    </div>
  );
}
