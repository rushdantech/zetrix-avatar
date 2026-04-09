import { ListTree, MessageCircle, Pencil, Send, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { studioEntityPath } from "@/lib/studio/studio-paths";
import { ZETRIXCLAW_USER_AGENT_ID } from "@/lib/studio/zetrixclaw-agent-instance";
import type { StudioEntity } from "@/types/studio";
import { StatusBadge } from "@/components/identity/StatusBadge";
import { ZIDBadge } from "./ZIDBadge";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

export function AvatarCard({
  entity,
  onTaskChat,
  onDelete,
}: {
  entity: StudioEntity;
  /** Enterprise only: opens task chat (e.g. My Agents). */
  onTaskChat?: () => void;
  /** When set, shows a delete control (e.g. My Agents). */
  onDelete?: () => void;
}) {
  const navigate = useNavigate();
  const { setAgentMarketplacePublished, userStudioEntities } = useApp();
  const detailPath = studioEntityPath(entity);
  const isZetrixClaw = entity.id === ZETRIXCLAW_USER_AGENT_ID;
  const isUserOwnedAgent = userStudioEntities.some((e) => e.id === entity.id);
  const showPrebuiltTag = entity.type === "enterprise" && !isZetrixClaw && !isUserOwnedAgent;
  const isPublished = entity.status === "published";
  const toggleMarketplace = () => {
    setAgentMarketplacePublished(entity.id, !isPublished);
    toast.success(
      isPublished ? `${entity.name} removed from Marketplace` : `${entity.name} is listed on Marketplace`,
    );
  };
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-card",
        isZetrixClaw && "border-primary/35 bg-primary/[0.04] ring-1 ring-primary/15 shadow-glow",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to={detailPath} className="line-clamp-1 text-sm font-semibold hover:underline">{entity.name}</Link>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{entity.description}</p>
        </div>
        {onDelete ? (
          <button
            type="button"
            aria-label={entity.type === "enterprise" ? "Delete agent" : "Delete avatar"}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <StatusBadge value={entity.status} />
        <StatusBadge value={entity.type === "individual" ? "avatar" : "agent"} />
        {isZetrixClaw && (
          <>
            <Badge variant="secondary" className="border border-primary/25 bg-primary/10 font-semibold text-primary">
              Your Agent
            </Badge>
            <Badge variant="outline" className="font-medium">
              Custom
            </Badge>
          </>
        )}
        {showPrebuiltTag && (
          <Badge variant="outline" className="font-medium text-muted-foreground">
            Prebuilt
          </Badge>
        )}
        {entity.type === "enterprise" && <ZIDBadge credentialed={entity.zid_credentialed} />}
      </div>
      <div className="flex flex-wrap gap-2">
        {entity.type === "enterprise" && onTaskChat && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTaskChat();
            }}
            className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/15"
          >
            <MessageCircle className="mr-1 inline h-3 w-3" />
            Chat with Agent
          </button>
        )}
        {entity.type === "enterprise" && (
          <Link
            to={`/studio/agents/${entity.id}/logs`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
          >
            <ListTree className="mr-1 h-3 w-3" />
            Activity Log
          </Link>
        )}
        <button onClick={() => navigate(detailPath)} className="rounded-lg bg-secondary px-3 py-1.5 text-xs">
          <Pencil className="mr-1 inline h-3 w-3" />
          Profile
        </button>
        <button type="button" onClick={toggleMarketplace} className="rounded-lg gradient-primary px-3 py-1.5 text-xs text-primary-foreground">
          <Send className="mr-1 inline h-3 w-3" />
          {isPublished ? "Unpublish" : "Publish"}
        </button>
      </div>
    </div>
  );
}
