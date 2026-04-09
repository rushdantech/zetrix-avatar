import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ZetrixClawSetupProgress, clearZetrixClawGuidedDraft } from "./CreateZetrixClaw";

/**
 * Placeholder for guided steps 2–5; keeps navigation non-dead after Step 1.
 */
export default function ZetrixClawSetupStep2Placeholder() {
  const navigate = useNavigate();

  const discardDraft = () => {
    clearZetrixClawGuidedDraft();
    navigate("/studio/agents");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-24 lg:pb-8">
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => navigate("/studio/agents/create")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Back to step 1
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Create ZetrixClaw</h1>
        <p className="text-sm text-muted-foreground">
          Your answers are saved in this prototype until the agent is created or you discard the draft.
        </p>
      </div>

      <ZetrixClawSetupProgress activeStep={2} />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <p className="text-sm text-muted-foreground">
          Guided steps <span className="font-medium text-foreground">2–5</span> will continue the assistant-style setup
          here (persona, skills, workspace, review). This screen is a placeholder in the prototype.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-6">
          <Button type="button" variant="secondary" onClick={discardDraft}>
            Discard draft
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/studio/agents/create")}>
            Back to overview
          </Button>
          <Button type="button" className="gradient-primary text-primary-foreground" asChild>
            <Link to="/studio/agents/create/enterprise">Use classic enterprise wizard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
