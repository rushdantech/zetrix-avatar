import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AVATARCLAW_USER_AGENT_ID,
  loadAvatarClawAgentInstance,
} from "@/lib/studio/avatarclaw-agent-instance";
import { INTEGRATION_PLATFORM_META } from "@/lib/studio/avatarclaw-integration-platform-meta";
import {
  INTEGRATIONS_UPDATE_EVENT,
  PLATFORM_IDS,
  loadIntegrationStore,
  type PlatformId,
} from "@/lib/studio/avatarclaw-integrations-storage";
import { cn } from "@/lib/utils";

function useIntegrationsRefresh() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick(t => t + 1);
    window.addEventListener(INTEGRATIONS_UPDATE_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(INTEGRATIONS_UPDATE_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, []);
  return tick;
}

export default function AvatarClawIntegrationsPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const instance = loadAvatarClawAgentInstance();
  const runtimePath = `/studio/agents/${AVATARCLAW_USER_AGENT_ID}/runtime`;
  const workspacePath = `/studio/agents/${AVATARCLAW_USER_AGENT_ID}/workspace`;
  const baseIntegrations = `/studio/agents/${AVATARCLAW_USER_AGENT_ID}/integrations`;

  const refreshTick = useIntegrationsRefresh();
  const store = useMemo(() => loadIntegrationStore(), [refreshTick]);

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
              Link external accounts and manage what AvatarClaw can access.
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
        {PLATFORM_IDS.map((id: PlatformId) => {
          const item = INTEGRATION_PLATFORM_META[id];
          const connected = store.platforms[id]?.connected === true;
          const Icon = item.icon;
          const configPath = `${baseIntegrations}/${id}`;

          return (
            <li key={id}>
              <Link
                to={configPath}
                className={cn(
                  "flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors sm:flex-row sm:items-center sm:justify-between",
                  "hover:border-primary/30 hover:bg-muted/30",
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium leading-tight">{item.name}</p>
                      {connected ? (
                        <Badge className="bg-emerald-600/90 text-white hover:bg-emerald-600">Connected</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <span className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-md border border-input bg-secondary px-3 text-sm font-medium text-secondary-foreground sm:self-center">
                  {connected ? "Manage" : "Connect"}
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
