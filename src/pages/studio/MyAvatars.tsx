import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { AvatarCard } from "@/components/studio/AvatarCard";
import { useApp } from "@/contexts/AppContext";
import { mockStudioEntities } from "@/data/studio/mock-avatars";
import type { StudioEntity } from "@/types/studio";

type Tab = "all" | "individual" | "enterprise";

export default function MyAvatars() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userStudioEntities } = useApp();
  const [zidReminderOpen, setZidReminderOpen] = useState(
    () => Boolean((location.state as { showNoZidBanner?: boolean })?.showNoZidBanner),
  );
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const { data = [] } = useQuery({
    queryKey: ["studio-avatars"],
    queryFn: () => new Promise<StudioEntity[]>((resolve) => setTimeout(() => resolve(mockStudioEntities), 500)),
  });

  const merged = useMemo(() => [...userStudioEntities, ...data], [userStudioEntities, data]);

  const filtered = useMemo(() => {
    let rows = merged.filter((r) => tab === "all" || r.type === tab);
    if (search.trim()) rows = rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
    rows = [...rows].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "oldest") return a.created_at.localeCompare(b.created_at);
      if (sort === "status") return a.status.localeCompare(b.status);
      return b.created_at.localeCompare(a.created_at);
    });
    return rows;
  }, [merged, search, sort, tab]);

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
          <h1 className="text-2xl font-bold">My Avatars</h1>
          <p className="text-sm text-muted-foreground">Manage individual avatars and enterprise agents.</p>
        </div>
        <button onClick={() => navigate("/studio/avatars/create")} className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground">Create Avatar</button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "individual", "enterprise"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-3 py-1 text-xs capitalize ${tab === t ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{t === "individual" ? "Individual Avatars" : t === "enterprise" ? "Enterprise Agents" : "All"}</button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search avatars..." className="w-full rounded-lg border border-border bg-secondary py-2 pl-9 pr-3 text-sm" />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name</option>
          <option value="status">Status</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {tab === "individual"
            ? "No individual avatars yet. Create one to list it on the marketplace for subscribers."
            : tab === "enterprise"
            ? "No enterprise agents yet. Create a task agent to automate business operations."
            : "No avatars found."}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((entity) => <AvatarCard key={entity.id} entity={entity} />)}
        </div>
      )}
    </div>
  );
}
