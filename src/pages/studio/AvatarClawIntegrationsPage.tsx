import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  AtSign,
  Calendar,
  Mail,
  MessageCircle,
  MessagesSquare,
  Phone,
  Plug,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AVATARCLAW_USER_AGENT_ID,
  loadAvatarClawAgentInstance,
} from "@/lib/studio/avatarclaw-agent-instance";

type IntegrationId =
  | "reddit"
  | "x"
  | "telegram"
  | "gmail"
  | "google-calendar"
  | "whatsapp"
  | "discord";

const INTEGRATIONS: {
  id: IntegrationId;
  name: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    id: "reddit",
    name: "Reddit",
    description: "Monitor subreddits, reply to threads, and surface community signals in chat.",
    icon: MessageCircle,
  },
  {
    id: "x",
    name: "X",
    description: "Post updates, read mentions, and sync lightweight social context into AvatarClaw.",
    icon: AtSign,
  },
  {
    id: "telegram",
    name: "Telegram",
    description: "Bridge Telegram bots and group updates into your AvatarClaw runtime.",
    icon: Send,
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Ingest summaries of threads and labels for task-aware follow-ups (read-only mock).",
    icon: Mail,
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Align deadlines and meetings with execution plans and reminders.",
    icon: Calendar,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Route approved business messages and handoffs into the copilot workflow.",
    icon: Phone,
  },
  {
    id: "discord",
    name: "Discord",
    description: "Connect server channels for ops alerts and team coordination stubs.",
    icon: MessagesSquare,
  },
];

export default function AvatarClawIntegrationsPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const instance = loadAvatarClawAgentInstance();
  const runtimePath = `/studio/agents/${AVATARCLAW_USER_AGENT_ID}/runtime`;

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
            <h1 className="text-xl font-semibold tracking-tight">Integrations &amp; plugins</h1>
            <p className="text-sm text-muted-foreground">
              AvatarClaw · connect external platforms (prototype — no live OAuth)
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button size="sm" variant="outline" asChild>
            <Link to={`/studio/agents/${AVATARCLAW_USER_AGENT_ID}/workspace`}>Open workspace</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to={runtimePath}>Back to Chat</Link>
          </Button>
        </div>
      </header>

      <div className="mt-4 flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-card">
        <div className="border-b border-border/80 bg-muted/25 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Available integrations</p>
          <p className="text-xs text-muted-foreground">
            Choose a platform to start a guided connection flow. In this build, actions are simulated.
          </p>
        </div>
        <ScrollArea className="h-[min(60vh,520px)] flex-1 lg:h-[min(calc(100dvh-18rem),640px)]">
          <ul className="divide-y divide-border/80 p-2 sm:p-3">
            {INTEGRATIONS.map(({ id, name, description, icon: Icon }) => (
              <li key={id}>
                <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-2">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background shadow-sm">
                      <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{name}</p>
                      <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className={cn("shrink-0 sm:w-auto", "w-full sm:min-w-[7.5rem]")}
                    onClick={() =>
                      toast.message(`Connect ${name}`, {
                        description: "OAuth and webhooks are not wired in this prototype.",
                      })
                    }
                  >
                    <Plug className="mr-2 h-4 w-4" aria-hidden />
                    Connect
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
    </div>
  );
}
