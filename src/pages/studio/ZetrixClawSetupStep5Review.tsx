import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  clearZetrixClawGuidedDraft,
  loadZetrixClawGuidedDraft,
  saveZetrixClawGuidedDraft,
  ZETRIXCLAW_PERSONALITY_LABELS,
  ZETRIXCLAW_SKILL_PACK_TITLES,
  type ZetrixClawPersonalityId,
  type ZetrixClawSkillPackId,
} from "@/lib/studio/zetrixclaw-guided-draft";
import { ZetrixClawSetupPageHeader, ZetrixClawSetupProgress } from "./CreateZetrixClaw";

const PROVISION_DURATION_MS = 6000;

function provisioningStatusLabel(pct: number): string {
  if (pct <= 25) return "Creating agent…";
  if (pct <= 50) return "Provisioning workspace…";
  if (pct <= 75) return "Applying personality and memory…";
  if (pct <= 95) return "Installing skill packs…";
  return "Finalizing setup…";
}

function toneSentence(personalityId: ZetrixClawPersonalityId | null | undefined) {
  if (!personalityId) {
    return "This ZetrixClaw will launch with a neutral runtime tone. You can assign a personality later.";
  }
  const label = ZETRIXCLAW_PERSONALITY_LABELS[personalityId];
  return `This ZetrixClaw will launch with a ${label} tone across chat, tasks, and workspace. You can change it later.`;
}

export default function ZetrixClawSetupStep5Review() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [agentName, setAgentName] = useState("MyClaw");
  const [personalityId, setPersonalityId] = useState<ZetrixClawPersonalityId | null | undefined>(undefined);
  const [skillPackIds, setSkillPackIds] = useState<ZetrixClawSkillPackId[]>([]);

  const [provisionOpen, setProvisionOpen] = useState(false);
  const [provisionProgress, setProvisionProgress] = useState(0);
  const provisionRafRef = useRef<number | null>(null);
  const provisionCompleteRef = useRef(false);

  useEffect(() => {
    const d = loadZetrixClawGuidedDraft();
    if (!d || d.currentStep < 5) {
      navigate("/studio/agents/create/step/4", { replace: true });
      return;
    }
    const name = d.agentName?.trim();
    setAgentName(name && name.length > 0 ? name : "MyClaw");
    setPersonalityId(d.personalityId === undefined ? undefined : d.personalityId);
    setSkillPackIds(Array.isArray(d.skillPackIds) ? d.skillPackIds : []);
    setReady(true);
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (provisionRafRef.current != null) cancelAnimationFrame(provisionRafRef.current);
    };
  }, []);

  const personalityLabel = useMemo(() => {
    if (personalityId === undefined || personalityId === null) return "Not selected";
    return ZETRIXCLAW_PERSONALITY_LABELS[personalityId];
  }, [personalityId]);

  const skillPackLines = useMemo(() => {
    if (!skillPackIds.length) return "None selected";
    return skillPackIds.map((id) => ZETRIXCLAW_SKILL_PACK_TITLES[id]).join("\n");
  }, [skillPackIds]);

  const discardDraft = () => {
    clearZetrixClawGuidedDraft();
    navigate("/studio/agents");
  };

  const goBack = () => {
    saveZetrixClawGuidedDraft({ currentStep: 4 });
    navigate("/studio/agents/create/step/4");
  };

  const cancelProvision = () => {
    if (provisionRafRef.current != null) {
      cancelAnimationFrame(provisionRafRef.current);
      provisionRafRef.current = null;
    }
    provisionCompleteRef.current = false;
    setProvisionOpen(false);
    setProvisionProgress(0);
  };

  const startProvision = () => {
    if (provisionOpen) return;
    provisionCompleteRef.current = false;
    setProvisionOpen(true);
    setProvisionProgress(0);
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / PROVISION_DURATION_MS);
      const pct = Math.round(t * 100);
      setProvisionProgress(pct);
      if (t < 1) {
        provisionRafRef.current = requestAnimationFrame(tick);
      } else {
        provisionRafRef.current = null;
        if (!provisionCompleteRef.current) {
          provisionCompleteRef.current = true;
          setProvisionProgress(100);
          clearZetrixClawGuidedDraft();
          setProvisionOpen(false);
          toast.success("ZetrixClaw created", {
            description: "Your agent is ready. Open it from My Agents to start chatting.",
          });
          navigate("/studio/agents");
        }
      }
    };
    provisionRafRef.current = requestAnimationFrame(tick);
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

      <ZetrixClawSetupProgress activeStep={5} stepSubtitle="Review" finalReview />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Confirm your ZetrixClaw</h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-[15px]">
              Review the agent name, personality, and skill packs below, then start provisioning. A creation progress dialog
              will appear next.
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-secondary/25 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/[0.12] text-primary ring-1 ring-primary/15"
                aria-hidden
              >
                <Bot className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-lg font-bold tracking-tight sm:text-xl">{agentName}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{toneSentence(personalityId ?? null)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Agent Name</p>
              <p className="mt-1 font-medium text-foreground">{agentName}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Personality</p>
              <p className="mt-1 font-medium text-foreground">{personalityLabel}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Installed Skill Packs</p>
              <p className={cn("mt-1 font-medium text-foreground", !skillPackIds.length && "text-muted-foreground")}>
                {skillPackIds.length ? (
                  <span className="whitespace-pre-line">{skillPackLines}</span>
                ) : (
                  "None selected"
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="secondary" onClick={discardDraft} className="w-full sm:w-auto">
            Discard draft
          </Button>
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={goBack} className="w-full sm:w-auto">
              Back
            </Button>
            <Button
              type="button"
              className="w-full gradient-primary font-semibold text-primary-foreground sm:w-auto"
              onClick={startProvision}
            >
              Create ZetrixClaw
            </Button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Need the classic enterprise task wizard?{" "}
        <Link to="/studio/agents/create/enterprise" className="font-medium text-primary hover:underline">
          Open legacy Create Agent
        </Link>
      </p>

      <Dialog open={provisionOpen} onOpenChange={() => {}}>
        <DialogContent
          hideCloseButton
          overlayClassName="bg-black/45 backdrop-blur-[2px]"
          className="max-w-md gap-0 overflow-hidden rounded-2xl p-0 sm:rounded-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="p-6 sm:p-8">
            <DialogHeader className="space-y-4 text-left sm:text-left">
              <div className="flex gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20"
                  aria-hidden
                >
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
                <div className="min-w-0 space-y-1 pt-0.5">
                  <DialogTitle className="text-xl font-semibold leading-snug tracking-tight">
                    Creating {agentName}
                  </DialogTitle>
                </div>
              </div>
              <DialogDescription className="text-left text-[15px] leading-relaxed text-muted-foreground">
                Provisioning your ZetrixClaw runtime, workspace bridge, memory layer, and personality profile. Setup
                completes in about 6 seconds, then My Agents opens for configuration.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{provisioningStatusLabel(provisionProgress)}</span>
                <span className="tabular-nums text-sm font-semibold text-foreground">{provisionProgress}%</span>
              </div>
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={provisionProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Provisioning progress"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/85 transition-[width] duration-150 ease-out"
                  style={{ width: `${provisionProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Please keep this tab open while setup completes.</p>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="mt-8 h-12 w-full text-base font-medium"
              onClick={cancelProvision}
            >
              Cancel setup and edit draft
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
