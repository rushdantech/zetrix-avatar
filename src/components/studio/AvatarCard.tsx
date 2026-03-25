import { ListTree, MessageCircle, MoreHorizontal, Pencil, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { studioEntityPath } from "@/lib/studio/studio-paths";
import type { StudioEntity } from "@/types/studio";
import { StatusBadge } from "@/components/identity/StatusBadge";
import { ZIDBadge } from "./ZIDBadge";

export function AvatarCard({
  entity,
  onTaskChat,
}: {
  entity: StudioEntity;
  /** Enterprise only: opens task chat (e.g. My Agents). */
  onTaskChat?: () => void;
}) {
  const navigate = useNavigate();
  const detailPath = studioEntityPath(entity);
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to={detailPath} className="line-clamp-1 text-sm font-semibold hover:underline">{entity.name}</Link>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{entity.description}</p>
        </div>
        <button className="rounded p-1.5 hover:bg-secondary"><MoreHorizontal className="h-4 w-4" /></button>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <StatusBadge value={entity.status} />
        <StatusBadge value={entity.type === "individual" ? "published" : "active"} />
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
            Task chat
          </button>
        )}
        {entity.type === "enterprise" && (
          <Link
            to={`/studio/agents/${entity.id}/logs`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
          >
            <ListTree className="mr-1 h-3 w-3" />
            Logs
          </Link>
        )}
        <button onClick={() => navigate(detailPath)} className="rounded-lg bg-secondary px-3 py-1.5 text-xs"><Pencil className="mr-1 inline h-3 w-3" />Edit</button>
        <button type="button" className="rounded-lg gradient-primary px-3 py-1.5 text-xs text-primary-foreground"><Send className="mr-1 inline h-3 w-3" />{entity.status === "published" ? "Unpublish" : "Publish"}</button>
        {entity.type === "enterprise" && !entity.zid_credentialed && (
          <button onClick={() => navigate(`/identity/agents/credential/${entity.id}`)} className="rounded-lg bg-secondary px-3 py-1.5 text-xs">Credential with ZID</button>
        )}
      </div>
    </div>
  );
}
