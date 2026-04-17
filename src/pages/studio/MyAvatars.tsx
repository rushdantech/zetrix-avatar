import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { AvatarCard } from "@/components/studio/AvatarCard";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";

export default function MyAvatars() {
  const navigate = useNavigate();
  const { removeStudioEntity } = useApp();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const merged = useMergedStudioEntities();

  const individuals = useMemo(() => merged.filter((r) => r.type === "individual"), [merged]);

  const filtered = useMemo(() => {
    let rows = [...individuals];
    if (searchQuery.trim()) rows = rows.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    rows.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "oldest") return a.created_at.localeCompare(b.created_at);
      if (sort === "status") return a.status.localeCompare(b.status);
      return b.created_at.localeCompare(a.created_at);
    });
    return rows;
  }, [individuals, searchQuery, sort]);

  function onSearchSubmit(e: FormEvent) {
    e.preventDefault();
    setSearchQuery(searchInput);
  }

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
      <form className="flex flex-wrap items-center gap-2" onSubmit={onSearchSubmit}>
        <div className="relative min-w-0 flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search avatars..."
            className="w-full rounded-lg border border-border bg-secondary py-2 pl-9 pr-3 text-sm"
            aria-label="Search avatars"
          />
        </div>
        <Button type="submit" variant="secondary" className="shrink-0">
          Search
        </Button>
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
      </form>
      {individuals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No avatars yet. Create one to list it on the marketplace for subscribers.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No avatars match your search.
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
