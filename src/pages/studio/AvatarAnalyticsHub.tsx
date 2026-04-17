import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

/**
 * Sidebar entry point: sends users to the first individual avatar’s analytics, or explains if none.
 */
export default function AvatarAnalyticsHub() {
  const { userStudioEntities } = useApp();
  const first = useMemo(
    () => userStudioEntities.find((e) => e.type === "individual"),
    [userStudioEntities],
  );

  if (first) {
    return <Navigate to={`/studio/avatars/${first.id}/analytics`} replace />;
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-border bg-card p-8 text-center shadow-card">
      <h1 className="text-lg font-semibold text-foreground">Analytics</h1>
      <p className="text-sm text-muted-foreground">
        Create an avatar first to view interaction reports.
      </p>
      <Link to="/studio/avatars/create" className="inline-block text-sm font-medium text-primary hover:underline">
        Create Avatar
      </Link>
    </div>
  );
}
