import { Link, useNavigate } from "react-router-dom";
import { IndividualOnboardingFlow } from "@/components/studio/IndividualOnboardingFlow";
import { useApp } from "@/contexts/AppContext";

export default function CreateAvatar() {
  const navigate = useNavigate();
  const { onboardingComplete } = useApp();

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">Create Avatar</h1>
        <button type="button" onClick={() => navigate("/studio/agents/create")} className="text-sm font-medium text-primary hover:underline">
          Create ZetrixClaw instead →
        </button>
      </div>

      {onboardingComplete && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          <p>
            You can create <span className="font-medium text-foreground">another</span> avatar anytime. Finishing the wizard
            updates your active dashboard persona (see{" "}
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

      <IndividualOnboardingFlow
        onComplete={() => navigate("/studio/avatars", { replace: true })}
        onBackToTypeSelect={() => navigate("/studio/avatars")}
        onChooseEnterprise={() => navigate("/studio/agents/create/enterprise")}
      />
    </div>
  );
}
