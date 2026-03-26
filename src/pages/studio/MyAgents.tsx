import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { AvatarCard } from "@/components/studio/AvatarCard";
import { AgentTaskChatPanel } from "@/components/studio/AgentTaskChatPanel";
import { useApp } from "@/contexts/AppContext";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";
import type { StudioEntityEnterprise } from "@/types/studio";

export default function MyAgents() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const locationState = location.state as { showNoZidBanner?: boolean; openTaskChatAgentId?: string } | null;
  const { removeStudioEntity } = useApp();
  const [zidReminderOpen, setZidReminderOpen] = useState(
    () => Boolean(locationState?.showNoZidBanner),
  );
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const merged = useMergedStudioEntities();
  const taskChatAgentId = searchParams.get("chat");

  useEffect(() => {
    const requested = locationState?.openTaskChatAgentId;
    if (!requested) return;
    navigate(
      {
        pathname: "/studio/agents",
        search: `?chat=${encodeURIComponent(requested)}`,
      },
      { replace: true, state: { showNoZidBanner: locationState?.showNoZidBanner } },
    );
  }, [locationState, navigate]);

  const filtered = useMemo(() => {
    let rows = merged.filter((r) => r.type === "enterprise");
    if (search.trim()) rows = rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
    rows = [...rows].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "oldest") return a.created_at.localeCompare(b.created_at);
      if (sort === "status") return a.status.localeCompare(b.status);
      return b.created_at.localeCompare(a.created_at);
    });
    return rows;
  }, [merged, search, sort]);

  const taskChatEntity = useMemo(
    () =>
      merged.find((e): e is StudioEntityEnterprise => e.id === taskChatAgentId && e.type === "enterprise"),
    [merged, taskChatAgentId],
  );

  useEffect(() => {
    if (taskChatAgentId && !taskChatEntity) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("chat");
        return next;
      }, { replace: true });
    }
  }, [taskChatAgentId, taskChatEntity, setSearchParams]);

  const closeTaskChat = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("chat");
      return next;
    }, { replace: true });
  };

  if (taskChatEntity) {
    return (
      <div className="pb-20 lg:pb-0">
        <AgentTaskChatPanel agent={taskChatEntity} onClose={closeTaskChat} />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      {zidReminderOpen && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
          <span className="text-muted-foreground">This agent has no digital identity yet.</span>
          <div className="flex items-center gap-2">
            <Link to="/identity/agents" className="font-medium text-primary hover:underline">
              Set up now →
            </Link>
            <button type="button" onClick={() => setZidReminderOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">
              Dismiss
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Agents</h1>
          <p className="text-sm text-muted-foreground">
            AI agents for enterprise workflows or personal automation — identity, tools, and marketplace listings. Use{" "}
            <span className="font-medium text-foreground">Chat with Agent</span> on a card to brief an agent and lock tasks.
          </p>
        </div>
        <button
          onClick={() => navigate("/studio/agents/create")}
          className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Create Agent
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="w-full rounded-lg border border-border bg-secondary py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name</option>
          <option value="status">Status</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No AI agents yet. Create one for business operations or personal automation.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((entity) => (
            <AvatarCard
              key={entity.id}
              entity={entity}
              onTaskChat={() =>
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set("chat", entity.id);
                  return next;
                })
              }
              onDelete={() => {
                if (!window.confirm(`Delete “${entity.name}”? This removes the agent.`)) return;
                removeStudioEntity(entity.id);
                if (taskChatAgentId === entity.id) closeTaskChat();
                toast.success("Agent removed");
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
