import type { PreferencesSummaryData } from "@/features/job-agent/types";

interface PreferencesSummaryProps {
  data: PreferencesSummaryData;
  onEditPreferences: () => void;
}

export function PreferencesSummary({ data, onEditPreferences }: PreferencesSummaryProps) {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-4 space-y-2">
      <h4 className="font-semibold text-sm">🔍 Job Preferences</h4>
      <p className="text-xs"><span className="text-muted-foreground">Roles:</span> {data.roles.join(", ")}</p>
      <p className="text-xs"><span className="text-muted-foreground">Industry:</span> {data.industry}</p>
      <p className="text-xs"><span className="text-muted-foreground">Location:</span> {data.location}</p>
      <p className="text-xs"><span className="text-muted-foreground">Min salary:</span> {data.min_salary}</p>
      <p className="text-xs"><span className="text-muted-foreground">Work mode:</span> {data.work_mode}</p>
      <button onClick={onEditPreferences} className="rounded-md bg-secondary px-3 py-1.5 text-xs font-medium">
        Edit Preferences
      </button>
    </div>
  );
}
