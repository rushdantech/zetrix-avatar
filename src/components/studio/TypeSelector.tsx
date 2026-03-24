import { Bot, User } from "lucide-react";
import type { StudioEntityType } from "@/types/studio";
import { cn } from "@/lib/utils";

export function TypeSelector({
  value,
  onChange,
}: {
  value: StudioEntityType | null;
  onChange: (v: StudioEntityType) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <button
        onClick={() => onChange("individual")}
        className={cn("rounded-xl border p-6 text-left", value === "individual" ? "border-primary shadow-glow" : "border-border")}
      >
        <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2 text-primary"><User className="h-5 w-5" /></div>
        <h3 className="text-lg font-semibold">Avatar</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Guided setup: photos, questionnaire, documents (RAG), voice, consent. Your creator-style persona for marketplace
          and content; the legacy /onboarding URL redirects here.
        </p>
      </button>
      <button
        onClick={() => onChange("enterprise")}
        className={cn("rounded-xl border p-6 text-left", value === "enterprise" ? "border-info shadow-glow" : "border-border")}
      >
        <div className="mb-3 inline-flex rounded-lg bg-info/10 p-2 text-info"><Bot className="h-5 w-5" /></div>
        <h3 className="text-lg font-semibold">AI Agent</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Task-focused agent for <span className="font-medium text-foreground">enterprise</span> workflows or{" "}
          <span className="font-medium text-foreground">personal</span> automation — tools, identity, and marketplace
          listings.
        </p>
      </button>
    </div>
  );
}
