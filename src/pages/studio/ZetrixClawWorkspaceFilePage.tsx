import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ZETRIXCLAW_USER_AGENT_ID,
  loadZetrixClawAgentInstance,
} from "@/lib/studio/zetrixclaw-agent-instance";

const SEGMENT_META: Record<string, { title: string; hint: string; placeholder: string }> = {
  memory: {
    title: "memory/",
    hint: "Long-term memory and consolidation. Edits are mock-only until backend is wired.",
    placeholder: "# Memory store (mock)\n- User preferences\n- Consolidated facts from past runs",
  },
  prompts: {
    title: "prompts/",
    hint: "Runtime prompts and reusable brief scaffolds.",
    placeholder: "# Prompt library (mock)\n---\nname: default-brief\ncontent: |",
  },
  skills: {
    title: "skills/",
    hint: "Reusable task skills and adapters.",
    placeholder: "# Skills manifest (mock)\n- task-planning\n- workspace-read",
  },
  "agents-md": {
    title: "AGENTS.md",
    hint: "Core workspace instructions and identity for this agent.",
    placeholder: "# AGENTS.md\n\nYou are a ZetrixClaw general operations copilot...",
  },
  docs: {
    title: "docs/",
    hint: "Reference documentation linked from the workspace.",
    placeholder: "# Docs index (mock)",
  },
  scripts: {
    title: "scripts/",
    hint: "Scripts and tooling the agent may reference during execution.",
    placeholder: "#!/usr/bin/env bash\n# mock script",
  },
  briefs: {
    title: "briefs/",
    hint: "Saved execution briefs.",
    placeholder: "## Brief: (mock)\nObjective:\nSteps:",
  },
  configs: {
    title: "configs/",
    hint: "Configuration and environment snippets.",
    placeholder: "# config (mock)\nversion: 1",
  },
};

const VALID = new Set(Object.keys(SEGMENT_META));

export default function ZetrixClawWorkspaceFilePage() {
  const { agentId, segment } = useParams<{ agentId: string; segment: string }>();
  const navigate = useNavigate();
  const instance = loadZetrixClawAgentInstance();
  const meta = segment && VALID.has(segment) ? SEGMENT_META[segment] : null;

  const initialBody = useMemo(() => meta?.placeholder ?? "", [meta]);

  const [body, setBody] = useState(initialBody);

  useEffect(() => {
    setBody(initialBody);
  }, [initialBody, segment]);

  useEffect(() => {
    if (agentId !== ZETRIXCLAW_USER_AGENT_ID || !instance || !meta) {
      navigate("/studio/agents", { replace: true });
    }
  }, [agentId, instance, meta, navigate]);

  if (!instance || agentId !== ZETRIXCLAW_USER_AGENT_ID || !meta) {
    return null;
  }

  const agentName = instance.name?.trim() || "MyClaw";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/studio/agents/${ZETRIXCLAW_USER_AGENT_ID}/runtime`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to runtime
          </Link>
        </Button>
      </div>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{meta.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{meta.hint}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Agent: <span className="font-medium text-foreground">{agentName}</span> · ZetrixClaw workspace file
        </p>
      </div>
      <Textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        className="min-h-[320px] font-mono text-sm"
        spellCheck={false}
      />
      <div className="flex gap-2">
        <Button
          onClick={() => toast.success("Saved (mock)", { description: `${meta.title} — no backend persistence yet.` })}
        >
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button variant="outline" asChild>
          <Link to={`/studio/agents/${ZETRIXCLAW_USER_AGENT_ID}`}>Agent profile</Link>
        </Button>
      </div>
    </div>
  );
}
