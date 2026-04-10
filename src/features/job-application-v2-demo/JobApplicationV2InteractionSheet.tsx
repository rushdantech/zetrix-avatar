import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  Building2,
  ChevronDown,
  FileText,
  GraduationCap,
  RefreshCw,
  ShieldCheck,
  SkipForward,
  User,
  Play,
  Pause,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { JOB_APP_V2_LABEL, MYEG_RECRUITER_LABEL } from "./constants";
import {
  POST_APPLY_TIMELINE,
  jobV2Status,
  myegStatus,
  type DemoActor,
} from "./demoTimeline";

function actorStyles(actor: DemoActor): { border: string; bg: string; label: string } {
  switch (actor) {
    case "job_v2":
      return {
        border: "border-primary/40",
        bg: "bg-primary/5",
        label: "text-primary",
      };
    case "myeg":
      return {
        border: "border-info/45",
        bg: "bg-info/10",
        label: "text-info",
      };
    case "system":
      return {
        border: "border-violet-500/35",
        bg: "bg-violet-500/10",
        label: "text-violet-700 dark:text-violet-200",
      };
    default:
      return {
        border: "border-border",
        bg: "bg-secondary/50",
        label: "text-foreground",
      };
  }
}

function actorLabel(actor: DemoActor): string {
  switch (actor) {
    case "job_v2":
      return JOB_APP_V2_LABEL;
    case "myeg":
      return `${MYEG_RECRUITER_LABEL} · MYEG`;
    case "system":
      return "System";
    case "user":
      return "You";
    default:
      return "—";
  }
}

const AUTO_MS = 900;

