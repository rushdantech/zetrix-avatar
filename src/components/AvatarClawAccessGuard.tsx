import { useLocation, useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { AVATARCLAW_USER_AGENT_ID } from "@/lib/studio/avatarclaw-agent-instance";

function isAvatarClawCreatePath(pathname: string): boolean {
  if (pathname === "/studio/agents/create") return true;
  return /^\/studio\/agents\/create\/step\/\d+$/.test(pathname);
}

export default function AvatarClawAccessGuard({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const params = useParams();
  const { hasActiveProAccess, openProUpgradePaywall } = useApp();

  const entityId = params.agentId ?? params.id;
  const isEnterpriseBranch = pathname.startsWith("/studio/agents/create/enterprise");
  const needsPro =
    (!isEnterpriseBranch && isAvatarClawCreatePath(pathname)) || entityId === AVATARCLAW_USER_AGENT_ID;

  if (!needsPro) return <>{children}</>;
  if (hasActiveProAccess) return <>{children}</>;

  return (
    <div className="mx-auto flex min-h-[min(70vh,640px)] max-w-lg flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted/40">
        <Lock className="h-7 w-7 text-muted-foreground" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">AvatarClaw is a Pro feature</h1>
        <p className="text-sm text-muted-foreground">
          Upgrade to Pro to create and manage AvatarClaw services.
        </p>
      </div>
      <Button type="button" size="lg" onClick={openProUpgradePaywall}>
        Upgrade to Pro – USD 39.99
      </Button>
    </div>
  );
}
