import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { useMergedStudioEntities } from "@/hooks/useMergedStudioEntities";

/**
 * Sidebar entry: first individual avatar’s tabbed Rev profile, or empty state.
 */
export default function MyAvatarV2Hub() {
  const merged = useMergedStudioEntities();
  const first = useMemo(
    () => merged.find((e) => e.type === "individual"),
    [merged],
  );

  if (first) {
    return <Navigate to={`/studio/my-avatar-v2/${first.id}`} replace />;
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-border bg-card p-8 text-center shadow-card">
      <h1 className="text-lg font-semibold text-foreground">My Avatar (Rev)</h1>
      <p className="text-sm text-muted-foreground">
        Create an avatar first to open the tabbed profile (dev preview).
      </p>
      <Link to="/studio/avatars/create" className="inline-block text-sm font-medium text-primary hover:underline">
        Create Avatar
      </Link>
    </div>
  );
}
