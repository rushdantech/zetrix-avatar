import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Hash,
  Image as ImageIcon,
  MessageCircle,
  Mic,
  Pencil,
  ShieldCheck,
  Sparkles,
  Type,
  User,
  Wand2,
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { useApp } from "@/contexts/AppContext";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";
import { studioEntityPath } from "@/lib/studio/studio-paths";
import { cn } from "@/lib/utils";
import type { StudioEntityIndividual } from "@/types/studio";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/identity/StatusBadge";

function safeFormatCreated(iso: string | undefined): string {
  if (!iso?.trim()) return "—";
  try {
    const d = parseISO(iso);
    return isValid(d) ? format(d, "MMM d, yyyy · h:mm a") : "—";
  } catch {
    return "—";
  }
}

export default function MyAvatars() {
  const navigate = useNavigate();
  const { removeStudioEntity, userStudioEntities } = useApp();
  const merged = useMergedStudioEntities();

  const myIndividual = useMemo((): StudioEntityIndividual | null => {
    const list = userStudioEntities.filter((e): e is StudioEntityIndividual => e.type === "individual");
    return list[0] ?? null;
  }, [userStudioEntities]);

  const entity = useMemo(() => {
    if (!myIndividual) return null;
    return merged.find((m) => m.id === myIndividual.id) ?? myIndividual;
  }, [merged, myIndividual]);

  const setup = entity?.type === "individual" ? entity.individualSetup : null;
  const detailPath = entity ? studioEntityPath(entity) : "/studio/avatars";

  const styleTags = Array.isArray(setup?.styleTags) ? setup.styleTags : [];
  const ragCount = Array.isArray(setup?.ragDocuments) ? setup.ragDocuments.length : 0;

  if (!entity || !setup) {
    return (
      <div className="space-y-4 pb-20 lg:pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Avatar Studio</h1>
            <p className="text-sm text-muted-foreground">
              Create your avatar once—then manage it here and on the Marketplace.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
          <User className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No avatar yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Use <strong className="text-foreground">Create Avatar</strong> in the sidebar to set up your persona, photos,
            and preferences.
          </p>
          <Button asChild className="mt-6 gap-2 gradient-primary text-primary-foreground shadow-glow">
            <Link to="/studio/avatars/create">
              <Sparkles className="h-4 w-4" />
              Create Avatar
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const createdLabel = safeFormatCreated(entity.created_at);

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      {/* Match Studio-v2 / Content Studio header pattern */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Avatar Studio</h1>
          <p className="text-sm text-muted-foreground">View your avatar, open the full profile editor, or remove it.</p>
        </div>
      </div>

      {/* Studio-v2 grid: controls | gallery | details */}
      <div className="grid min-h-0 gap-4 lg:grid-cols-[280px_1fr_300px]">
        {/* Left: actions (mirrors “Create content” column in Studio-v2) */}
        <div className="min-h-0 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              Your avatar
            </h3>
            <p className="text-xs text-muted-foreground">
              One personal avatar per account. Use the profile screen to edit listing, bio, and setup tabs.
            </p>
            <Button asChild className="w-full gap-2 gradient-primary text-primary-foreground shadow-glow hover:opacity-95">
              <Link to={detailPath}>Open full profile</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                if (!window.confirm(`Remove “${entity.name}” from this device? You can create a new avatar afterward.`))
                  return;
                removeStudioEntity(entity.id);
                toast.success("Avatar removed.");
                navigate("/studio/avatars", { replace: true });
              }}
            >
              Remove avatar
            </Button>
          </div>
        </div>

        {/* Center: gallery strip (single tile, Studio-v2 gallery styling) */}
        <div className="min-h-0">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Preview</h3>
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 p-6 text-center shadow-sm">
            <button
              type="button"
              onClick={() => navigate(detailPath)}
              className="mx-auto flex w-full max-w-[200px] flex-col items-center rounded-xl border border-border bg-card p-4 text-left shadow-card transition-all hover:border-primary/40 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div
                className={cn(
                  "flex h-28 w-28 items-center justify-center rounded-2xl text-3xl font-bold shadow-inner",
                  "bg-primary/15 text-primary",
                )}
              >
                {(entity.name.trim() || "?").charAt(0)}
              </div>
              <p className="mt-3 line-clamp-2 w-full text-center text-sm font-semibold text-foreground">{entity.name}</p>
              <p className="mt-1 line-clamp-2 w-full text-center text-[11px] text-muted-foreground">{entity.description}</p>
            </button>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <StatusBadge value={entity.status} />
              <StatusBadge value="avatar" />
            </div>
          </div>
        </div>

        {/* Right: details (Studio-v2 detail column: card, scroll, metadata) */}
        <div className="flex min-h-0 max-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-xl border border-border bg-card p-4 shadow-card">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
            <h3 className="shrink-0 text-sm font-bold text-foreground">{entity.name}</h3>

            <div className="aspect-video shrink-0 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
              <User className="h-12 w-12 text-muted-foreground" aria-hidden />
            </div>

            <div className="shrink-0 space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                <Type className="h-3.5 w-3.5" />
                Bio
              </label>
              <p className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm leading-relaxed text-foreground">
                {setup.bio?.trim() || "—"}
              </p>
            </div>

            {setup.avatarArchetype ? (
              <p className="shrink-0 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Archetype:</span> {setup.avatarArchetype}
              </p>
            ) : null}

            {styleTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 shrink-0">
                <span className="sr-only">Style tags</span>
                {styleTags.slice(0, 12).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Hash className="h-3.5 w-3.5 shrink-0 opacity-70" />
                No style tags
              </p>
            )}

            <div className="shrink-0 space-y-0.5 border-t border-border pt-3 text-xs text-muted-foreground">
              <p>
                <span className="inline-flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                  Training photos:
                </span>{" "}
                <span className="text-foreground">{setup.photoCount ?? 0}</span>
              </p>
              <p>
                <span className="inline-flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5 shrink-0" />
                  Voice cloning:
                </span>{" "}
                <span className="text-foreground">{setup.voiceCloningEnabled ? "Enabled" : "Off"}</span>
              </p>
              <p>
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                  RAG documents:
                </span>{" "}
                <span className="text-foreground">{ragCount}</span>
              </p>
              <p>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  MyDigital ID:
                </span>{" "}
                <span className="text-foreground">{setup.mydigitalEkycVerified ? "Verified" : "Not verified"}</span>
              </p>
              <p>
                Created: <span className="text-foreground">{createdLabel}</span>
              </p>
            </div>

            <Button asChild className="mt-auto w-full shrink-0 gap-2 gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              <Link to={detailPath}>
                <Pencil className="h-4 w-4" aria-hidden />
                Edit profile
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