export function JobApplicationV2InteractionSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [experience, setExperience] = useState(false);
  const [idDoc, setIdDoc] = useState(false);
  const [degree, setDegree] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const uploadsComplete = experience && idDoc && degree;
  const shown = POST_APPLY_TIMELINE.slice(0, visibleCount);
  const done = submitted && visibleCount >= POST_APPLY_TIMELINE.length;

  const reset = useCallback(() => {
    setExperience(false);
    setIdDoc(false);
    setDegree(false);
    setProfileReady(false);
    setSubmitted(false);
    setVisibleCount(0);
    setAutoPlay(false);
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (!autoPlay || !submitted || done) return;
    if (visibleCount >= POST_APPLY_TIMELINE.length) {
      setAutoPlay(false);
      return;
    }
    const t = window.setTimeout(() => {
      setVisibleCount((c) => Math.min(c + 1, POST_APPLY_TIMELINE.length));
    }, AUTO_MS);
    return () => window.clearTimeout(t);
  }, [autoPlay, submitted, visibleCount, done]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleCount, submitted, profileReady]);

  const simulateFile = (label: string, active: boolean, onToggle: () => void) => (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
        active ? "border-success/50 bg-success/10" : "border-border bg-card hover:bg-secondary/60",
      )}
    >
      <FileText className={cn("h-4 w-4 shrink-0", active ? "text-success" : "text-muted-foreground")} />
      <span className="font-medium">{label}</span>
      {active && (
        <Badge variant="outline" className="ml-auto border-success/40 text-[10px] text-success">
          Attached
        </Badge>
      )}
    </button>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <SheetHeader className="space-y-1 border-b border-border px-6 py-4 text-left">
          <SheetTitle className="pr-8">Agent interaction (demo)</SheetTitle>
          <SheetDescription>
            Two-agent job screening between <span className="font-medium text-foreground">{JOB_APP_V2_LABEL}</span> and{" "}
            <span className="font-medium text-foreground">{MYEG_RECRUITER_LABEL}</span>. Canned, deterministic flow.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="max-h-[calc(100vh-8rem)] flex-1 px-6">
          <div className="space-y-6 py-4">
            {/* Section: uploads & prep */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">1 · Profile & documents</h3>
              <p className="text-xs text-muted-foreground">
                Simulate uploads — your Job Application Agent v2 will use these in the structured profile and proof references.
              </p>
              <div className="space-y-2">
                {simulateFile("Experience summary (PDF)", experience, () => setExperience((v) => !v))}
                {simulateFile("National ID (scan)", idDoc, () => setIdDoc((v) => !v))}
                {simulateFile("Degree certificate", degree, () => setDegree((v) => !v))}
              </div>
              <Button
                type="button"
                size="sm"
                className="w-full"
                disabled={!uploadsComplete || profileReady}
                onClick={() => setProfileReady(true)}
              >
                Prepare profile with {JOB_APP_V2_LABEL}
              </Button>
              {profileReady && (
                <div className="rounded-lg border border-success/35 bg-success/10 px-3 py-2 text-xs text-foreground">
                  <div className="flex items-center gap-2 font-medium text-success">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Credentials prepared — profile structured; verifiable references bound to uploads.
                  </div>
                </div>
              )}
            </section>

            {/* Apply */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">2 · Application</h3>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                disabled={!profileReady || submitted}
                onClick={() => {
                  setSubmitted(true);
                  setVisibleCount(1);
                }}
              >
                Apply to MYEG (demo)
              </Button>
            </section>

            {/* Timeline */}
            {submitted && (
              <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">3 · Agent timeline</h3>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px]"
                      disabled={done}
                      onClick={() => setVisibleCount((c) => Math.min(c + 1, POST_APPLY_TIMELINE.length))}
                    >
                      <SkipForward className="mr-1 h-3 w-3" />
                      Next event
                    </Button>
                    <Button
                      type="button"
                      variant={autoPlay ? "secondary" : "outline"}
                      size="sm"
                      className="h-7 text-[11px]"
                      disabled={done}
                      onClick={() => setAutoPlay((a) => !a)}
                    >
                      {autoPlay ? <Pause className="mr-1 h-3 w-3" /> : <Play className="mr-1 h-3 w-3" />}
                      {autoPlay ? "Pause" : "Auto-play"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {shown.map((entry) => {
                    const st = actorStyles(entry.actor);
                    const Icon = entry.icon;
                    return (
                      <div
                        key={entry.id}
                        className={cn("rounded-xl border p-3 shadow-sm", st.border, st.bg)}
                      >
                        <div className="flex items-start gap-2">
                          <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", st.label)} />
                          <div className="min-w-0 flex-1">
                            <p className={cn("text-[11px] font-semibold", st.label)}>{actorLabel(entry.actor)}</p>
                            <p className="text-sm font-medium leading-snug text-foreground">{entry.headline}</p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{entry.detail}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              </section>
            )}

            {/* Status summary */}
            {submitted && (
              <section className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <Bot className="h-4 w-4 text-primary" />
                    {JOB_APP_V2_LABEL}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">You</p>
                  <Badge variant="secondary" className="mt-2 text-[10px]">
                    {jobV2Status(visibleCount, profileReady, submitted)}
                  </Badge>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <Building2 className="h-4 w-4 text-info" />
                    {MYEG_RECRUITER_LABEL}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">MYEG</p>
                  <Badge variant="secondary" className="mt-2 text-[10px]">
                    {myegStatus(visibleCount, submitted)}
                  </Badge>
                </div>
              </section>
            )}

            {/* Verification summary */}
            {visibleCount >= 9 && (
              <section className="space-y-2 rounded-xl border border-success/30 bg-success/5 p-3">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-success">
                  <GraduationCap className="h-4 w-4" />
                  Verification summary
                </h3>
                <ul className="space-y-1.5 text-xs text-foreground">
                  <li className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Identity</span>
                    <span className="font-medium text-success">Passed</span>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Degree</span>
                    <span className="font-medium text-success">Passed</span>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Source</span>
                    <span>Blockchain-backed credential</span>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Integrity</span>
                    <span>No tampering detected</span>
                  </li>
                </ul>

                <Collapsible className="border-t border-border/80 pt-2">
                  <CollapsibleTrigger className="group flex w-full items-center justify-between text-[11px] font-medium text-muted-foreground hover:text-foreground">
                    Technical proof (mock)
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-1 rounded-md bg-secondary/50 p-2 font-mono text-[10px] text-muted-foreground">
                    <p>
                      <span className="text-foreground/80">proof_ref_id:</span> VC-ID-MY-2026-4412
                    </p>
                    <p>
                      <span className="text-foreground/80">hash:</span> sha256:9f3c…e21a
                    </p>
                    <p>
                      <span className="text-foreground/80">issuer:</span> MyDigital ID · MOHE registry
                    </p>
                    <p>
                      <span className="text-foreground/80">timestamp:</span> 2026-04-10T03:22:11Z
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              </section>
            )}

            {/* User lane (compact) */}
            {profileReady && (
              <section className="flex items-start gap-2 rounded-lg border border-dashed border-border/80 bg-muted/20 p-2 text-[11px] text-muted-foreground">
                <User className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  <span className="font-medium text-foreground">You</span> — uploads and “Apply” trigger the agents; all recruiter-facing replies are drafted by{" "}
                  {JOB_APP_V2_LABEL}.
                </span>
              </section>
            )}
          </div>
        </ScrollArea>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-background px-6 py-3">
          <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={reset}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            Reset demo
          </Button>
          {done && (
            <Badge variant="outline" className="border-success/40 text-success">
              Screening complete
            </Badge>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
