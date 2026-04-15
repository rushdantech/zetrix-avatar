import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Plug } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AVATARCLAW_USER_AGENT_ID,
  loadAvatarClawAgentInstance,
} from "@/lib/studio/avatarclaw-agent-instance";

const INTEGRATIONS: { id: string; name: string; description: string }[] = [
  { id: "reddit", name: "Reddit", description: "Post, monitor, and moderate subreddits from AvatarClaw." },
  { id: "x", name: "X", description: "Draft posts, replies, and lists on X (Twitter)." },
  { id: "telegram", name: "Telegram", description: "Bots and channels for alerts and two-way chat." },
  { id: "gmail", name: "Gmail", description: "Read, label, and send mail with your connected account." },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Create events, check availability, and send invites.",
  },
  { id: "whatsapp", name: "WhatsApp", description: "Business messaging and session-based workflows." },
  { id: "discord", name: "Discord", description: "Server tools, roles, and channel automation." },
];

export default function AvatarClawIntegrationsPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const instance = loadAvatarClawAgentInstance();
  const runtimePath = `/studio/agents/${AVATARCLAW_USER_AGENT_ID}/runtime`;
  const workspacePath = `/studio/agents/${AVATARCLAW_USER_AGENT_ID}/workspace`;

  useEffect(() => {
    if (agentId !== AVATARCLAW_USER_AGENT_ID || !instance) {
      navigate("/studio/agents", { replace: true });
    }
  }, [agentId, instance, navigate]);

  if (!instance || agentId !== AVATARCLAW_USER_AGENT_ID) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col gap-0 lg:min-h-[calc(100dvh-5rem)]">
      <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link to="/studio/agents" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Integrations and Plugins</h1>
            <p className="text-sm text-muted-foreground">
              Connect AvatarClaw to external platforms (prototype — Connect is a mock).
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button variant="outline" size="sm" asChild>
            <Link to={workspacePath}>Open workspace</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to={runtimePath}>Back to Chat</Link>
          </Button>
        </div>
      </header>

      <ul className="mt-4 space-y-2">
        {INTEGRATIONS.map(item => (
          <li
            key={item.id}
            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Plug className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-medium leading-tight">{item.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="shrink-0 sm:self-center"
              onClick={() =>
                toast.message(`${item.name} (mock)`, {
                  description: "OAuth and webhooks are not wired in this prototype.",
                })
              }
            >
              Connect
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
