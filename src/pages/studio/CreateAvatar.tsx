import { Link, Navigate, useNavigate } from "react-router-dom";
import { IndividualOnboardingFlow } from "@/components/studio/IndividualOnboardingFlow";
import { useApp } from "@/contexts/AppContext";

export default function CreateAvatar() {
  const navigate = useNavigate();
  const { onboardingComplete, hasActiveProAccess, openProUpgradePaywall, userStudioEntities } = useApp();
  const hasIndividualAvatar = userStudioEntities.some((e) => e.type === "individual");

  const goAvatarClaw = () => {
    if (hasActiveProAccess) navigate("/studio/agents/create");
    else openProUpgradePaywall();
  };

  if (hasIndividualAvatar) {
    return <Navigate to="/studio/avatars" replace />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">Create Avatar</h1>
        <button type="button" onClick={goAvatarClaw} className="text-sm font-medium text-primary hover:underline">
          AvatarClaw instead →
        </button>
      </div>

      {onboardingComplete && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          <p>
            Finishing the wizard updates your dashboard persona and creates your single avatar in{" "}
            <Link to="/studio/avatars" className="font-medium text-primary hover:underline">
              Avatar Studio
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
