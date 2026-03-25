import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { AvatarCard } from "@/components/studio/AvatarCard";
import { useApp } from "@/contexts/AppContext";
import { mockStudioEntities } from "@/data/studio/mock-avatars";
import { mergeStudioWithOverrides } from "@/lib/studio/merge-studio-lists";
import type { StudioEntity } from "@/types/studio";

export default function MyAvatars() {
  const navigate = useNavigate();
  const { userStudioEntities, studioEntityOverrides, removedStudioEntityIds, removeStudioEntity } = useApp();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const { data = [] } = useQuery({
    queryKey: ["studio-avatars"],
    queryFn: () => new Promise<StudioEntity[]>((resolve) => setTimeout(() => resolve(mockStudioEntities), 500)),
  });

  const removedSet = useMemo(() => new Set(removedStudioEntityIds), [removedStudioEntityIds]);
  const merged = useMemo(
    () => mergeStudioWithOverrides(userStudioEntities, data, studioEntityOverrides, removedSet),
    [userStudioEntities, data, studioEntityOverrides, removedSet],
  );

  const filtered = useMemo(() => {
    let rows = merged.filter((r) => r.type === "individual");
    if (search.trim()) rows = rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
    rows = [...rows].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "oldest") return a.created_at.localeCompare(b.created_at);
      if (sort === "status") return a.status.localeCompare(b.status);
      return b.created_at.localeCompare(a.created_at);
    });
    return rows;
  }, [merged, search, sort]);

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Avatars</h1>
          <p className="text-sm text-muted-foreground">
            Creator-style personas for Marketplace, chat, and Content Studio.
          </p>
        </div>
        <button
          onClick={() => navigate("/studio/avatars/create")}
          className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Create Avatar
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search avatars..."
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
          No avatars yet. Create one to list it on the marketplace for subscribers.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((entity) => (
            <AvatarCard
              key={entity.id}
              entity={entity}
              onDelete={() => {
                if (!window.confirm(`Delete “${entity.name}”? This removes the avatar.`)) return;
                removeStudioEntity(entity.id);
                toast.success("Avatar removed");
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
