import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useBlockAvatarClawSetupIfExists } from "@/hooks/useBlockAvatarClawSetupIfExists";
import {
  clearAvatarClawGuidedDraft,
  loadAvatarClawGuidedDraft,
  saveAvatarClawGuidedDraft,
  type AvatarClawSkillPackId,
} from "@/lib/studio/avatarclaw-guided-draft";
import { AvatarClawSetupPageHeader, AvatarClawSetupProgress } from "./CreateAvatarClaw";

const PACKS: Array<{
  id: AvatarClawSkillPackId;
  title: string;
  description: string;
  features: string[];
  outcome: string;
}> = [
  {
    id: "creative-marketing",
    title: "Creative Marketing",
    description:
      "Includes Social Media Trend Monitoring, One-Click Multi-Channel Distribution, and Personalized Copy Generation.",
    features: [
      "Social Media Trend Monitoring",
      "One-Click Multi-Channel Distribution",
      "Personalized Copy Generation",
    ],
    outcome: "Helps automate content workflows and campaign execution.",
  },
  {
    id: "identity-trust",
    title: "Identity & Trust",
    description:
      "Includes MyDigital ID Verification, On-Chain Credential Verification, and Enterprise Identity Audit.",
    features: ["MyDigital ID Verification", "On-Chain Credential Verification", "Enterprise Identity Audit"],
    outcome: "Helps build trusted digital identity and reduce privacy risks.",
  },
  {
    id: "global-trade",
    title: "Global Trade & Compliance",
    description:
      "Includes Trade License Application, Cross-Border Customs Automation, and Compliance Scan.",
    features: ["Trade License Application", "Cross-Border Customs Automation", "Compliance Scan"],
    outcome: "Helps process complex trade paperwork and compliance workflows.",
  },
];

function toggleId(ids: AvatarClawSkillPackId[], id: AvatarClawSkillPackId): AvatarClawSkillPackId[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

export default function AvatarClawSetupStep4SkillPacks() {
  useBlockAvatarClawSetupIfExists();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<AvatarClawSkillPackId[]>([]);

  useEffect(() => {
    const d = loadAvatarClawGuidedDraft();
    if (!d || d.currentStep < 4) {
      navigate("/studio/agents/create/step/3", { replace: true });
      return;
    }
    setSelected(Array.isArray(d.skillPackIds) ? d.skillPackIds : []);
    setReady(true);
  }, [navigate]);

  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => {
      saveAvatarClawGuidedDraft({ currentStep: 4, skillPackIds: selected });
    }, 350);
    return () => window.clearTimeout(id);
  }, [selected, ready]);

  const summaryLine = useMemo(() => {
    const n = selected.length;
    const label = n === 1 ? "skill pack" : "skill packs";
    return `Selected ${n} ${label}. These skills will be installed automatically when AvatarClaw is created.`;
  }, [selected.length]);

  const discardDraft = () => {
    clearAvatarClawGuidedDraft();
    navigate("/studio/agents");
  };

  const goBack = () => {
    saveAvatarClawGuidedDraft({ currentStep: 3, skillPackIds: selected });
    navigate("/studio/agents/create/step/3");
  };

  const goNext = () => {
    saveAvatarClawGuidedDraft({ currentStep: 5, skillPackIds: selected });
    navigate("/studio/agents/create/step/5");
  };

  const skipForNow = () => {
    setSelected([]);
    saveAvatarClawGuidedDraft({ currentStep: 5, skillPackIds: [] });
    navigate("/studio/agents/create/step/5");
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

      <AvatarClawSetupProgress activeStep={4} stepSubtitle="Skill Packs" />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
        <div className="mx-auto max-w-xl">
          <div className="flex flex-col items-center text-center">
            <div
              className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/[0.12] text-primary ring-1 ring-primary/15"
              aria-hidden
            >
              <Bot className="h-8 w-8" strokeWidth={1.75} />
            </div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">Install Skill Packs</h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-[15px]">
              Choose one or more prebuilt skill packs to let AvatarClaw handle specialized professional tasks. Installed
              packs will appear in Skills and stay enabled until you change them later.
            </p>
          </div>

          <div className="mt-8 max-h-[min(420px,55vh)] space-y-3 overflow-y-auto overscroll-contain pr-1">
            {PACKS.map((pack) => {
              const checked = selected.includes(pack.id);
              const inputId = `skill-pack-${pack.id}`;
              return (
                <div key={pack.id}>
                  <Label
                    htmlFor={inputId}
                    className={cn(
                      "block cursor-pointer rounded-xl border p-4 text-left shadow-sm transition-colors",
                      checked ? "border-primary bg-primary/[0.06] ring-1 ring-primary/20" : "border-border hover:bg-secondary/40",
                    )}
                  >
                    <div className="flex gap-3">
                      <Checkbox
                        id={inputId}
                        checked={checked}
                        onCheckedChange={() => setSelected((prev) => toggleId(prev, pack.id))}
                        className="mt-1"
                        aria-describedby={`${inputId}-desc`}
                      />
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="text-base font-semibold leading-tight">{pack.title}</p>
                        <p id={`${inputId}-desc`} className="text-sm leading-relaxed text-muted-foreground">
                          {pack.description}
                        </p>
                        <ul className="list-inside list-disc text-xs text-muted-foreground/90">
                          {pack.features.map((f) => (
                            <li key={f}>{f}</li>
                          ))}
                        </ul>
                        <p className="text-xs font-medium text-foreground/80">
                          <span className="text-muted-foreground">Outcome: </span>
                          {pack.outcome}
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">{summaryLine}</p>
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
