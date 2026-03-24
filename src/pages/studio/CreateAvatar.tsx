import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { TypeSelector } from "@/components/studio/TypeSelector";
import { IndividualOnboardingFlow } from "@/components/studio/IndividualOnboardingFlow";
import { BootstrapTokenModal } from "@/components/identity/BootstrapTokenModal";
import { useApp } from "@/contexts/AppContext";
import type { StudioEntityType, EnterpriseAgentDraft } from "@/types/studio";
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

export default function CreateAvatar() {
  const navigate = useNavigate();
  const { onboardingComplete, addUserStudioEntity } = useApp();
  const [selected, setSelected] = useState<StudioEntityType | null>(null);
  const [step, setStep] = useState(1);
  const [showToken, setShowToken] = useState(false);
  const [tokenConfirmed, setTokenConfirmed] = useState(false);
  const [bootstrapToken, setBootstrapToken] = useState("");

  const enterpriseForm = useForm<EnterpriseAgentDraft>({
    defaultValues: newEnterpriseDefaults(),
    mode: "onTouched",
  });

  const pickType = (t: StudioEntityType) => {
    setSelected(t);
    setStep(1);
    if (t === "enterprise") {
      enterpriseForm.reset(newEnterpriseDefaults());
    }
  };

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
      addUserStudioEntity(buildEnterpriseStudioEntity(v, { credentialed: false }));
      toast.success("Agent created. Find it in My Avatars.");
      navigate("/studio/avatars", { state: { showNoZidBanner: true } });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold">Create Avatar</h1>

      {!selected && <TypeSelector value={selected} onChange={pickType} />}

      {selected === "individual" && onboardingComplete && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          <p>
            You can create <span className="font-medium text-foreground">another</span> individual avatar anytime. Finishing
            the wizard updates your active dashboard persona (see{" "}
            <Link to="/persona" className="font-medium text-primary hover:underline">
              Avatar Studio
            </Link>
            ) and adds this avatar to{" "}
            <Link to="/studio/avatars" className="font-medium text-primary hover:underline">
              My Avatars
            </Link>
            .
          </p>
        </div>
      )}

      {selected === "individual" && (
        <IndividualOnboardingFlow
          onComplete={() => navigate("/dashboard", { replace: true })}
          onBackToTypeSelect={() => setSelected(null)}
          onChooseEnterprise={() => {
            setSelected("enterprise");
            setStep(1);
            enterpriseForm.reset(newEnterpriseDefaults());
          }}
        />
      )}

      {selected === "enterprise" && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Enterprise agent</h2>
              <p className="text-xs text-muted-foreground">
                Step {step} of {totalEnterpriseSteps}: {enterpriseStepLabels[step - 1]}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setStep(1);
              }}
              className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-secondary/80"
            >
              Change type
            </button>
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
                <button
                  type="button"
                  onClick={() => navigate("/studio/avatars")}
                  className="rounded-lg bg-secondary px-4 py-2 text-sm"
                >
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
                      Create Agent
                    </button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </div>
      )}

      <BootstrapTokenModal
        open={showToken}
        token={bootstrapToken}
        copied={tokenConfirmed}
        onCopiedChange={setTokenConfirmed}
        onClose={() => {
          setShowToken(false);
          const v = enterpriseForm.getValues();
          addUserStudioEntity(buildEnterpriseStudioEntity(v, { credentialed: true }));
          toast.success("Agent created and credentialed. Listed in My Avatars.");
          navigate("/identity/agents");
        }}
      />
    </div>
  );
}
