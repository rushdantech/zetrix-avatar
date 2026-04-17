import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
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
import { format, parseISO } from "date-fns";
import { useApp } from "@/contexts/AppContext";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";
import { studioEntityPath } from "@/lib/studio/studio-paths";
import { cn } from "@/lib/utils";
import type { StudioEntityIndividual } from "@/types/studio";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/identity/StatusBadge";

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

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Avatar Studio</h1>
          <p className="text-sm text-muted-foreground">Your avatar — view details and open the full profile editor.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr_300px]">
        {/* Left: quick actions (Studio-v2–style controls column) */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              Actions
            </h3>
            <p className="text-xs text-muted-foreground">
              You can have one personal avatar. Edit it anytime from the full profile screen.
            </p>
            <Button asChild className="w-full" variant="default">
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

        {/* Center: “gallery” — single avatar tile */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Your avatar</h3>
          </div>
          <div className="rounded-xl border border-border bg-secondary/30 p-8 text-center">
            <div
              className={cn(
                "mx-auto flex h-36 w-36 items-center justify-center rounded-2xl text-4xl font-bold shadow-inner",
                "bg-primary/15 text-primary",
              )}
            >
              {entity.name.charAt(0)}
            </div>
            <p className="mt-4 text-lg font-semibold text-foreground">{entity.name}</p>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{entity.description}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <StatusBadge status={entity.status} />
            </div>
          </div>
        </div>

        {/* Right: details panel (aligned with Studio-v2 detail column) */}
        <div className="flex max-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-xl border border-border bg-card p-4 shadow-card">
          <div className="flex flex-col gap-4 overflow-y-auto">
            <h3 className="text-sm font-bold text-foreground shrink-0">{entity.name}</h3>

            <div className="aspect-video shrink-0 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
              <User className="h-14 w-14 text-muted-foreground" />
            </div>

            <div className="shrink-0 space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5" />
                Bio
              </label>
              <p className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm leading-relaxed text-foreground">
                {setup.bio || "—"}
              </p>
            </div>

            {setup.avatarArchetype ? (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Archetype:</span> {setup.avatarArchetype}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-1.5 shrink-0">
              {setup.styleTags.slice(0, 8).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="text-xs text-muted-foreground space-y-1 shrink-0 border-t border-border pt-3">
              <p className="flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                Training photos: <span className="text-foreground">{setup.photoCount}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mic className="h-3.5 w-3.5 shrink-0" />
                Voice cloning:{" "}
                <span className="text-foreground">{setup.voiceCloningEnabled ? "Enabled" : "Off"}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                RAG documents: <span className="text-foreground">{setup.ragDocuments.length}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                MyDigital ID:{" "}
                <span className="text-foreground">{setup.mydigitalEkycVerified ? "Verified" : "Not verified"}</span>
              </p>
              <p>
                Created:{" "}
                <span className="text-foreground">{format(parseISO(entity.created_at), "MMM d, yyyy · h:mm a")}</span>
              </p>
            </div>

            <Button asChild className="w-full shrink-0 gap-2 gradient-primary text-primary-foreground shadow-glow">
              <Link to={detailPath}>
                <Pencil className="h-4 w-4" />
                Edit profile
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
