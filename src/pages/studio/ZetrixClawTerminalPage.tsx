import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ZETRIXCLAW_USER_AGENT_ID,
  loadZetrixClawAgentInstance,
} from "@/lib/studio/zetrixclaw-agent-instance";
import { cn } from "@/lib/utils";

type Phase = "idle" | "launching" | "ready";

export default function ZetrixClawTerminalPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const instance = loadZetrixClawAgentInstance();
  const name = instance?.name?.trim() || "MyClaw";
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (agentId !== ZETRIXCLAW_USER_AGENT_ID || !instance) {
      navigate("/studio/agents", { replace: true });
    }
  }, [agentId, instance, navigate]);

  const launch = () => {
    setPhase("launching");
    window.setTimeout(() => setPhase("ready"), 1400);
  };

  if (!instance || agentId !== ZETRIXCLAW_USER_AGENT_ID) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/studio/agents/${ZETRIXCLAW_USER_AGENT_ID}/runtime`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to chat
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Execution terminal</h1>
              <p className="text-sm text-muted-foreground">{name} · ZetrixClaw runtime utility</p>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">
            Mock
          </Badge>
        </div>
        <div
          className={cn(
            "mt-4 rounded-lg border px-3 py-2 text-sm",
            phase === "ready" ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:text-emerald-100" : "border-primary/25 bg-primary/5",
          )}
        >
          {phase === "launching" && "Launching shell session…"}
          {phase === "ready" &&
            "Terminal requested. The agent is ready to open its execution environment."}
          {phase === "idle" &&
            "Use Launch to simulate attaching a runtime shell. Full I/O is not wired in this prototype."}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-[#0c0c0e] font-mono text-sm text-emerald-100 shadow-inner">
        <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-3 py-2 text-[11px] text-zinc-400">
          <span>zetrix-claw · mock tty</span>
          <span>{phase === "ready" ? "connected" : phase === "launching" ? "connecting…" : "idle"}</span>
        </div>
        <div className="min-h-[220px] space-y-1 p-4 text-[13px] leading-relaxed">
          <p className="text-zinc-500">$ # ZetrixClaw execution stub</p>
          {phase === "launching" && <p className="text-amber-300/90">… spawning pseudo-terminal</p>}
          {phase === "ready" && (
            <>
              <p>
                <span className="text-emerald-400">$</span> zc-runtime --status
              </p>
              <p className="text-zinc-300">gateway: mock · workspace: mounted · queue: idle</p>
              <p>
                <span className="text-emerald-400">$</span> <span className="animate-pulse">_</span>
              </p>
            </>
          )}
          {phase === "idle" && (
            <p>
              <span className="text-emerald-400">$</span> <span className="text-zinc-600">awaiting launch…</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={launch} disabled={phase === "launching"}>
          {phase === "ready" ? "Relaunch" : "Launch terminal"}
        </Button>
        <Button variant="outline" asChild>
          <Link to={`/studio/agents/${ZETRIXCLAW_USER_AGENT_ID}/workspace`}>Open workspace</Link>
        </Button>
      </div>
    </div>
  );
}
