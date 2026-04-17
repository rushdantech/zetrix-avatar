import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";
import { IndividualAvatarAnalyticsPanel } from "@/components/studio/IndividualAvatarAnalyticsPanel";
import type { StudioEntity, StudioEntityIndividual } from "@/types/studio";
import { studioEntityPath } from "@/lib/studio/studio-paths";

export default function AvatarAnalyticsPage() {
  const { id } = useParams();
  const merged = useMergedStudioEntities();
  const entity = useMemo(() => {
    const e = merged.find((d) => d.id === id) as StudioEntity | undefined;
    return e?.type === "individual" ? (e as StudioEntityIndividual) : undefined;
  }, [merged, id]);

  if (!entity) {
    return (
      <div className="space-y-4 pb-20">
        <p className="text-sm text-muted-foreground">Avatar not found.</p>
        <Link to="/studio/avatars" className="text-sm font-medium text-primary hover:underline">
          ← My Avatars
        </Link>
      </div>
    );
  }

  const profilePath = studioEntityPath(entity);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={profilePath}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Avatar Management
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">{entity.name}</p>
      </div>
      <IndividualAvatarAnalyticsPanel entity={entity} />
    </div>
  );
}
