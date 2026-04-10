import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AVATARCLAW_USER_AGENT_ID,
  loadAvatarClawAgentInstance,
} from "@/lib/studio/avatarclaw-agent-instance";

export default function AvatarClawGuidePage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const instance = loadAvatarClawAgentInstance();

  useEffect(() => {
    if (agentId !== AVATARCLAW_USER_AGENT_ID || !instance) {
      navigate("/studio/agents", { replace: true });
    }
  }, [agentId, instance, navigate]);

  if (!instance || agentId !== AVATARCLAW_USER_AGENT_ID) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-16">
      <Button variant="ghost" size="sm" asChild>
        <Link to={`/studio/agents/${AVATARCLAW_USER_AGENT_ID}/runtime`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to chat
        </Link>
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AvatarClaw user guide</h1>
          <p className="text-sm text-muted-foreground">Browser prototype · no backend</p>
        </div>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-foreground">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mt-0 text-lg font-semibold">What AvatarClaw does</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            AvatarClaw is a general-purpose operations copilot. You brief it with goals, constraints, and deadlines; it
            replies with structured briefs and execution plans. It can reference workspace files, memory, and skills
            when tasks involve configuration or scripts.
          </p>
        </section>
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mt-0 text-lg font-semibold">Workspace</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The workspace holds editable documents: prompts, skills, AGENTS.md, state files, and more. Open it from the
            runtime sidebar to browse folders, edit files, and save changes locally in this prototype.
          </p>
        </section>
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mt-0 text-lg font-semibold">Memory</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Long-term memory is represented under <code className="text-xs">memory/</code> in the workspace. Use it for
            collaborator summaries and consolidation settings (mock).
          </p>
        </section>
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mt-0 text-lg font-semibold">Prompts and skills</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Prompts define reusable brief scaffolds; skills describe repeatable task patterns. The runtime chat matches
            your request against enabled skills (mock) before locking execution.
          </p>
        </section>
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mt-0 text-lg font-semibold">Execution confirmation</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            When a plan looks right, use <strong>Lock In</strong> on the agent response to signal commitment to an
            execution flow (mock). You can send follow-ups to revise constraints or attach file references.
          </p>
        </section>
      </div>
    </div>
  );
}
