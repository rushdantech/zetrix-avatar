import type { ProfileSummaryData } from "@/features/job-agent/types";

export function ProfileSummary({ data }: { data: ProfileSummaryData }) {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-4 space-y-2">
      <h4 className="font-semibold text-sm">👤 Profile</h4>
      <p className="text-sm">{data.name}</p>
      <p className="text-xs text-muted-foreground">
        {data.role} · {data.years_experience} · {data.company}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {data.skills.map((skill) => (
          <span key={skill} className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">
            {skill}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{data.education}</p>
    </div>
  );
}
