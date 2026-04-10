import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useBlockAvatarClawSetupIfExists } from "@/hooks/useBlockAvatarClawSetupIfExists";
import {
  clearAvatarClawGuidedDraft,
  loadAvatarClawGuidedDraft,
  saveAvatarClawGuidedDraft,
  type AvatarClawPersonalityId,
} from "@/lib/studio/avatarclaw-guided-draft";
import { AvatarClawSetupPageHeader, AvatarClawSetupProgress } from "./CreateAvatarClaw";

const PERSONALITIES: Array<{
  id: AvatarClawPersonalityId;
  title: string;
  subtitle: string;
  description: string;
}> = [
  {
    id: "friendly",
    title: "Friendly",
    subtitle: "Warm and easy to approach",
    description: "Talks in a kind, patient, welcoming way.",
  },
  {
    id: "humorous",
    title: "Humorous",
    subtitle: "Light and slightly playful",
    description: "Adds wit without making the output feel unserious.",
  },
  {
    id: "professional",
    title: "Professional",
    subtitle: "Clear and polished",
    description: "Keeps the tone business-ready and composed.",
  },
];

export default function AvatarClawSetupStep3Personality() {
  useBlockAvatarClawSetupIfExists();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [displayName, setDisplayName] = useState("MyClaw");
  const [personalityId, setPersonalityId] = useState<AvatarClawPersonalityId | "">("");

  useEffect(() => {
    const d = loadAvatarClawGuidedDraft();
    if (!d || d.currentStep < 3) {
      navigate("/studio/agents/create/step/2", { replace: true });
      return;
    }
    const name = d.agentName?.trim();
    setDisplayName(name && name.length > 0 ? name : "MyClaw");
    const p = d.personalityId;
    setPersonalityId(p === null || p === undefined ? "" : p);
    setReady(true);
  }, [navigate]);

  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => {
      saveAvatarClawGuidedDraft({
        currentStep: 3,
        personalityId: personalityId === "" ? null : personalityId,
      });
    }, 350);
    return () => window.clearTimeout(id);
  }, [personalityId, ready]);

  const supportingLead = useMemo(() => {
    return `${displayName} can keep one of these tones across chat, task planning, and workspace output. You can also skip this step and set it later.`;
  }, [displayName]);

  const discardDraft = () => {
    clearAvatarClawGuidedDraft();
    navigate("/studio/agents");
  };

  const goBack = () => {
    saveAvatarClawGuidedDraft({ currentStep: 2, personalityId: personalityId === "" ? null : personalityId });
    navigate("/studio/agents/create/step/2");
  };

  const goNext = () => {
    saveAvatarClawGuidedDraft({
      currentStep: 4,
      personalityId: personalityId === "" ? null : personalityId,
    });
    navigate("/studio/agents/create/step/4");
  };

  const skipForNow = () => {
    setPersonalityId("");
    saveAvatarClawGuidedDraft({ currentStep: 4, personalityId: null });
    navigate("/studio/agents/create/step/4");
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
      <AvatarClawSetupPageHeader />

      <AvatarClawSetupProgress activeStep={3} stepSubtitle="Personality" />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="mx-auto max-w-xl">
          <div className="flex flex-col items-center text-center">
            <div
              className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/[0.12] text-primary ring-1 ring-primary/15"
              aria-hidden
            >
              <Bot className="h-8 w-8" strokeWidth={1.75} />
            </div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Assign a Personality</h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-[15px]">{supportingLead}</p>
          </div>

          <div className="mt-8">
            <RadioGroup
              value={personalityId}
              onValueChange={(v) => setPersonalityId(v as AvatarClawPersonalityId)}
              className="grid gap-3"
              aria-label="Personality"
            >
              {PERSONALITIES.map((p) => {
                const selected = personalityId === p.id;
                return (
                  <Label
                    key={p.id}
                    htmlFor={`personality-${p.id}`}
                    className={cn(
                      "cursor-pointer rounded-xl border bg-card p-4 text-left shadow-sm transition-colors",
                      selected ? "border-primary bg-primary/[0.06] ring-1 ring-primary/20" : "border-border hover:bg-secondary/40",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem id={`personality-${p.id}`} value={p.id} className="mt-1" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="text-base font-semibold leading-tight">{p.title}</p>
                          <p className="text-xs font-medium text-muted-foreground">{p.subtitle}</p>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                      </div>
                    </div>
                  </Label>
                );
              })}
            </RadioGroup>

            <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
              No selection is also valid. If you skip, this agent will start with a neutral runtime tone.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="secondary" onClick={discardDraft} className="w-full sm:w-auto">
            Discard draft
          </Button>

          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
            <Button type="button" variant="outline" onClick={goBack} className="w-full sm:w-auto">
              Back
            </Button>
            <Button type="button" variant="ghost" onClick={skipForNow} className="w-full sm:w-auto">
              Skip for now
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
