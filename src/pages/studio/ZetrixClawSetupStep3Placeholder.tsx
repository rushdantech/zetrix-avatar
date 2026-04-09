import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { clearZetrixClawGuidedDraft, loadZetrixClawGuidedDraft } from "@/lib/studio/zetrixclaw-guided-draft";
import { ZetrixClawSetupPageHeader, ZetrixClawSetupProgress } from "./CreateZetrixClaw";

/**
 * Placeholder for steps 3–5; name is stored on the guided draft from step 2.
 */
export default function ZetrixClawSetupStep3Placeholder() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [agentName, setAgentName] = useState("your agent");

  useEffect(() => {
    const d = loadZetrixClawGuidedDraft();
    if (!d || d.currentStep < 3) {
      navigate("/studio/agents/create/step/2", { replace: true });
      return;
    }
    setAgentName(d.agentName?.trim() || "your agent");
    setReady(true);
  }, [navigate]);

  const discardDraft = () => {
    clearZetrixClawGuidedDraft();
    navigate("/studio/agents");
  };

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl pb-24 pt-12 text-center text-sm text-muted-foreground" aria-busy="true">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-24 lg:pb-8">
      <ZetrixClawSetupPageHeader />

      <ZetrixClawSetupProgress activeStep={3} stepSubtitle="Next" />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <p className="text-sm text-muted-foreground">
          Guided steps <span className="font-medium text-foreground">3–5</span> will continue here. You named this agent{" "}
          <span className="font-semibold text-foreground">{agentName}</span>.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-6">
          <Button type="button" variant="secondary" onClick={discardDraft}>
            Discard draft
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/studio/agents/create/step/2")}>
            Back
          </Button>
          <Button type="button" className="gradient-primary text-primary-foreground" asChild>
            <Link to="/studio/agents/create/enterprise">Use classic enterprise wizard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
