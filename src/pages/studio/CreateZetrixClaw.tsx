import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBlockZetrixSetupIfExists } from "@/hooks/useBlockZetrixSetupIfExists";
import { clearZetrixClawGuidedDraft, saveZetrixClawGuidedDraft } from "@/lib/studio/zetrixclaw-guided-draft";

export const TOTAL_ZETRIXCLAW_SETUP_STEPS = 5;

export function ZetrixClawSetupPageHeader() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => navigate("/studio/agents")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Back to My Agents
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Create ZetrixClaw</h1>
        <p className="text-sm text-muted-foreground">
          Your answers are saved in this prototype until the agent is created or you discard the draft.
        </p>
      </div>
      <Link
        to="/studio/avatars/create"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline sm:pt-8"
      >
        Create avatar instead
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

export function ZetrixClawSetupProgress({
  activeStep,
  stepSubtitle,
  finalReview,
}: {
  activeStep: number;
  stepSubtitle?: string;
  /** Step 5 review: all segments filled with brand gradient; active step emphasized. */
  finalReview?: boolean;
}) {
  const isFinal = Boolean(finalReview && activeStep === TOTAL_ZETRIXCLAW_SETUP_STEPS);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">
        ZetrixClaw setup – Step {activeStep} of {TOTAL_ZETRIXCLAW_SETUP_STEPS}
        {stepSubtitle ? `: ${stepSubtitle}` : null}
      </p>
      <div
        className={cn("flex gap-1.5", isFinal && "rounded-full bg-primary/10 p-1.5 ring-1 ring-primary/15")}
        role="list"
        aria-label={`Setup progress, step ${activeStep} of ${TOTAL_ZETRIXCLAW_SETUP_STEPS}`}
      >
        {Array.from({ length: TOTAL_ZETRIXCLAW_SETUP_STEPS }, (_, i) => {
          const n = i + 1;
          const active = n === activeStep;
          const done = n < activeStep;
          return (
            <div
              key={n}
              role="listitem"
              className={cn(
                "h-2 min-w-0 flex-1 rounded-full transition-colors",
                isFinal && "gradient-primary shadow-sm",
                isFinal && active && "ring-2 ring-primary/50 shadow-glow",
                !isFinal && active && "bg-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.25)]",
                !isFinal && done && "gradient-primary opacity-90",
                !isFinal && !active && !done && "bg-muted",
              )}
              title={`Step ${n}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function CreateZetrixClaw() {
  useBlockZetrixSetupIfExists();
  const navigate = useNavigate();

  const discardDraft = () => {
    clearZetrixClawGuidedDraft();
    navigate("/studio/agents");
  };

  const startCreating = () => {
    saveZetrixClawGuidedDraft({ currentStep: 2 });
    navigate("/studio/agents/create/step/2");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-24 lg:pb-8">
      <ZetrixClawSetupPageHeader />

      <ZetrixClawSetupProgress activeStep={1} />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card via-secondary/20 to-primary/[0.06] px-5 py-8 sm:px-8 sm:py-10">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/[0.12] blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-primary/[0.08] blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10 bg-background/20"
            aria-hidden
          />

          <div className="relative flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">ZetrixClaw</h2>
              <Badge variant="secondary" className="border border-primary/20 bg-primary/10 text-primary">
                Beta
              </Badge>
            </div>

            <div className="space-y-5 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Rapid OpenClaw Setup</p>
                <p>
                  Deploy a preconfigured general agent with workspace memory, reusable skills, and 24/7 task readiness in
                  one guided flow.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Conversation-first Runtime</p>
                <p>
                  ZetrixClaw starts in chat mode, then expands into workspace, tools, and execution feedback after
                  launch.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Start now</p>
                  <p className="mt-1 text-sm text-foreground">Create a new ZetrixClaw agent with guided setup.</p>
                </div>
              </div>
              <Button
                type="button"
                size="lg"
                className="w-full shrink-0 gradient-primary font-semibold text-primary-foreground shadow-sm sm:w-auto sm:self-end"
                onClick={startCreating}
              >
                Start Creating
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-start border-t border-border pt-6">
          <Button type="button" variant="secondary" onClick={discardDraft}>
            Discard draft
          </Button>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Need the classic enterprise task wizard?{" "}
        <Link to="/studio/agents/create/enterprise" className="font-medium text-primary hover:underline">
          Open legacy Create Agent
        </Link>
      </p>
    </div>
  );
}
