import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBlockZetrixSetupIfExists } from "@/hooks/useBlockZetrixSetupIfExists";
import {
  clearZetrixClawGuidedDraft,
  loadZetrixClawGuidedDraft,
  saveZetrixClawGuidedDraft,
} from "@/lib/studio/zetrixclaw-guided-draft";
import { ZetrixClawSetupPageHeader, ZetrixClawSetupProgress } from "./CreateZetrixClaw";

const DEFAULT_NAME = "MyClaw";

const SUGGESTIONS = ["FinanceClaw", "OpsClaw", "MonitorBot", "AssistClaw", "ResearchClaw"] as const;

function isGenericName(name: string) {
  const t = name.trim().toLowerCase();
  return t === "agent" || t === "bot" || t === "assistant";
}

export default function ZetrixClawSetupStep2Name() {
  useBlockZetrixSetupIfExists();
  const navigate = useNavigate();
  const [name, setName] = useState(DEFAULT_NAME);
  const [touchedNext, setTouchedNext] = useState(false);

  useEffect(() => {
    const draft = loadZetrixClawGuidedDraft();
    if (draft?.agentName !== undefined && draft.agentName !== "") {
      setName(draft.agentName);
    } else {
      setName(DEFAULT_NAME);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const t = name.trim();
      if (t) saveZetrixClawGuidedDraft({ currentStep: 2, agentName: t });
    }, 450);
    return () => window.clearTimeout(id);
  }, [name]);

  const trimmed = name.trim();
  const emptyError = touchedNext && trimmed.length === 0;
  const showGenericHint = trimmed.length > 0 && isGenericName(trimmed);

  const suggestionPills = useMemo(() => [...SUGGESTIONS], []);

  const discardDraft = () => {
    clearZetrixClawGuidedDraft();
    navigate("/studio/agents");
  };

  const goBack = () => {
    saveZetrixClawGuidedDraft({ currentStep: 1, agentName: name.trim() || undefined });
    navigate("/studio/agents/create");
  };

  const goNext = () => {
    setTouchedNext(true);
    if (!trimmed) return;
    saveZetrixClawGuidedDraft({ currentStep: 3, agentName: trimmed });
    navigate("/studio/agents/create/step/3");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-24 lg:pb-8">
      <ZetrixClawSetupPageHeader />

      <ZetrixClawSetupProgress activeStep={2} stepSubtitle="Name" />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="mx-auto max-w-lg">
          <div className="flex flex-col items-center text-center">
            <div
              className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/[0.12] text-primary ring-1 ring-primary/15"
              aria-hidden
            >
              <Bot className="h-8 w-8" strokeWidth={1.75} />
            </div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Name your ZetrixClaw</h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-[15px]">
              Give this agent a name you can recognize in My Agents, chat history, and workspace.
            </p>
          </div>

          <div className="mt-8">
            <label htmlFor="zetrixclaw-agent-name" className="sr-only">
              Agent name
            </label>
            <input
              id="zetrixclaw-agent-name"
              type="text"
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={DEFAULT_NAME}
              className={cn(
                "w-full border-0 border-b-2 bg-transparent px-1 py-3 text-center text-2xl font-semibold tracking-tight text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-0 sm:text-3xl",
                emptyError ? "border-destructive" : "border-primary/25 focus-visible:border-primary",
              )}
              aria-invalid={emptyError}
              aria-describedby={emptyError ? "zetrixclaw-name-error" : showGenericHint ? "zetrixclaw-name-hint" : undefined}
            />
            {emptyError && (
              <p id="zetrixclaw-name-error" className="mt-2 text-center text-sm text-destructive" role="alert">
                Please enter a name.
              </p>
            )}
            {showGenericHint && !emptyError && (
              <p id="zetrixclaw-name-hint" className="mt-2 text-center text-sm text-muted-foreground">
                Try something more specific. You will see this name everywhere.
              </p>
            )}
          </div>

          <div className="mt-8">
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">Ideas</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestionPills.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setName(s)}
                  className="rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  {s}
                </button>
              ))}
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
            <Button type="button" className="w-full gradient-primary font-semibold text-primary-foreground sm:w-auto" onClick={goNext}>
              Next
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
    </div>
  );
}
